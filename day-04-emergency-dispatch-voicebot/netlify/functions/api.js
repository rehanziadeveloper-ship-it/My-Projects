const crypto = require('crypto');

// Master Google Cloud & CRM Configurations
const SPREADSHEET_ID = '1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo';
const SHEET_TAB = 'Emergency_Dispatch_Day4';
const CAL_ID = 'dc16a29b27611448569f6f342e1e982aa44e6c6bfa3b3ca7d2fe180c4231748b@group.calendar.google.com';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1767318.hstgr.cloud/webhook/home-services-emergency-dispatch';

// Embedded Google Service Account for Netlify Serverless Environment
const GOOGLE_SERVICE_ACCOUNT = {
  type: "service_account",
  project_id: "valiant-epsilon-501913-g2",
  private_key_id: "8231aeffe62304da1b823a23e1d91ff7ade9336e",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC6/8ATa9+hemSf\naqpP5WQTVHoRIv3JAXCFihZM3vV00/WcKevaQtqM+hYyMWOhapcADH2+rDEEGvJ5\nJij72yzH3j0WgFEFz3wszX1knUHsgHa+m8XSNuyzGeVAydWcAKKeHoS6U20NeOXZ\n40oJUYzPZ6rgGGGztikxzTdoQCGrMhnvVY/ErSyHyU4c6cx5xLbhlEXrMjK611iy\n4Tjn07zydQFVXi9zBflnISIIYDZfWMQ9DYp3GKONaPwA5DvK2W9ev+9PbqZA15XQ\nKnXVBi5v93f2dkrZ+WdG4Rp8AENcNC2iBE6TW8OwTB8JnPSS1gsCexP8ultibc8g\nWRdtPGSRAgMBAAECggEAFbGj49zo5b/gOopSVdCD6qYrPx+zF4WeOy/I5IQdL7+D\nR+mpHfoRhrdgqdQG/evytqO8Vsl9Kj/CD4H40TcdG9bReXHLdIQcoMn6GRkRU9GX\ndQd3TKrojOKdMQX5TQ7ZzsQ1m7Qf+6ch60QuC6S1VD5vmW3ar9GbN9bZ7bM69LQ5\neMyUeFSKAbaju+O1vV3mlPpiz5ndSn+VQsY8NhV8DF1yhYyNlf0QiffdnOQU7Msj\nzGMypJ21EXVdmuKlKhxjYJY4bK9YWUDDg3LmK/vYzCLj7Cl2nDuU/8WBzi3YW7AK\nPzmESzdOnQzw1UErXNo54PH6xpKO1pFMB4tg9ueo3QKBgQDiIpr503zn65tsyazw\n3vELXg+ZZBGwHc7SNsxeTW5P/fDKrVV404cKK5+8Pw+mgoZjDkc3CFaUzAI9pXnR\nvFDclbOk/GKSBPtcJfot94EQUgzlBpeEcqIj8Z9+gaUfuHL7ZYOQzwR0z6fG9A3O\nnlDICb1ja5NvwOYWBwvctr3g2wKBgQDTsf4NnJK+fYRVACgYaXGWm7HvTDa8lR/3\n6PTd9Z72+jCuBRkSqT0OcbxV+CCniZXJJAioFm1raYoP7utn6PjIONC54RzP9nXw\n3HIE5dYJRm7U1Efen5CYxyXg8lIHrMPbwrCAuwcTeE+QizSNfhSBunz7zYvivNUu\nAnWELFrmAwKBgEocGToiy16eYnOGrLzL86dMDkSw/PMA8dUGzHdjXPGuQYnKwKY2\nfJ0iqtjgudpSEITKGyC4BNgC/AEECCZqVv3TueoqJIvCQjZy48jIwm181mkAfguU\nHfs1ppWpG1qH8nbdT/7XOZimrU+QkC3UyJimSIEaslj/mOhDKuoMobHdAoGAeMns\nnbOi/1H6+c0XE6bGixrXUiT4bm3gScIARc1qIJ3svL5n6f/quJ0oyxzC9RVKA/St\ng8sYL9uOTT0T0Lxbh1Lztbu+huKntQDzhdvmXnBzuLhPMbV1+dZXxJw/NeXb8z6J\nG0qb5P4W1/C10a4I4WSY/8vubzczpAb/KqVsUCUCgYEAi7yC38YXnqSKMypyllhg\n21BRoh1a07V+8QY/ahYxzmdLY9cVmgZe9h8fHq18oCZtzJvwBuk8u5tV+7LuGyxi\nwLi5qBlg+zBA0RNT03pmN7D6JJBsdGQ2KtWHYvnBSayt4p/IJJ5Rpi67DDwcfsi8\nKA/MJzN4Cj+IKJnZxvEa7r8=\n-----END PRIVATE KEY-----\n",
  client_email: "antigravity-mcp@valiant-epsilon-501913-g2.iam.gserviceaccount.com"
};

