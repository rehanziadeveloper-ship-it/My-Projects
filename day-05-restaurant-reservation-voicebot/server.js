const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3005;
const KEY_PATH = path.join(__dirname, '..', 'valiant-epsilon-501913-g2-8231aeffe623.json');
const SPREADSHEET_ID = '1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo';
const SHEET_TAB = 'Restaurant_Reservations_Day5';
const CAL_ID = 'dc16a29b27611448569f6f342e1e982aa44e6c6bfa3b3ca7d2fe180c4231748b@group.calendar.google.com';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1767318.hstgr.cloud/webhook/restaurant-table-reservations';

// Load Service Account
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

  const exp = now + 3600;
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: serviceAccount.client_email,
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

// Restaurant Seating Tables Inventory
const TABLES = [
  { id: 'T1', name: 'Table 1', area: 'Indoor Window', capacity: 2, desc: 'Quiet 2-top by garden window' },
  { id: 'T2', name: 'Table 2', area: 'Indoor Main', capacity: 2, desc: 'Intimate candlelit dining' },
  { id: 'T3', name: 'Table 3', area: 'Indoor Main', capacity: 4, desc: 'Prime center dining banquette' },
  { id: 'T4', name: 'Table 4', area: 'Indoor Main', capacity: 4, desc: 'Spacious dining table' },
  { id: 'T5', name: 'Table 5', area: 'Indoor Main', capacity: 6, desc: 'Family leather booth' },
  { id: 'T6', name: 'Table 6', area: 'Indoor Main', capacity: 8, desc: 'Large executive dining banquet' },
  { id: 'P1', name: 'Patio P1', area: 'Garden Patio', capacity: 2, desc: 'Pergola fairy-light bistro table' },
  { id: 'P2', name: 'Patio P2', area: 'Garden Patio', capacity: 2, desc: 'Fountain-side romantic 2-top' },
  { id: 'P3', name: 'Patio P3', area: 'Garden Patio', capacity: 4, desc: 'Heated open-air terrace table' },
  { id: 'P4', name: 'Patio P4', area: 'Garden Patio', capacity: 4, desc: 'Sunset garden view table' },
  { id: 'PR1', name: 'Wine Cellar Suite', area: 'Private Dining', capacity: 14, desc: 'Exclusive private dining cellar room' }
];

// In-Memory Reservations Cache
let activeReservations = [];
let reservationCounter = 201;
const sessions = {};

function getOrCreateSession(sessionId) {
  if (!sessions[sessionId]) {
    sessions[sessionId] = {
      step: 1,
      intent: null, // 'RESERVATION' | 'MENU_QA'
      partySize: 2,
      dateTimeText: 'Tonight at 7:30 PM',
      scheduledStart: null,
      scheduledEnd: null,
      seatingPreference: 'Indoor Dining',
      occasionNotes: 'Casual Dining',
      tableAssigned: 'Table 3 (Indoor Main)',
      guestName: null,
      phone: null,
      reservationId: null
    };
  }
  return sessions[sessionId];
}

