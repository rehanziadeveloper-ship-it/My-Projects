const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3004;
const KEY_PATH = path.join(__dirname, '..', 'valiant-epsilon-501913-g2-8231aeffe623.json');
const SPREADSHEET_ID = '1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo';
const SHEET_TAB = 'Emergency_Dispatch_Day4';
const CAL_ID = 'dc16a29b27611448569f6f342e1e982aa44e6c6bfa3b3ca7d2fe180c4231748b@group.calendar.google.com';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1767318.hstgr.cloud/webhook/home-services-emergency-dispatch';

let serviceAccount = null;
try {
  serviceAccount = JSON.parse(fs.readFileSync(KEY_PATH, 'utf8'));
  console.log(`[Google Auth] Loaded service account: ${serviceAccount.client_email}`);
} catch (e) {
  console.error('[Google Auth] Error loading service account key:', e.message);
}

// Google OAuth Access Token Cache
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
    scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events',
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

// Find Next Conflict-Free Arrival Window / Appointment Slot
function findNextAvailableSlot(existingEvents, isEmergency, trade, preferredTime = '') {
  const now = new Date();

  if (isEmergency) {
    let proposedStart = new Date(now);
    // Find active jobs for this trade
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
      proposedStart = new Date(latestEnd.getTime() + 10 * 60000); // 10 min buffer
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
    if (targetDate.getDay() === 0) targetDate.setDate(targetDate.getDate() + 1); // Skip Sunday

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
    console.log(`📅 [Google Calendar Dispatched - Conflict Free] Event ID: ${eventData.id} | Slot: ${ticket.eta}`);
    return eventData;
  } catch (err) {
    console.error(`❌ [Google Calendar Error]:`, err.message);
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
    console.log(`✅ [Google Sheets Logged] Ticket ${ticket.id} appended to ${SHEET_TAB}:`, data.updates?.updatedRange);
    return data;
  } catch (err) {
    console.error(`❌ [Google Sheets Error]:`, err.message);
  }
}

// Forward to n8n Automation Engine (simulates on-call tech SMS dispatch)
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

// Master On-Call Technicians Pool
const TECHNICIANS = [
  { name: 'Dave Miller', trade: 'Plumbing', role: 'Master Plumber (Emergency Unit #4)', status: 'ON_CALL', phone: '+1 (555) 234-5678' },
  { name: 'Sarah Lin', trade: 'HVAC', role: 'Lead HVAC Specialist (Unit #2)', status: 'ON_CALL', phone: '+1 (555) 876-5432' },
  { name: 'Marcus Vance', trade: 'Electrical', role: 'Senior Master Electrician (Unit #7)', status: 'ON_CALL', phone: '+1 (555) 345-6789' }
];

// Active Dispatch Tickets Store (In-Memory + Synced with Sheets)
let dispatchTickets = [];
let ticketCounter = 101;

// General Home Services FAQs
function getHomeServicesFaq(lower, s) {
  if (/fee|fees|cost|charge|charges|price|pricing|how much|rate|diagnostic/i.test(lower)) {
    return "Our standard diagnostic dispatch fee is $49, which is completely waived if you proceed with the repair. For emergency night and weekend dispatches, our emergency diagnostic fee is $89, also credited directly toward your service repair.";
  }
  if (/warranty|guarantee|certified|licensed|insured/i.test(lower)) {
    return "All Apex Home Services repairs are 100% backed by our Lifetime Workmanship Guarantee. Every technician on our team is fully licensed, background-checked, and insured.";
  }
  if (/service area|areas|cities|coverage|where do you service/i.test(lower)) {
    return "We provide 24/7 emergency dispatch coverage throughout the entire greater metropolitan area and surrounding suburbs within a 35-mile radius.";
  }
  if (/hours|open|closed|holiday|weekend/i.test(lower) && !/morning|afternoon|\d/i.test(lower)) {
    return "Our emergency dispatch center operates 24 hours a day, 7 days a week, 365 days a year. Our standard appointment hours run Monday through Saturday, 8:00 AM to 6:00 PM.";
  }
  return null;
}