// Master On-Call Technicians Pool
const TECHNICIANS = [
  { name: 'Dave Miller', trade: 'Plumbing', role: 'Master Plumber (Emergency Unit #4)', status: 'ON_CALL', phone: '+1 (555) 234-5678' },
  { name: 'Sarah Lin', trade: 'HVAC', role: 'Lead HVAC Specialist (Unit #2)', status: 'ON_CALL', phone: '+1 (555) 876-5432' },
  { name: 'Marcus Vance', trade: 'Electrical', role: 'Senior Master Electrician (Unit #7)', status: 'ON_CALL', phone: '+1 (555) 345-6789' }
];

let cachedToken = null;
let tokenExpiry = 0;
let dispatchTickets = [];
let ticketCounter = 101;
const sessions = {};

// Google OAuth Access Token Cache
async function getGoogleAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken && now < tokenExpiry - 60) {
    return cachedToken;
  }

  const exp = now + 3600;
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: GOOGLE_SERVICE_ACCOUNT.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
    aud: 'https://oauth2.googleapis.com/token',
    exp,
    iat: now
  };

  const b64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const b64Claim = Buffer.from(JSON.stringify(claim)).toString('base64url');
  const signatureInput = `${b64Header}.${b64Claim}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(GOOGLE_SERVICE_ACCOUNT.private_key, 'base64url');
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

// Append Ticket to Google Sheets CRM (Emergency_Dispatch_Day4)
async function appendTicketToGoogleSheet(ticket) {
  try {
    const token = await getGoogleAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_TAB + '!A1')}:append?valueInputOption=USER_ENTERED`;
    
    const row = [
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }),
      ticket.id,
      ticket.customerName,
      ticket.phone,
      ticket.address,
      ticket.issue,
      ticket.urgency,
      ticket.assignedTech,
      ticket.status,
      ticket.safetyTip
    ];

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: [row] })
    });

    const data = await res.json();
    console.log(`✅ [Google Sheets Netlify Logged] Ticket ${ticket.id}:`, data.updates?.updatedRange);
    return data;
  } catch (err) {
    console.error(`❌ [Google Sheets Netlify Error]:`, err.message);
  }
}

// Create Technician Arrival Dispatch in Google Calendar (Conflict-Free)
async function createDispatchCalendarEvent(ticket) {
  try {
    const token = await getGoogleAccessToken();
    const startIso = ticket.scheduledStart || new Date().toISOString();
    const endIso = ticket.scheduledEnd || new Date(Date.now() + 45 * 60000).toISOString();

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: `${ticket.urgency.includes('CRITICAL') ? '🚨 EMERGENCY' : '🔧 SERVICE'}: ${ticket.customerName} (${ticket.trade || 'General'})`,
        location: ticket.address,
        description: [
          `Ticket ID: ${ticket.id}`,
          `Customer: ${ticket.customerName}`,
          `Phone: ${ticket.phone}`,
          `Service Address: ${ticket.address}`,
          `Issue / Incident: ${ticket.issue}`,
          `Assigned Technician: ${ticket.assignedTech}`,
          `Arrival Window: ${ticket.eta}`,
          `Urgency Status: ${ticket.urgency}`,
          `Safety Guidance: ${ticket.safetyTip}`,
          `Dispatched via: Apex 24/7 Home Services Voice AI (Conflict-Free Engine)`
        ].join('\n'),
        start: { dateTime: startIso, timeZone: 'Asia/Karachi' },
        end: { dateTime: endIso, timeZone: 'Asia/Karachi' },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 15 },
            { method: 'email', minutes: 30 }
          ]
        }
      })
    });

    const eventData = await res.json();
    console.log(`📅 [Google Calendar Netlify Dispatched] Event ID: ${eventData.id} | Slot: ${ticket.eta}`);
    return eventData;
  } catch (err) {
    console.error(`❌ [Google Calendar Netlify Error]:`, err.message);
    return null;
  }
}