// Menu Knowledge & Dietary RAG Engine
function queryMenuAndRestaurantKnowledge(lower) {
  // Vegan Options
  if (/vegan|plant[- ]based/i.test(lower)) {
    return "For our vegan guests, Chef Marco prepares our signature Wild Mushroom & Black Truffle Risotto (made with rich vegetable fumetto and Arborio rice), our Wood-Fired Margherita with dairy-free artisan cashew mozzarella, and our Charred Heirloom Tomato & Basil Bruschetta. All pastas can also be prepared with our house marinara.";
  }
  // Vegetarian Options
  if (/vegetarian|veggie|meatless/i.test(lower)) {
    return "We have wonderful vegetarian selections! In addition to our handcrafted Margherita con Bufala pizza and Wild Mushroom Risotto, we feature our famous Eggplant Parmigiana alla Napoletana, Handmade Ricotta & Spinach Ravioli with sage brown butter, and crisp Gnocchi Sorrentina.";
  }
  // Gluten-Free Options
  if (/gluten[- ]free|celiac|gluten/i.test(lower)) {
    return "We proudly accommodate gluten-free dining! We offer imported certified gluten-free Penne and Rigatoni for any of our pasta dishes. Our Pan-Seared Mediterranean Branzino with lemon herb salsa, our Grilled Prime Fiorentina Ribeye, and our Antipasto Misto are naturally 100% gluten-free.";
  }
  // Halal / Kosher / Pork Inquiries
  if (/halal|kosher|pork|bacon|gelatin/i.test(lower)) {
    return "Our chicken and beef steaks are sourced from certified Halal purveyors. We do serve traditional Italian prosciutto and pancetta on specific charcuterie boards, but our kitchen maintains dedicated separate prep surfaces and sauté pans upon request.";
  }
  // Nut Allergies
  if (/nut|peanut|tree nut|allergy|allergies/i.test(lower)) {
    return "Our kitchen is completely peanut-free! We do utilize pine nuts in our traditional Genovese pesto and walnuts in our Gorgonzola salad. Please alert our server, and our culinary team will prepare your dishes in an allergen-isolated cookware station.";
  }
  // Signature Dishes & Specials
  if (/signature|special|specials|popular|bestseller|recommend|recommendation|chef/i.test(lower)) {
    return "Chef Marco's top recommendations this evening are our Slow-Braised Veal Osso Buco served over saffron risotto ($42), our Handmade Pappardelle with Wild Boar ragù ($28), and our Wood-Fired Pizza Regina with San Marzano tomatoes, prosciutto di Parma, and fresh burrata ($24).";
  }
  // Operating Hours
  if (/hours|time|open|close|closing|schedule|lunch|dinner/i.test(lower) && !/tonight|tomorrow|pm|am|\d/i.test(lower)) {
    return "Bella Vista is open Tuesday through Sunday. We serve Lunch from 12:00 PM to 3:00 PM, and Dinner from 5:00 PM to 10:30 PM. We are closed on Mondays for kitchen prep.";
  }
  // Parking & Valet
  if (/parking|valet|park|car/i.test(lower)) {
    return "We offer complimentary valet parking directly at our front entrance every Friday and Saturday evening starting at 6:00 PM. For all other evenings, we have a private dedicated guest parking plaza right adjacent to the restaurant.";
  }
  // Dress Code
  if (/dress code|wear|attire|formal|jacket/i.test(lower)) {
    return "Our dress code is Smart Casual. Collared shirts, stylish denim, dresses, and blazers are welcome. We kindly ask guests to refrain from athletic gym wear or beach flip-flops.";
  }
  // Corkage & Cake Cutting Fee
  if (/corkage|bring wine|cake fee|birthday cake/i.test(lower)) {
    return "Our wine corkage fee is $25 per 750ml bottle for bottles not present on our curated wine list (limit two bottles per party). There is no cake-cutting fee if you bring a celebratory dessert!";
  }
  // Pricing & Average Check
  if (/price|pricing|cost|how much|average check|expensive/i.test(lower)) {
    return "Our appetizers range from $14 to $22, handcrafted pastas are $22 to $32, and prime seafood and meat entrées range from $34 to $48. An average dinner for two with wine is approximately $110 to $140.";
  }
  return null;
}

// Find Next Available Table (Conflict-Free Seating & Capacity Allocation)
function allocateTableAndSlot(existingBookings, partySize, seatingPref, targetDateTime) {
  const now = new Date();
  let bookingStart = targetDateTime || new Date(now.getTime() + 60 * 60000); // Default in 1 hour
  bookingStart.setSeconds(0, 0);

  // If time in the past, push to tonight or tomorrow
  if (bookingStart < now) {
    bookingStart = new Date(now.getTime() + 60 * 60000);
  }

  const bookingEnd = new Date(bookingStart.getTime() + 90 * 60000); // 90 min seating

  // Filter tables by capacity
  const suitableTables = TABLES.filter(t => t.capacity >= partySize);
  
  // Prioritize seating area preference
  const prefLower = (seatingPref || '').toLowerCase();
  let prioritized = [...suitableTables];
  if (/patio|outdoor|garden|terrace/i.test(prefLower)) {
    prioritized.sort((a, b) => (a.area.includes('Patio') ? -1 : 1));
  } else if (/window/i.test(prefLower)) {
    prioritized.sort((a, b) => (a.area.includes('Window') ? -1 : 1));
  } else if (/private|cellar/i.test(prefLower)) {
    prioritized.sort((a, b) => (a.area.includes('Private') ? -1 : 1));
  } else {
    prioritized.sort((a, b) => (a.area.includes('Indoor') ? -1 : 1));
  }

  // Find table with no overlapping reservation
  for (const table of prioritized) {
    const hasConflict = existingBookings.some(b => {
      if (b.tableId !== table.id) return false;
      const bStart = new Date(b.scheduledStart);
      const bEnd = new Date(b.scheduledEnd);
      return bStart < bookingEnd && bEnd > bookingStart;
    });

    if (!hasConflict) {
      return {
        table,
        start: bookingStart,
        end: bookingEnd,
        slotLabel: bookingStart.toLocaleString('en-US', {
          weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
        })
      };
    }
  }

  // Fallback: assign first suitable table with slight 15-min shift if busy
  const assigned = prioritized[0] || TABLES[2];
  return {
    table: assigned,
    start: bookingStart,
    end: bookingEnd,
    slotLabel: bookingStart.toLocaleString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    })
  };
}

