const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3002;
const KEY_PATH = path.join(__dirname, '..', 'valiant-epsilon-501913-g2-8231aeffe623.json');
const CAL_ID = 'dc16a29b27611448569f6f342e1e982aa44e6c6bfa3b3ca7d2fe180c4231748b@group.calendar.google.com';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1767318.hstgr.cloud/webhook/whatsapp-missed-call-recovery';

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
  } else if (/morning/i.test(t)) {
    hour = 10; minute = 0;
  } else if (/afternoon/i.test(t)) {
    hour = 14; minute = 0;
  } else if (/evening/i.test(t)) {
    hour = 17; minute = 0;
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

// 2. Create Event in Google Calendar
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

// 3. Update Existing Event in Place in Google Calendar
async function updateCalendarEvent(eventId, { patientName, phone, service, triage, startIso, endIso }) {
  const token = await getGoogleAccessToken();
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events/${encodeURIComponent(eventId)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary: `🦷 ${triage}: ${patientName} (Rescheduled)`,
      description: `Patient: ${patientName}\nPhone: ${phone}\nService / Reason: ${service}\nClinical Status: ${triage}\nRescheduled in place via Apex Dental Voicebot`,
      start: { dateTime: startIso, timeZone: 'Asia/Karachi' },
      end: { dateTime: endIso, timeZone: 'Asia/Karachi' }
    })
  });

  return await res.json();
}