// List Upcoming Dispatches from Google Calendar
async function listUpcomingCalendarDispatches() {
  try {
    const token = await getGoogleAccessToken();
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events?timeMin=${encodeURIComponent(now.toISOString())}&singleEvents=true&orderBy=startTime&maxResults=20`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return (data.items || []).map(e => ({
      id: e.id,
      summary: e.summary,
      location: e.location,
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
      htmlLink: e.htmlLink,
      description: e.description
    }));
  } catch (err) {
    console.error('Calendar list error:', err.message);
    return [];
  }
}

// Forward to n8n Automation Engine
async function forwardToN8n(payload) {
  try {
    const res = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(`[n8n Forwarder Netlify] Status: ${res.status}`);
  } catch (err) {
    console.error(`[n8n Forwarder Netlify] Error:`, err.message);
  }
}

function getOrCreateSession(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      step: 1,
      issue: null,
      trade: 'General',
      isEmergency: false,
      urgency: '🟢 STANDARD SERVICE',
      safetyTip: 'Standard service dispatch',
      eta: 'Tomorrow (9:00 AM - 1:00 PM)',
      assignedTech: 'Assigned on morning route',
      address: null,
      customerName: null,
      phone: null,
      ticketId: null
    };
  }
  return sessions[sessionId];
}

function getHomeServicesFaq(lower, s) {
  if (/fee|fees|cost|charge|charges|price|pricing|how much|rate|diagnostic/i.test(lower)) {
    return "Our standard diagnostic dispatch fee is $49, which is completely waived if you proceed with the repair. For emergency night and weekend dispatches, our emergency diagnostic fee is $89, also credited directly toward your service repair.";
  }
  if (/warranty|guarantee|certified|licensed|insured/i.test(lower)) {
    return "All Apex Home Services repairs are 100% backed by our Lifetime Workmanship Guarantee. Every technician on our team is fully licensed, background-checked, and insured.";
  }
  if (/service area|areas|cities|coverage|where do you service/i.test(lower)) {
    return "We provide 24/7 emergency dispatch coverage throughout the entire metropolitan area within a 35-mile radius.";
  }
  if (/hours|open|closed|holiday|weekend/i.test(lower) && !/morning|afternoon|\d/i.test(lower)) {
    return "Our emergency dispatch center operates 24 hours a day, 7 days a week, 365 days a year.";
  }
  return null;
}

// Find Next Conflict-Free Arrival Window / Appointment Slot
function findNextAvailableSlot(existingEvents, isEmergency, trade, preferredTime = '') {
  const now = new Date();

  if (isEmergency) {
    let proposedStart = new Date(now);
    const activeEvents = existingEvents.filter(e => {
      const eStart = new Date(e.start);
      const eEnd = new Date(e.end);
      const isTradeMatch = e.summary && e.summary.toLowerCase().includes(trade.toLowerCase());
      return isTradeMatch && eEnd > now && eStart < new Date(now.getTime() + 45 * 60000);
    });

    if (activeEvents.length > 0) {
      let latestEnd = now;
      activeEvents.forEach(e => {
        const endDt = new Date(e.end);
        if (endDt > latestEnd) latestEnd = endDt;
      });
      proposedStart = new Date(latestEnd.getTime() + 10 * 60000);
    }

    const proposedEnd = new Date(proposedStart.getTime() + 45 * 60000);
    const diffMins = Math.round((proposedStart.getTime() - now.getTime()) / 60000);
    const etaStr = diffMins > 12 
      ? `Arriving in ~${diffMins}–${diffMins + 15} Mins (Tech on active call, en route immediately after)`
      : `25 - 40 Minutes (Immediate Dispatch)`;

    return {
      start: proposedStart,
      end: proposedEnd,
      slotLabel: etaStr
    };
  } else {
    // Standard Daytime Slots: Mon-Sat
    const targetDate = new Date(now);
    targetDate.setDate(targetDate.getDate() + 1);
    if (targetDate.getDay() === 0) targetDate.setDate(targetDate.getDate() + 1);

    const standardSlots = [
      { startH: 9, startM: 0, endH: 10, endM: 30, period: 'morning', label: '9:00 AM - 10:30 AM' },
      { startH: 10, startM: 30, endH: 12, endM: 0, period: 'morning', label: '10:30 AM - 12:00 PM' },
      { startH: 13, startM: 0, endH: 14, endM: 30, period: 'afternoon', label: '1:00 PM - 2:30 PM' },
      { startH: 14, startM: 30, endH: 16, endM: 0, period: 'afternoon', label: '2:30 PM - 4:00 PM' },
      { startH: 16, startM: 0, endH: 17, endM: 30, period: 'afternoon', label: '4:00 PM - 5:30 PM' }
    ];

    const prefLower = (preferredTime || '').toLowerCase();
    let prioritizedSlots = [...standardSlots];
    if (/morning|am/i.test(prefLower)) {
      prioritizedSlots.sort((a, b) => (a.period === 'morning' ? -1 : 1));
    } else if (/afternoon|pm/i.test(prefLower)) {
      prioritizedSlots.sort((a, b) => (a.period === 'afternoon' ? -1 : 1));
    }

    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      const day = new Date(targetDate);
      day.setDate(day.getDate() + dayOffset);
      if (day.getDay() === 0) continue;

      for (const slot of prioritizedSlots) {
        const sTime = new Date(day);
        sTime.setHours(slot.startH, slot.startM, 0, 0);
        const eTime = new Date(day);
        eTime.setHours(slot.endH, slot.endM, 0, 0);

        const hasConflict = existingEvents.some(e => {
          const eStart = new Date(e.start);
          const eEnd = new Date(e.end);
          return eStart < eTime && eEnd > sTime;
        });

        if (!hasConflict) {
          const dayName = dayOffset === 0 ? 'Tomorrow' : day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
          return {
            start: sTime,
            end: eTime,
            slotLabel: `${dayName} (${slot.label})`
          };
        }
      }
    }

    const fallbackStart = new Date(targetDate);
    fallbackStart.setHours(10, 0, 0, 0);
    const fallbackEnd = new Date(targetDate);
    fallbackEnd.setHours(11, 30, 0, 0);
    return {
      start: fallbackStart,
      end: fallbackEnd,
      slotLabel: `Tomorrow (10:00 AM - 11:30 AM)`
    };
  }
}

// Core Multi-Turn Dispatch Triage Engine
async function processChatMessage(sessionId, userMessage) {
  const s = getOrCreateSession(sessionId);
  const text = (userMessage || '').trim();
  const lower = text.toLowerCase();

  // Reset Commands
  if (/^(reset|restart|start\s*over|clear|new\s*call|new\s*dispatch)$/i.test(lower)) {
    sessions[sessionId] = null;
    return {
      reply: "Thank you for calling Apex 24/7 Emergency Home Services. My name is Marcus. Are you calling with an urgent plumbing, heating, or electrical emergency, or looking to schedule standard service?",
      step: 1,
      isBooked: false
    };
  }

  // FAQ Check
  const faqAnswer = getHomeServicesFaq(lower, s);
  if (faqAnswer) {
    if (s.step === 1) return { reply: `${faqAnswer}\n\nWhat issue are you currently experiencing with your home?`, step: 1 };
    if (s.step === 3) return { reply: `${faqAnswer}\n\nCould you please provide your street address?`, step: 3 };
    if (s.step === 'COMPLETED') return { reply: `${faqAnswer}\n\nIs there anything else our emergency dispatch team can assist you with?`, step: 'COMPLETED' };
  }

  // STEP 1: Incident Description & Immediate Triage
  if (s.step === 1) {
    const isPlumbing = /plumb|pipe|burst|leak|flooding|flood|water|toilet|drain|faucet|sewage|sewer|sump|heater|gushing/i.test(lower);
    const isHvac = /heat|furnace|boiler|cold|freezing|ac\b|air condition|hvac|thermostat|no heat|cooling/i.test(lower);
    const isElectrical = /electric|power|spark|sparks|breaker|fuse|outlet|smoke|burning|shock|blackout/i.test(lower);

    if (isPlumbing) s.trade = 'Plumbing';
    else if (isHvac) s.trade = 'HVAC';
    else if (isElectrical) s.trade = 'Electrical';
    else s.trade = 'General Home Services';

    const isEmergency = /burst|flood|flooding|gushing|overflowing|sewage|backed up|no heat|freezing|sub-zero|spark|sparks|burning smell|smoke|smoke detector|gas|gas leak|carbon monoxide|co alarm|emergency|urgent|now|critical/i.test(lower);

    s.issue = text;
    s.isEmergency = isEmergency;

    if (isEmergency) {
      s.urgency = '🔴 CRITICAL EMERGENCY';
      s.eta = '25 - 40 Minutes (Immediate Dispatch)';
      const matchTech = TECHNICIANS.find(t => t.trade.toLowerCase() === s.trade.toLowerCase()) || TECHNICIANS[0];
      s.assignedTech = `${matchTech.name} (${matchTech.role})`;

      if (s.trade === 'Plumbing') {
        s.safetyTip = 'Homeowner instructed to shut off main water shutoff valve immediately.';
        s.step = 3;
        return {
          reply: `Understood, this is a critical plumbing emergency. I am alerting our on-call emergency plumber right now. First, to prevent major water damage to your home, do you know where your main water shutoff valve is located? If it is safe, please shut it off immediately.\n\nWhat is the street address where the technician needs to respond?`,
          step: 3,
          isEmergency: true
        };
      } else if (s.trade === 'Electrical') {
        s.safetyTip = 'Homeowner instructed to keep distance and avoid touching wet areas or electrical panels.';
        s.step = 3;
        return {
          reply: `I have flagged this as an urgent electrical hazard. Please keep all family members and pets away from that area and do not touch any switches or standing water. I am initiating an immediate emergency dispatch.\n\nWhat is the street address where the technician needs to respond?`,
          step: 3,
          isEmergency: true
        };
      } else if (s.trade === 'HVAC') {
        s.safetyTip = 'Heating emergency escalated for immediate freeze protection.';
        s.step = 3;
        return {
          reply: `Having no heat in freezing temperatures is classified as an immediate health and pipe-freeze emergency. Our on-call heating technician is being notified.\n\nWhat is the street address where you need our emergency technician?`,
          step: 3,
          isEmergency: true
        };
      } else {
        s.safetyTip = 'Immediate emergency on-call technician dispatch initiated.';
        s.step = 3;
        return {
          reply: `Understood, our emergency dispatch unit is handling this on highest priority. What is your street address so we can route the nearest truck?`,
          step: 3,
          isEmergency: true
        };
      }
    } else {
      s.urgency = '🟢 STANDARD SERVICE';
      s.assignedTech = 'Regional Daytime Service Route';
      s.eta = 'Tomorrow (9:00 AM - 1:00 PM)';
      s.safetyTip = 'Standard diagnostic service scheduled';
      s.step = 3;
      return {
        reply: `Got it. We can certainly take care of that ${s.trade.toLowerCase()} service for you during our standard appointment window. Could you please provide your street address?`,
        step: 3,
        isEmergency: false
      };
    }
  }

  // STEP 3: Collect Service Address
  if (s.step === 3) {
    const isUrgencyClarification = /emergency|urgent|burst|flood|gushing|hurry|asap|critical|severe|immediately/i.test(lower);
    const hasAddressSigns = /\d|\bstreet\b|\bst\b|\broad\b|\brd\b|\bave\b|\bavenue\b|\bdrive\b|\bdr\b|\blane\b|\bln\b|\bway\b|\bblvd\b|\bterrace\b|\bplaza\b|\bcourt\b|\bct\b|\bsuite\b|\bapt\b|\bhouse\b|\bblock\b/i.test(lower);

    if (isUrgencyClarification && !hasAddressSigns) {
      s.isEmergency = true;
      s.urgency = '🔴 CRITICAL EMERGENCY';
      s.eta = '25 - 40 Minutes (Immediate Dispatch)';
      const matchTech = TECHNICIANS.find(t => t.trade.toLowerCase() === s.trade.toLowerCase()) || TECHNICIANS[0];
      s.assignedTech = `${matchTech.name} (${matchTech.role})`;
      return {
        reply: `Understood! I am escalating your ticket to a critical emergency dispatch right now. If water is actively leaking, please locate and shut off your main water valve immediately. What is your complete street address so we can roll the truck?`,
        step: 3,
        isEmergency: true
      };
    }

    if (text.length < 5) {
      return { reply: "Could you please provide your complete street address (including house number and street name)?", step: 3 };
    }

    s.address = text;
    s.step = 4;
    return { reply: `Thank you. I have noted ${s.address}. Could you please provide your full name?`, step: 4 };
  }

  // STEP 4: Collect Caller Name
  if (s.step === 4) {
    let cleanName = text.replace(/^(my name is|i am|this is|call me|name is|it's|it is)\s+/i, '').replace(/[!?,;]+$/, '').trim();
    if (!cleanName || cleanName.length < 2) {
      return { reply: "Could you please tell me your first and last name for our dispatch ticket?", step: 4 };
    }
    s.customerName = cleanName;
    s.step = 5;
    return { reply: `Thank you, ${s.customerName}. What is your best direct phone number so the technician can send you live GPS arrival updates?`, step: 5 };
  }

  // STEP 5: Collect Phone & Finalize Instant Dispatch
  if (s.step === 5) {
    const rawDigits = text.replace(/[^0-9]/g, '');
    if (!rawDigits || rawDigits.length < 7) {
      return { reply: "Please provide a valid direct callback number so our technician can coordinate arrival.", step: 5 };
    }

    s.phone = text.trim().startsWith('+') ? `+${rawDigits}` : (rawDigits.startsWith('0') ? rawDigits : `0${rawDigits}`);
    s.ticketId = s.isEmergency ? `APX-EMG-${ticketCounter++}` : `APX-STD-${ticketCounter++}`;
    s.step = 'COMPLETED';

    // Compute Next Conflict-Free Arrival Slot against real Google Calendar
    const existingEvents = await listUpcomingCalendarDispatches();
    const slot = findNextAvailableSlot(existingEvents, s.isEmergency, s.trade);
    s.eta = slot.slotLabel;

    const ticketObj = {
      id: s.ticketId,
      timestamp: new Date().toISOString(),
      scheduledStart: slot.start.toISOString(),
      scheduledEnd: slot.end.toISOString(),
      customerName: s.customerName,
      phone: s.phone,
      address: s.address,
      issue: s.issue,
      trade: s.trade,
      urgency: s.urgency,
      assignedTech: s.assignedTech,
      status: s.isEmergency ? '🚨 DISPATCHED' : '📅 SCHEDULED',
      eta: s.eta,
      safetyTip: s.safetyTip
    };

    dispatchTickets.unshift(ticketObj);

    // 1. Log directly to Google Sheets CRM (Tab: Emergency_Dispatch_Day4)
    await appendTicketToGoogleSheet(ticketObj);

    // 2. Schedule directly in Google Calendar (Conflict-Free Slot Allocation)
    await createDispatchCalendarEvent(ticketObj);

    // 3. Trigger live n8n automation webhook
    forwardToN8n({ event: 'emergency_dispatch_created', ticket: ticketObj });

    const confirmationSummary = [
      `🚨 DISPATCH TICKET GENERATED [${s.ticketId}]`,
      `• Urgency: ${s.urgency}`,
      `• Homeowner: ${s.customerName}`,
      `• Callback Phone: ${s.phone}`,
      `• Service Location: ${s.address}`,
      `• Issue: ${s.issue}`,
      `• Assigned Technician: ${s.assignedTech}`,
      `• Confirmed Arrival Window: ${s.eta}`,
      "",
      s.isEmergency
        ? "Our on-call technician has been directly paged and is rolling a truck to your location. Please keep your phone line open for their live GPS arrival call."
        : `Your service appointment is locked for ${s.eta} with zero scheduling conflict.`,
      "",
      "Is there anything else you need immediate help with?"
    ].join('\n');

    return {
      reply: confirmationSummary,
      step: 'COMPLETED',
      isBooked: true,
      ticket: ticketObj,
      endCall: false
    };
  }

  // POST-COMPLETION
  if (s.step === 'COMPLETED') {
    if (/thank|thanks|bye|goodbye|all good|no that's all|thats all|i'm good|im good|see you/i.test(lower)) {
      return {
        reply: `You're very welcome, ${s.customerName || 'valued customer'}. Our technician is rolling truck. Stay safe, and thank you for calling Apex 24/7 Emergency Services!`,
        step: 'COMPLETED',
        endCall: true
      };
    }
    if (/when will|how long|eta|where is the tech|arrival/i.test(lower)) {
      return {
        reply: `Your technician, ${s.assignedTech}, has an estimated arrival window of ${s.eta} at ${s.address}. They will call your number (${s.phone}) 10 minutes prior to arrival.`,
        step: 'COMPLETED'
      };
    }
    return {
      reply: `Your ticket ${s.ticketId} is active on our dispatch board. If you need anything else, just let me know!`,
      step: 'COMPLETED'
    };
  }
}