// Create Google Calendar Reservation Block
async function createCalendarReservationEvent(reservation) {
  try {
    const token = await getGoogleAccessToken();
    const startIso = reservation.scheduledStart;
    const endIso = reservation.scheduledEnd;

    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: `🍝 Bella Vista Reservation: ${reservation.guestName} (Party of ${reservation.partySize} - ${reservation.tableAssigned})`,
        location: 'Bella Vista Italian Bistro, 742 Bellissimo Way',
        description: [
          `Reservation ID: ${reservation.id}`,
          `Guest: ${reservation.guestName}`,
          `Phone: ${reservation.phone}`,
          `Party Size: ${reservation.partySize} Guests`,
          `Table Assigned: ${reservation.tableAssigned}`,
          `Seating Preference: ${reservation.seatingPreference}`,
          `Occasion / Dietary Notes: ${reservation.occasionNotes}`,
          `Reservation Window: ${reservation.slotLabel}`,
          `Booked via: Bella Vista Autonomous Voice AI Host ('Marco')`
        ].join('\n'),
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

    const eventData = await res.json();
    console.log(`📅 [Google Calendar Booked] Event ID: ${eventData.id} | Table: ${reservation.tableAssigned}`);
    return eventData;
  } catch (err) {
    console.error(`❌ [Google Calendar Error]:`, err.message);
    return null;
  }
}