// 4. List All Upcoming Events from Google Calendar
async function listUpcomingEvents() {
  const token = await getGoogleAccessToken();
  const now = new Date();
  now.setHours(0, 0, 0, 0); // Include today's events
  const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events?timeMin=${encodeURIComponent(now.toISOString())}&singleEvents=true&orderBy=startTime&maxResults=20`, {
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

// 5. Forward to n8n to sync Google Sheets without duplication
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

// Conversational Session State Store
const sessions = {};

function getOrCreateSession(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      step: 1, // 1: Service, 2: Name, 3: Phone, 4: Time, 5: Confirmation/Summary, 6: Reschedule/Completed
      service: null,
      patientName: null,
      patientPhone: null,
      preferredTime: null,
      calendarEventId: null,
      isEmergency: false,
      triage: 'Standard',
      lastBotMessage: ''
    };
  }
  return sessions[sessionId];
}

// Conversational AI Booking Engine (Apex Dental 6-Step Clinical Flow)
async function processChatMessage(sessionId, messageText) {
  const s = getOrCreateSession(sessionId);
  const text = (messageText || '').trim();
  const lower = text.toLowerCase();

  console.log(`\n💬 [Chat Turn] Session: ${sessionId}, Step: ${s.step}, Text: "${text}"`);

  // Reset Commands
  if (/^(reset|restart|start\s*over|clear|new\s*call|new\s*booking)$/i.test(lower)) {
    sessions[sessionId] = null;
    return {
      reply: "Hello! Thank you for calling Apex Dental Clinic. My name is Sarah. Are you looking to schedule a routine appointment or an emergency visit?",
      step: 1,
      isBooked: false
    };
  }

  // STEP 1: Service Type (Emergency vs Routine)
  if (s.step === 1) {
    const isEmerg = /emergency|pain|severe|toothache|broken|bleeding|swelling|urgent|hurt/i.test(lower);
    const isRoutine = /routine|check-?up|cleaning|regular|consult|exam|whitening|normal/i.test(lower);

    if (isEmerg) {
      s.service = 'Emergency';
      s.isEmergency = true;
      s.triage = 'Emergency Case';
      s.step = 2;
      return {
        reply: "Thank you for letting me know. Since this is an emergency, our clinical team will prioritize your visit. Could you please provide your full name?",
        step: 2
      };
    } else if (isRoutine) {
      s.service = 'Routine';
      s.isEmergency = false;
      s.triage = 'Standard';
      s.step = 2;
      return {
        reply: "Wonderful! We would be delighted to take care of your routine dental check-up. Could you please provide your full name?",
        step: 2
      };
    } else {
      return {
        reply: "To get you scheduled properly at Apex Dental Clinic, could you please clarify whether you need urgent emergency care or a normal routine check-up?",
        step: 1
      };
    }
  }

  // STEP 2: Collect Name
  if (s.step === 2) {
    let cleanName = text
      .replace(/^(my name is|i am|this is|call me|name is|it's|it is)\s+/i, '')
      .replace(/[!?,;]+$/, '')
      .trim();

    if (!cleanName || cleanName.length < 2) {
      return {
        reply: "Could you please provide your first and last name for our clinic records?",
        step: 2
      };
    }

    s.patientName = cleanName;
    s.step = 3;
    return {
      reply: `Thank you, ${s.patientName}. What is your phone number?`,
      step: 3
    };
  }

  // STEP 3: Collect Phone Number
  if (s.step === 3) {
    const rawDigits = text.replace(/[^0-9]/g, '');
    if (!rawDigits || rawDigits.length < 7) {
      return {
        reply: "Please provide a valid direct phone number so our clinical team can confirm your appointment.",
        step: 3
      };
    }

    s.patientPhone = text.trim().startsWith('+') ? `+${rawDigits}` : (rawDigits.startsWith('0') ? rawDigits : `0${rawDigits}`);
    s.step = 4;
    return {
      reply: "Got it. What is your preferred day, and whether you prefer a morning or afternoon appointment?",
      step: 4
    };
  }

  // STEP 4: Collect Preferred Time, Check Google Calendar Live & Book
  if (s.step === 4) {
    const hasTimeContext = /morning|afternoon|pm|am|tomorrow|today|tonight|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d/i.test(lower);
    if (!hasTimeContext) {
      return {
        reply: "Which day works best for you, and would you prefer a morning or afternoon appointment?",
        step: 4
      };
    }

    // Parse day & time
    const slot = parseSlotToIso(text, text);
    s.preferredTime = `${slot.formattedDate} at ${slot.formattedTime}`;

    // Check Live Google Calendar FreeBusy
    console.log(`Checking Google Calendar FreeBusy for: ${slot.startIso} to ${slot.endIso}`);
    const avail = await checkAvailability(slot.startIso, slot.endIso);

    if (!avail.isAvailable) {
      return {
        reply: `Dr. Sarah already has an appointment booked on ${slot.formattedDate} at ${slot.formattedTime}. However, she has an opening 45 minutes later or the following morning at 10:00 AM. Would one of those work better for you?`,
        step: 4
      };
    }

    // Available -> Book in Google Calendar!
    const event = await createCalendarEvent({
      patientName: s.patientName,
      phone: s.patientPhone,
      service: s.service,
      triage: s.triage,
      startIso: slot.startIso,
      endIso: slot.endIso
    });
    s.calendarEventId = event.id;
    console.log(`✅ [Google Calendar Booked] Event ID: ${s.calendarEventId}`);

    // Sync to Google Sheets via n8n
    forwardToN8n({
      senderPhone: s.patientPhone,
      senderName: s.patientName,
      messageText: s.preferredTime,
      session: {
        step: 5,
        service: s.service,
        patientName: s.patientName,
        patientPhone: s.patientPhone,
        preferredTime: s.preferredTime,
        subStage: null
      }
    });

    s.step = 5;
    const summary = [
      "Great, I have your details. Here is the summary of your appointment:",
      `- Name: ${s.patientName}`,
      `- Phone: ${s.patientPhone}`,
      `- Service: ${s.service}`,
      `- Date & Time: ${s.preferredTime}`,
      "",
      "Does this look correct, or do you need to change the date and time?"
    ].join('\n');

    return {
      reply: summary,
      step: 5,
      isBooked: true,
      calendarEventId: s.calendarEventId
    };
  }

  // STEP 5 & STEP 6: Handling Confirmations and In-Place Rescheduling
  if (s.step === 5 || s.step === 6) {
    const isConfirm = /^(yes|yeah|yep|sure|correct|looks good|confirm|confirmed|that's right|perfect|all good|ok|okay)[!.]*$/i.test(lower) ||
                      /looks good|is correct|sounds good/i.test(lower);

    if (isConfirm) {
      s.step = 'COMPLETED';
      return {
        reply: "Perfect, your appointment is booked. We look forward to seeing you at Apex Dental Clinic!",
        step: 'COMPLETED',
        isBooked: true
      };
    }

    // User wants to change / reschedule
    const wantsChange = /change|reschedule|switch|different|another|make it|move to|update/i.test(lower);
    const hasTimeContext = /morning|afternoon|pm|am|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d/i.test(lower);

    if (wantsChange || hasTimeContext) {
      const slot = parseSlotToIso(text, text);
      s.preferredTime = `${slot.formattedDate} at ${slot.formattedTime}`;

      // 1. Update Existing Google Calendar Event in Place!
      if (s.calendarEventId) {
        console.log(`🔄 [In-Place Calendar Reschedule] Updating Event ID: ${s.calendarEventId}...`);
        await updateCalendarEvent(s.calendarEventId, {
          patientName: s.patientName,
          phone: s.patientPhone,
          service: s.service,
          triage: s.triage,
          startIso: slot.startIso,
          endIso: slot.endIso
        });
        console.log(`✅ [Google Calendar Event Updated In Place] Event ID: ${s.calendarEventId}`);
      }

      // 2. Update Existing Google Sheets Row in Place (Step 6)
      forwardToN8n({
        senderPhone: s.patientPhone,
        senderName: s.patientName,
        messageText: `Rescheduled to ${s.preferredTime}`,
        session: {
          step: 6,
          service: s.service,
          patientName: s.patientName,
          patientPhone: s.patientPhone,
          preferredTime: s.preferredTime,
          subStage: 'AWAITING_NEW_TIME'
        }
      });

      s.step = 6;
      const updatedSummary = [
        "Great, I have updated your appointment details:",
        `- Name: ${s.patientName}`,
        `- Phone: ${s.patientPhone}`,
        `- Service: ${s.service}`,
        `- Date & Time: ${s.preferredTime}`,
        "",
        "Does this new time look correct, or do you need to change anything else?"
      ].join('\n');

      return {
        reply: updatedSummary,
        step: 6,
        isBooked: true,
        calendarEventId: s.calendarEventId
      };
    }

    return {
      reply: "Please let me know if your appointment details look correct, or if you need to change the date and time.",
      step: 5
    };
  }

  if (s.step === 'COMPLETED') {
    if (/hi|hello|hey|book|appointment|new/i.test(lower)) {
      sessions[sessionId] = null;
      return processChatMessage(sessionId, text);
    }
    return {
      reply: "Your appointment is confirmed. If you need any further changes or assistance, just let me know. We look forward to seeing you at Apex Dental Clinic!",
      step: 'COMPLETED'
    };
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

  // API Route: Get Upcoming Events
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

    // Direct Voice & Text Chat API
    if (req.url === '/api/chat' && req.method === 'POST') {
      try {
        const sessionId = json.sessionId || 'default_client';
        const messageText = json.messageText || json.text || '';
        const response = await processChatMessage(sessionId, messageText);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, ...response }));
      } catch (err) {
        console.error('[Chat API Error]:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
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
  console.log(`💬 Chat & Voice API: http://localhost:${PORT}/api/chat`);
  console.log('======================================================\n');
});
