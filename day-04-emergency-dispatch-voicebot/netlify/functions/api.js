const crypto = require('crypto');

// Master On-Call Technicians Pool
const TECHNICIANS = [
  { name: 'Dave Miller', trade: 'Plumbing', role: 'Master Plumber (Emergency Unit #4)', status: 'ON_CALL', phone: '+1 (555) 234-5678' },
  { name: 'Sarah Lin', trade: 'HVAC', role: 'Lead HVAC Specialist (Unit #2)', status: 'ON_CALL', phone: '+1 (555) 876-5432' },
  { name: 'Marcus Vance', trade: 'Electrical', role: 'Senior Master Electrician (Unit #7)', status: 'ON_CALL', phone: '+1 (555) 345-6789' }
];

let dispatchTickets = [];
let ticketCounter = 101;
const sessions = {};

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

async function processChatMessage(sessionId, messageText) {
  const s = getOrCreateSession(sessionId);
  const text = (messageText || '').trim();
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
    const hasAddressSigns = /\d|street|st\b|road|rd\b|ave|avenue|drive|dr\b|lane|ln\b|way|blvd|terrace|plaza|court|ct\b|suite|apt|house|block/i.test(lower);

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

    dispatchTickets.unshift(ticketObj);

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
        : "Your service appointment has been scheduled and logged.",
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
      reply: `Your ticket ${s.ticketId} is active. If you need anything else, just let me know!`,
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
    'Content-Type': 'application/json'
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
          start: t.timestamp,
          description: `Assigned: ${t.assignedTech}\nIssue: ${t.issue}\nStatus: ${t.status}`
        }))
      })
    };
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

  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({ error: 'Endpoint not found' })
  };
};