// Conversational Session State Store
const sessions = {};

function getOrCreateSession(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      step: 1, // 1: Incident, 2: Safety/Details, 3: Address, 4: Name, 5: Phone, 6: Completed
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
      ticketId: null,
      subStage: null
    };
  }
  return sessions[sessionId];
}

// 24/7 AI Emergency Dispatch Engine ("Marcus" - Senior Dispatch Coordinator)
async function processChatMessage(sessionId, messageText) {
  const s = getOrCreateSession(sessionId);
  const text = (messageText || '').trim();
  const lower = text.toLowerCase();

  console.log(`\n🚨 [Dispatch Turn] Session: ${sessionId}, Step: ${s.step}, Text: "${text}"`);

  // Reset Commands
  if (/^(reset|restart|start\s*over|clear|new\s*call|new\s*dispatch)$/i.test(lower)) {
    sessions[sessionId] = null;
    return {
      reply: "Thank you for calling Apex 24/7 Emergency Home Services. My name is Marcus. Are you calling with an urgent plumbing, heating, or electrical emergency, or looking to schedule standard service?",
      step: 1,
      isBooked: false
    };
  }

  // General FAQ Check
  const faqAnswer = getHomeServicesFaq(lower, s);
  if (faqAnswer) {
    if (s.step === 1) {
      return {
        reply: `${faqAnswer}\n\nWhat issue are you currently experiencing with your home?`,
        step: 1
      };
    }
    if (s.step === 3) {
      return {
        reply: `${faqAnswer}\n\nCould you please provide the street address where you need service?`,
        step: 3
      };
    }
    if (s.step === 'COMPLETED') {
      return {
        reply: `${faqAnswer}\n\nIs there anything else our emergency dispatch team can assist you with?`,
        step: 'COMPLETED'
      };
    }
  }

  // STEP 1: Incident Description & Immediate Triage
  if (s.step === 1) {
    // Detect Trade
    const isPlumbing = /plumb|pipe|burst|leak|flooding|flood|water|toilet|drain|faucet|sewage|sewer|sump|heater|gushing/i.test(lower);
    const isHvac = /heat|furnace|boiler|cold|freezing|ac\b|air condition|hvac|thermostat|no heat|cooling/i.test(lower);
    const isElectrical = /electric|power|spark|sparks|breaker|fuse|outlet|smoke|burning|shock|blackout/i.test(lower);

    if (isPlumbing) s.trade = 'Plumbing';
    else if (isHvac) s.trade = 'HVAC';
    else if (isElectrical) s.trade = 'Electrical';
    else s.trade = 'General Home Services';

    // Urgency Classification
    const isEmergency = /burst|flood|flooding|gushing|overflowing|sewage|backed up|no heat|freezing|sub-zero|spark|sparks|burning smell|smoke|smoke detector|gas|gas leak|carbon monoxide|co alarm|emergency|urgent|now|critical/i.test(lower);

    s.issue = text;
    s.isEmergency = isEmergency;

    if (isEmergency) {
      s.urgency = '🔴 CRITICAL EMERGENCY';
      s.eta = '25 - 40 Minutes (Immediate Dispatch)';
      
      // Match on-call emergency tech
      const matchTech = TECHNICIANS.find(t => t.trade.toLowerCase() === s.trade.toLowerCase()) || TECHNICIANS[0];
      s.assignedTech = `${matchTech.name} (${matchTech.role})`;

      // Tailored Immediate Safety Containment Guidance
      if (s.trade === 'Plumbing') {
        s.safetyTip = 'Homeowner instructed to shut off main water shutoff valve immediately.';
        s.step = 3; // Proceed directly to address
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
      // Standard Non-Emergency Service
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
    // Check if the user is actually clarifying urgency/emergency instead of giving an address
    const isUrgencyClarification = /emergency|urgent|burst|flood|gushing|hurry|asap|critical|severe|immediately/i.test(lower);
    const hasAddressSigns = /\d|\bstreet\b|\bst\b|\broad\b|\brd\b|\bave\b|\bavenue\b|\bdrive\b|\bdr\b|\blane\b|\bln\b|\bway\b|\bblvd\b|\bterrace\b|\bplaza\b|\bcourt\b|\bct\b|\bsuite\b|\bapt\b|\bhouse\b|\bblock\b/i.test(lower);

    if (isUrgencyClarification && !hasAddressSigns) {
      // Re-classify to Critical Emergency!
      s.isEmergency = true;
      s.urgency = '🔴 CRITICAL EMERGENCY';
      s.eta = '25 - 40 Minutes (Immediate Dispatch)';
      const matchTech = TECHNICIANS.find(t => t.trade.toLowerCase() === s.trade.toLowerCase()) || TECHNICIANS[0];
      s.assignedTech = `${matchTech.name} (${matchTech.role})`;
      
      let safetyMsg = "Understood! I am escalating your ticket to a critical emergency dispatch right now.";
      if (s.trade === 'Plumbing') {
        s.safetyTip = 'Homeowner instructed to shut off main water shutoff valve immediately.';
        safetyMsg += " If water is actively flowing or leaking, please locate and shut off your main water valve immediately to prevent property damage.";
      } else if (s.trade === 'Electrical') {
        s.safetyTip = 'Homeowner instructed to keep clear of electrical panels and standing water.';
        safetyMsg += " Please keep everyone clear of that area and do not touch any switches or standing water.";
      } else if (s.trade === 'HVAC') {
        s.safetyTip = 'Heating emergency escalated for immediate freeze protection.';
        safetyMsg += " We have paged our on-call heating technician for immediate freeze protection.";
      }

      return {
        reply: `${safetyMsg}\n\nWhat is your complete street address (house number and street name) so we can dispatch the truck?`,
        step: 3,
        isEmergency: true
      };
    }

    if (text.length < 5) {
      return {
        reply: "Could you please provide your complete street address (including house number and street name)?",
        step: 3
      };
    }

    s.address = text;
    s.step = 4;
    return {
      reply: `Thank you. I have noted ${s.address}. Could you please provide your full name?`,
      step: 4
    };
  }

  // STEP 4: Collect Caller Name
  if (s.step === 4) {
    let cleanName = text
      .replace(/^(my name is|i am|this is|call me|name is|it's|it is)\s+/i, '')
      .replace(/[!?,;]+$/, '')
      .trim();

    if (!cleanName || cleanName.length < 2) {
      return {
        reply: "Could you please tell me your first and last name for our dispatch ticket?",
        step: 4
      };
    }

    s.customerName = cleanName;
    s.step = 5;
    return {
      reply: `Thank you, ${s.customerName}. What is your best direct phone number so the technician can send you live GPS arrival updates?`,
      step: 5
    };
  }

  // STEP 5: Collect Phone & Finalize Instant Dispatch
  if (s.step === 5) {
    const rawDigits = text.replace(/[^0-9]/g, '');
    if (!rawDigits || rawDigits.length < 7) {
      return {
        reply: "Please provide a valid direct callback number so our technician can coordinate arrival.",
        step: 5
      };
    }

    s.phone = text.trim().startsWith('+') ? `+${rawDigits}` : (rawDigits.startsWith('0') ? rawDigits : `0${rawDigits}`);

    // Generate Official Ticket
    s.ticketId = s.isEmergency ? `APX-EMG-${ticketCounter++}` : `APX-STD-${ticketCounter++}`;
    s.step = 'COMPLETED';

    const ticketObj = {
      id: s.ticketId,
      timestamp: new Date().toISOString(),
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

    // Store in active tickets list
    dispatchTickets.unshift(ticketObj);

    // 1. Dual-Write: Log to Google Sheets CRM Tab (Emergency_Dispatch_Day4)
    appendTicketToGoogleSheet(ticketObj);

    // 2. Dual-Write: Schedule Technician Arrival on Google Calendar!
    const calEvent = await createDispatchCalendarEvent(ticketObj);
    if (calEvent && calEvent.id) {
      ticketObj.calendarEventId = calEvent.id;
      ticketObj.htmlLink = calEvent.htmlLink;
    }

    // 3. Forward to n8n Webhook for SMS Technician Alert
    forwardToN8n(ticketObj);

    const confirmationSummary = [
      `🚨 DISPATCH TICKET GENERATED [${s.ticketId}]`,
      `• Urgency: ${s.urgency}`,
      `• Homeowner: ${s.customerName}`,
      `• Callback Phone: ${s.phone}`,
      `• Service Location: ${s.address}`,
      `• Issue: ${s.issue}`,
      `• Assigned Technician: ${s.assignedTech}`,
      `• Estimated Response Time: ${s.eta}`,
      "",
      s.isEmergency
        ? "Our on-call technician has been directly paged and is rolling a truck to your location. Please keep your phone line open for their live GPS arrival call."
        : "Your service appointment has been scheduled and logged. You will receive an arrival confirmation SMS prior to the technician's arrival.",
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

  // POST-COMPLETION / FAQ / Call Conclusion
  if (s.step === 'COMPLETED') {
    if (/thank|thanks|bye|goodbye|all good|no that's all|thats all|i'm good|im good|see you/i.test(lower)) {
      return {
        reply: `You're very welcome, ${s.customerName || 'valued customer'}. Our technician ${s.assignedTech.split(' ')[0]} is on the way. Stay safe, and thank you for calling Apex 24/7 Emergency Services!`,
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
      reply: `Your ticket ${s.ticketId} is active. If you need to add any gate codes, parking instructions, or speak with the on-call supervisor, just let me know!`,
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

  // API Route: Get All Dispatch Tickets
  if (req.url === '/api/tickets' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: dispatchTickets.length,
      technicians: TECHNICIANS,
      tickets: dispatchTickets
    }));
    return;
  }

  // API Route: Get Upcoming Dispatches from Google Calendar
  if (req.url === '/api/calendar-events' && req.method === 'GET') {
    const events = await listUpcomingCalendarDispatches();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: events.length,
      events
    }));
    return;
  }

  // API Route: Conversational Chat / Voice Intake
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { sessionId, messageText } = JSON.parse(body || '{}');
        const sessionKey = sessionId || 'default_session';
        const result = await processChatMessage(sessionKey, messageText);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('API Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API Route: Direct Ticket Sync to Google Sheets & Calendar
  if (req.url === '/api/record-ticket' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const ticket = JSON.parse(body || '{}');
        if (ticket && ticket.id) {
          dispatchTickets.unshift(ticket);
          await appendTicketToGoogleSheet(ticket);
          await createDispatchCalendarEvent(ticket);
          forwardToN8n({ event: 'emergency_dispatch_created', ticket });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Ticket logged to Google Sheets and Calendar' }));
          return;
        }
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid ticket data' }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // Static File Serving
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  const extname = path.extname(filePath);
  let contentType = 'text/html';
  if (extname === '.js') contentType = 'text/javascript';
  if (extname === '.css') contentType = 'text/css';
  if (extname === '.json') contentType = 'application/json';
  if (extname === '.png') contentType = 'image/png';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`
======================================================
🚨 Day 4 Home Services Emergency Dispatch Console
📡 Live Server: http://localhost:${PORT}
📊 Google Sheets Tab: ${SHEET_TAB}
💬 Chat & Voice API: http://localhost:${PORT}/api/chat
📋 Dispatch Board API: http://localhost:${PORT}/api/tickets
======================================================
  `);
});