// Append Reservation to Google Sheets (Restaurant_Reservations_Day5)
async function appendReservationToGoogleSheet(reservation) {
  try {
    const token = await getGoogleAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_TAB + '!A1')}:append?valueInputOption=USER_ENTERED`;

    const row = [
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }),
      reservation.id,
      reservation.guestName,
      reservation.phone,
      reservation.slotLabel,
      `${reservation.partySize} Guests`,
      reservation.seatingPreference,
      reservation.occasionNotes,
      reservation.tableAssigned,
      'CONFIRMED'
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
    console.log(`✅ [Google Sheets Logged] Reservation ${reservation.id} appended to ${SHEET_TAB}:`, data.updates?.updatedRange);
    return data;
  } catch (err) {
    console.error(`❌ [Google Sheets Error]:`, err.message);
  }
}

// List Upcoming Reservations from Google Calendar
async function listUpcomingReservations() {
  try {
    const token = await getGoogleAccessToken();
    const now = new Date();
    now.setHours(now.getHours() - 2); // Show recent & upcoming
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events?timeMin=${encodeURIComponent(now.toISOString())}&singleEvents=true&orderBy=startTime&maxResults=25`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return (data.items || []).filter(e => /Bella Vista/i.test(e.summary || '')).map(e => ({
      id: e.id,
      summary: e.summary,
      location: e.location,
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
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
    console.log(`[n8n Forwarder] Status: ${res.status}`);
  } catch (err) {
    console.error(`[n8n Forwarder] Error:`, err.message);
  }
}

// Conversational State Machine for Restaurant Host ("Marco")
async function processChatMessage(sessionId, userMessage) {
  const s = getOrCreateSession(sessionId);
  const text = (userMessage || '').trim();
  const lower = text.toLowerCase();

  // Reset
  if (/^(reset|restart|start\s*over|clear|new\s*call|new\s*reservation)$/i.test(lower)) {
    sessions[sessionId] = null;
    return {
      reply: "Buonasera and welcome to Bella Vista Italian Ristorante! My name is Marco. Are you looking to reserve a table with us, or would you like to inquire about our menu and evening specials?",
      step: 1,
      isBooked: false
    };
  }

  // Dietary & Menu Knowledge Q&A Check (Can trigger at ANY point in the conversation)
  const menuAnswer = queryMenuAndRestaurantKnowledge(lower);
  if (menuAnswer) {
    if (s.step === 1) {
      return {
        reply: `${menuAnswer}\n\nWould you like me to reserve a wonderful table for you this evening or another day?`,
        step: 1
      };
    }
    if (s.step === 2) {
      return {
        reply: `${menuAnswer}\n\nWhat day and time would you like to join us for dinner?`,
        step: 2
      };
    }
    if (s.step === 3) {
      return {
        reply: `${menuAnswer}\n\nWould you prefer our romantic garden patio or our main indoor dining room?`,
        step: 3
      };
    }
    if (s.step === 'COMPLETED') {
      return {
        reply: `${menuAnswer}\n\nIs there anything else I can assist you with regarding your reservation?`,
        step: 'COMPLETED'
      };
    }
  }

  // STEP 1: Detect Party Size & Intent
  if (s.step === 1) {
    const isReserveIntent = /table|reserve|reservation|booking|book|dinner|lunch|eat|dine|party|tonight|tomorrow|friday|saturday|sunday/i.test(lower);
    const sizeMatch = text.match(/\b([1-9]|1[0-4])\b|one|two|three|four|five|six|seven|eight|couple/i);

    let parsedSize = 2;
    if (sizeMatch) {
      const w = sizeMatch[0].toLowerCase();
      if (w === 'one') parsedSize = 1;
      else if (w === 'two' || w === 'couple') parsedSize = 2;
      else if (w === 'three') parsedSize = 3;
      else if (w === 'four') parsedSize = 4;
      else if (w === 'five') parsedSize = 5;
      else if (w === 'six') parsedSize = 6;
      else if (w === 'seven') parsedSize = 7;
      else if (w === 'eight') parsedSize = 8;
      else parsedSize = parseInt(sizeMatch[1] || '2', 10);
    }

    s.partySize = parsedSize;

    if (isReserveIntent || sizeMatch) {
      s.step = 2;
      return {
        reply: `Fantastico! I would be delighted to arrange a table for a party of ${s.partySize}. What date and time would you like to dine with us? For instance, tonight at 7:30 PM, or another evening?`,
        step: 2
      };
    }

    // Default prompt if general greeting
    return {
      reply: "We would love to host you! Are you looking to reserve a table for dinner, or can I answer any questions about our chef specials, pasta selections, or wine pairings?",
      step: 1
    };
  }

  // STEP 2: Collect Date & Preferred Dining Time
  if (s.step === 2) {
    s.dateTimeText = text;
    s.step = 3;
    return {
      reply: `Perfetto, I have noted ${s.dateTimeText} for your party of ${s.partySize}. Would you prefer our main indoor dining room, our romantic garden patio, or a quiet window table? Also, are you celebrating any special occasion?`,
      step: 3
    };
  }

  // STEP 3: Collect Seating Preference & Occasion Notes
  if (s.step === 3) {
    if (/patio|garden|outside|outdoor|terrace/i.test(lower)) {
      s.seatingPreference = 'Garden Patio';
    } else if (/window/i.test(lower)) {
      s.seatingPreference = 'Indoor Window';
    } else if (/private|cellar/i.test(lower)) {
      s.seatingPreference = 'Private Wine Cellar Suite';
    } else {
      s.seatingPreference = 'Main Dining Room';
    }

    s.occasionNotes = text;
    s.step = 4;
    return {
      reply: `Understood, ${s.seatingPreference} will be wonderful. May I please have your full name for the reservation?`,
      step: 4
    };
  }

  // STEP 4: Collect Guest Name
  if (s.step === 4) {
    let cleanName = text.replace(/^(my name is|i am|this is|it's|name is)\s+/i, '').replace(/[!?,;]+$/, '').trim();
    if (!cleanName || cleanName.length < 2) {
      return { reply: "Could you please tell me your first and last name for the table holding card?", step: 4 };
    }
    s.guestName = cleanName;
    s.step = 5;
    return {
      reply: `Grazie, ${s.guestName}! And what is the best direct mobile number to send your instant confirmation SMS and table details?`,
      step: 5
    };
  }

  // STEP 5: Collect Phone & Finalize Instant Table Reservation
  if (s.step === 5) {
    const rawDigits = text.replace(/[^0-9]/g, '');
    if (!rawDigits || rawDigits.length < 7) {
      return { reply: "Please provide a valid callback number so we can text you your reservation confirmation code.", step: 5 };
    }

    s.phone = text.trim().startsWith('+') ? `+${rawDigits}` : (rawDigits.startsWith('0') ? rawDigits : `0${rawDigits}`);
    s.reservationId = `BV-RES-${reservationCounter++}`;
    s.step = 'COMPLETED';

    // Parse target date/time for conflict-free allocation
    const targetDate = new Date();
    targetDate.setHours(19, 30, 0, 0); // Default 7:30 PM
    if (/tomorrow/i.test(s.dateTimeText)) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    const timeMatch = s.dateTimeText.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
    if (timeMatch) {
      let h = parseInt(timeMatch[1], 10);
      const m = parseInt(timeMatch[2] || '0', 10);
      const ampm = (timeMatch[3] || '').toLowerCase();
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      targetDate.setHours(h, m, 0, 0);
    }

    // Allocate table with conflict prevention
    const allocation = allocateTableAndSlot(activeReservations, s.partySize, s.seatingPreference, targetDate);
    s.tableAssigned = `${allocation.table.name} (${allocation.table.area})`;
    s.scheduledStart = allocation.start.toISOString();
    s.scheduledEnd = allocation.end.toISOString();

    const reservationObj = {
      id: s.reservationId,
      timestamp: new Date().toISOString(),
      scheduledStart: s.scheduledStart,
      scheduledEnd: s.scheduledEnd,
      slotLabel: allocation.slotLabel,
      guestName: s.guestName,
      phone: s.phone,
      partySize: s.partySize,
      seatingPreference: s.seatingPreference,
      occasionNotes: s.occasionNotes,
      tableId: allocation.table.id,
      tableAssigned: s.tableAssigned,
      status: 'CONFIRMED'
    };

    activeReservations.unshift(reservationObj);

    // 1. Sync to Google Sheets CRM (Tab: Restaurant_Reservations_Day5)
    await appendReservationToGoogleSheet(reservationObj);

    // 2. Schedule in Google Calendar
    await createCalendarReservationEvent(reservationObj);

    // 3. Forward to n8n webhook
    forwardToN8n({ event: 'restaurant_reservation_booked', reservation: reservationObj });

    const summaryText = [
      `🎉 TABLE RESERVATION CONFIRMED [${s.reservationId}]`,
      `• Guest: ${s.guestName}`,
      `• Party Size: ${s.partySize} Guests`,
      `• Arrival Time: ${allocation.slotLabel}`,
      `• Seating Area: ${s.seatingPreference}`,
      `• Table Assigned: ${s.tableAssigned}`,
      `• Confirmation Sent to: ${s.phone}`,
      "",
      `Your table has been prepared and reserved. We look forward to giving you an unforgettable culinary experience at Bella Vista!`,
      "",
      "Can I answer any questions about our wine menu or valet parking?"
    ].join('\n');

    return {
      reply: summaryText,
      step: 'COMPLETED',
      isBooked: true,
      reservation: reservationObj,
      endCall: false
    };
  }

  // POST-COMPLETION
  if (s.step === 'COMPLETED') {
    if (/thank|thanks|grazie|bye|goodbye|all good|no that's all|see you/i.test(lower)) {
      return {
        reply: `Prego, ${s.guestName || 'valued guest'}! Chef Marco and our entire team look forward to welcoming you. Have a wonderful rest of your day!`,
        step: 'COMPLETED',
        endCall: true
      };
    }
    return {
      reply: `Your reservation ${s.reservationId} is confirmed for ${s.partySize} guests at ${s.tableAssigned}. If you need to make any changes or add notes for the chef, just let me know!`,
      step: 'COMPLETED'
    };
  }
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Route: Get All Active Reservations & Floor Matrix
  if (req.url === '/api/reservations' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: activeReservations.length,
      tables: TABLES,
      reservations: activeReservations
    }));
    return;
  }

  // API Route: Get Google Calendar Reservation Events
  if (req.url === '/api/calendar-events' && req.method === 'GET') {
    const events = await listUpcomingReservations();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      count: events.length,
      events
    }));
    return;
  }

  // API Route: Voice / Chat Intake
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const { sessionId, messageText } = JSON.parse(body || '{}');
        const sessionKey = sessionId || 'default_bistro_session';
        const result = await processChatMessage(sessionKey, messageText);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        console.error('Chat API Error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // API Route: Direct Reservation Sync
  if (req.url === '/api/record-reservation' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const reservation = JSON.parse(body || '{}');
        if (reservation && reservation.id) {
          activeReservations.unshift(reservation);
          await appendReservationToGoogleSheet(reservation);
          await createCalendarReservationEvent(reservation);
          forwardToN8n({ event: 'restaurant_reservation_booked', reservation });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'Reservation synced to Sheets & Calendar' }));
          return;
        }
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid reservation payload' }));
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
🍝 Day 5 Bella Vista Restaurant Voice AI & Reservations
📡 Live Server: http://localhost:${PORT}
📊 Google Sheets Tab: ${SHEET_TAB}
📆 Google Calendar ID: ${CAL_ID}
💬 Voice & Chat API: http://localhost:${PORT}/api/chat
📋 Floor & Seating API: http://localhost:${PORT}/api/reservations
======================================================
  `);
});