// Netlify Serverless Handler
exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const path = event.path.replace(/\/\.netlify\/functions\/api/, '').replace(/^\/api/, '');

  if (path === '/tickets' && event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        count: dispatchTickets.length,
        technicians: TECHNICIANS,
        tickets: dispatchTickets
      })
    };
  }

  if (path === '/calendar-events' && event.httpMethod === 'GET') {
    try {
      const calEvents = await listUpcomingCalendarDispatches();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          count: calEvents.length,
          events: calEvents
        })
      };
    } catch (e) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          count: dispatchTickets.length,
          events: dispatchTickets.map(t => ({
            id: t.id,
            summary: `${t.urgency.includes('CRITICAL') ? '🚨 EMERGENCY' : '🔧 SERVICE'}: ${t.customerName} (${t.trade})`,
            location: t.address,
            start: t.scheduledStart || t.timestamp,
            end: t.scheduledEnd,
            description: `Assigned: ${t.assignedTech}\nIssue: ${t.issue}\nStatus: ${t.status}\nArrival: ${t.eta}`
          }))
        })
      };
    }
  }

  if (path === '/chat' && event.httpMethod === 'POST') {
    try {
      const { sessionId, messageText } = JSON.parse(event.body || '{}');
      const result = await processChatMessage(sessionId || 'default_session', messageText);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(result)
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: err.message })
      };
    }
  }

  if (path === '/record-ticket' && event.httpMethod === 'POST') {
    try {
      const ticket = JSON.parse(event.body || '{}');
      if (ticket && ticket.id) {
        dispatchTickets.unshift(ticket);
        await appendTicketToGoogleSheet(ticket);
        await createDispatchCalendarEvent(ticket);
        forwardToN8n({ event: 'emergency_dispatch_created', ticket });
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Ticket logged to Google Sheets & Calendar' })
        };
      }
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid ticket' }) };
    } catch (err) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
    }
  }

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Endpoint not found' })
  };
};
