const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3002;
const KEY_PATH = path.join(__dirname, '..', 'valiant-epsilon-501913-g2-8231aeffe623.json');
const CAL_ID = 'dc16a29b27611448569f6f342e1e982aa44e6c6bfa3b3ca7d2fe180c4231748b@group.calendar.google.com';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1767318.hstgr.cloud/webhook/vapi-dental-triage';

let serviceAccount = null;
try {
  serviceAccount = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
  console.log(`[Google Auth] Loaded service account: ${serviceAccount.client_email}`);
} catch (e) {
  console.error('[Google Auth] Error loading service account key:', e.message);
}

// Cached Google OAuth Access Token
let cachedToken = null;
let tokenExpiry = 0;

async function getGoogleAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < tokenExpiry - 60) {
    return cachedToken;
  }

  const iat = now;
  const exp = now + 3600;

  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
    aud: 'https://oauth2.googleapis.com/token',
    exp,
    iat
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url');
  const signatureInput = `${b64Header}.${b64Claim}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(serviceAccount.private_key, 'base64url');
  const jwt = `${signatureInput}.${signature}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const data = await res.json();
  if (data.access_token) {
    cachedToken = data.access_token;
    tokenExpiry = exp;
    return cachedToken;
  }
  throw new Error(`Failed to obtain Google token: ${JSON.stringify(data)}`);
}

// Helper: Parse natural language date/time into start & end ISO strings
function parseSlotToIso(dateStr, timeStr) {
  const d = (dateStr || 'tomorrow').toLowerCase();
  const t = (timeStr || '10:00 AM').toLowerCase();

  let targetDate = new Date();

  if (d.includes('tomorrow')) {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (d.includes('day after tomorrow')) {
    targetDate.setDate(targetDate.getDate() + 2);
  } else if (d.includes('today')) {
    // today
  } else {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = targetDate.getDay();
    const targetDay = days.findIndex(day => d.includes(day));
    if (targetDay !== -1) {
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7;
      targetDate.setDate(targetDate.getDate() + diff);
    }
  }

  let hour = 10;
  let minute = 0;
  const timeMatch = t.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch) {
    hour = parseInt(timeMatch[1], 10);
    minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const ampm = (timeMatch[3] || '').toUpperCase();
    if (ampm === 'PM' && hour < 12) hour += 12;
    if (ampm === 'AM' && hour === 12) hour = 0;
  }

  targetDate.setHours(hour, minute, 0, 0);

  const startIso = targetDate.toISOString();
  const endDate = new Date(targetDate);
  endDate.setMinutes(endDate.getMinutes() + 45); // Standard 45-minute dental slot
  const endIso = endDate.toISOString();

  const formattedDate = targetDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formattedTime = targetDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  return { startIso, endIso, formattedDate, formattedTime };
}

// 1. Check Google Calendar Availability (FreeBusy)
async function checkAvailability(startIso, endIso) {
  const token = await getGoogleAccessToken();
  const res = await fetch('https://www.googleapis.com/calendar/v3/freeBusy', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      timeMin: startIso,
      timeMax: endIso,
      timeZone: 'Asia/Karachi',
      items: [{ id: CAL_ID }]
    })
  });

  const data = await res.json();
  const busy = data.calendars?.[CAL_ID]?.busy || [];
  return {
    isAvailable: busy.length === 0,
    busySlots: busy
  };
}

// 2. Book Event into Google Calendar
async function createCalendarEvent({ patientName, phone, service, triage, startIso, endIso }) {
  const token = await getGoogleAccessToken();
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary: `🦷 ${triage}: ${patientName}`,
      description: `Patient: ${patientName}\nPhone: ${phone}\nService / Reason: ${service}\nClinical Status: ${triage}\nBooked by: Apex Dental Voicebot (Day 3 Sprint)`,
      start: { dateTime: startIso, timeZone: 'Asia/Karachi' },
      end: { dateTime: endIso, timeZone: 'Asia/Karachi' },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 30 },
          { method: 'email', minutes: 60 }
        ]
      }
    })
  });

  return await res.json();
}

// 3. Fetch Recent Calendar Events
async function listUpcomingEvents() {
  const token = await getGoogleAccessToken();
  const now = new Date().toISOString();
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events?timeMin=${encodeURIComponent(now)}&singleEvents=true&orderBy=startTime&maxResults=10`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return (data.items || []).map(e => ({
    id: e.id,
    summary: e.summary,
    start: e.start?.dateTime || e.start?.date,
    end: e.end?.dateTime || e.end?.date,
    htmlLink: e.htmlLink,
    description: e.description
  }));
}

// 4. Forward booking data to n8n to append into Google Sheets
async function forwardToN8n(payload) {
  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(`[n8n Forwarder] Status: ${res.status}`);
  } catch (err) {
    console.error(`[n8n Forwarder] Error:`, err.message);
  }
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Routes
  if (req.url === '/api/calendar-events' && req.method === 'GET') {
    try {
      const events = await listUpcomingEvents();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, events }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: err.message }));
    }
    return;
  }

  // Parse Body Helper
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', async () => {
    let json = {};
    if (body) {
      try { json = JSON.parse(body); } catch (e) { json = {}; }
    }

    // VAPI Tool-Calls & Server Webhook
    if (req.url === '/api/vapi-webhook' || req.url === '/api/tool-calls') {
      try {
        const message = json.message || {};
        const type = message.type || json.type || 'tool-calls';

        console.log(`\n🎙️ [Vapi Event] Type: ${type}`);

        if (type === 'tool-calls' || message.toolCalls) {
          const toolCalls = message.toolCalls || json.toolCalls || [];
          const results = [];

          for (const tc of toolCalls) {
            const fnName = tc.function?.name || tc.name;
            let args = tc.function?.arguments || tc.parameters || {};
            if (typeof args === 'string') {
              try { args = JSON.parse(args); } catch (e) { args = {}; }
            }

            console.log(`🔧 [Executing Tool] ${fnName}:`, args);

            if (fnName === 'check_availability' || fnName === 'checkAvailability') {
              const slot = parseSlotToIso(args.date, args.time);
              const avail = await checkAvailability(slot.startIso, slot.endIso);

              let speech = '';
              if (avail.isAvailable) {
                speech = `Yes, ${slot.formattedDate} at ${slot.formattedTime} is completely available with Dr. Sarah. Would you like me to reserve that appointment for you?`;
              } else {
                speech = `Dr. Sarah already has a patient scheduled at ${slot.formattedTime} on ${slot.formattedDate}. However, she is free 45 minutes later or the following morning at 10:00 AM. Would either of those work?`;
              }

              results.push({
                toolCallId: tc.id,
                result: {
                  isAvailable: avail.isAvailable,
                  date: slot.formattedDate,
                  time: slot.formattedTime,
                  message: speech
                }
              });

            } else if (fnName === 'book_appointment' || fnName === 'bookAppointment') {
              const slot = parseSlotToIso(args.date, args.time);
              const patientName = args.patientName || args.name || 'Valued Patient';
              const phone = args.phone || args.phoneNumber || 'Not provided';
              const service = args.service || args.reason || 'Dental Consultation';
              const isEmerg = /emergency|pain|severe|broken|bleeding|swelling|urgent/i.test(`${service} ${args.notes || ''}`);
              const triage = isEmerg ? 'Emergency Case' : 'Standard';

              const event = await createCalendarEvent({
                patientName,
                phone,
                service,
                triage,
                startIso: slot.startIso,
                endIso: slot.endIso
              });

              console.log(`✅ [Calendar Event Created] ID: ${event.id}`);

              // Sync to Google Sheets via n8n
              forwardToN8n({
                message: {
                  type: 'tool-calls',
                  toolCalls: [
                    {
                      id: tc.id,
                      type: 'function',
                      function: {
                        name: 'bookDentalAppointment',
                        arguments: {
                          patientName,
                          phone,
                          service,
                          preferredDate: slot.formattedDate,
                          preferredTime: slot.formattedTime,
                          notes: `Google Calendar Event ID: ${event.id} | Status: ${triage}`
                        }
                      }
                    }
                  ]
                }
              });

              results.push({
                toolCallId: tc.id,
                result: {
                  success: true,
                  eventId: event.id,
                  eventLink: event.htmlLink,
                  confirmedSlot: `${slot.formattedDate} at ${slot.formattedTime}`,
                  message: `Perfect! Your appointment is confirmed with Dr. Sarah for ${slot.formattedDate} at ${slot.formattedTime}. We have reserved your spot in our clinic calendar.`
                }
              });
            }
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ results }));
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'acknowledged' }));
        return;
      } catch (err) {
        console.error('[Vapi Webhook Error]:', err.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
        return;
      }
    }

    // Direct Manual Check Availability API
    if (req.url === '/api/check-availability' && req.method === 'POST') {
      try {
        const slot = parseSlotToIso(json.date, json.time);
        const avail = await checkAvailability(slot.startIso, slot.endIso);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          slot,
          isAvailable: avail.isAvailable,
          busySlots: avail.busySlots
        }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
      return;
    }

    // Direct Manual Book Appointment API
    if (req.url === '/api/book-appointment' && req.method === 'POST') {
      try {
        const slot = parseSlotToIso(json.date, json.time);
        const patientName = json.patientName || 'Valued Patient';
        const phone = json.phone || '03471098310';
        const service = json.service || 'Routine Check-up';
        const isEmerg = /emergency|pain|severe|broken/i.test(service);
        const triage = isEmerg ? 'Emergency Case' : 'Standard';

        const event = await createCalendarEvent({
          patientName,
          phone,
          service,
          triage,
          startIso: slot.startIso,
          endIso: slot.endIso
        });

        forwardToN8n({
          message: {
            type: 'tool-calls',
            toolCalls: [{
              id: 'manual_' + Date.now(),
              function: {
                name: 'bookDentalAppointment',
                arguments: {
                  patientName,
                  phone,
                  service,
                  preferredDate: slot.formattedDate,
                  preferredTime: slot.formattedTime,
                  notes: `Manual Portal Booking (Event ID: ${event.id})`
                }
              }
            }]
          }
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, eventId: event.id, link: event.htmlLink, slot }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: e.message }));
      }
      return;
    }

    // Static Web UI Files
    let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath);
      const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.svg': 'image/svg+xml'
      };
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
      fs.createReadStream(filePath).pipe(res);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });
});

server.listen(PORT, () => {
  console.log('\n======================================================');
  console.log(`🚀 Day 3 Voice Calendar Booking Engine Live on http://localhost:${PORT}`);
  console.log(`📅 Target Google Calendar ID: ${CAL_ID}`);
  console.log(`🔗 Vapi Webhook Server Endpoint: http://localhost:${PORT}/api/vapi-webhook`);
  console.log('======================================================\n');
});
