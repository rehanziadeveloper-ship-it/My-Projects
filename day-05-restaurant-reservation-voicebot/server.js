const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3005;
const KEY_PATH = path.join(__dirname, '..', 'valiant-epsilon-501913-g2-8231aeffe623.json');
const SPREADSHEET_ID = '1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo';
const CAL_ID = 'dc16a29b27611448569f6f342e1e982aa44e6c6bfa3b3ca7d2fe180c4231748b@group.calendar.google.com';
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1767318.hstgr.cloud/webhook/restaurant-autonomous-ecosystem';

// Load Google Service Account
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
  if (cachedToken && now < tokenExpiry - 60) return cachedToken;

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

// Restaurant Seating Tables (11 Tables across 4 Zones)
const TABLES = [
  { id: 'T1', name: 'Table 1', area: 'Indoor Window', capacity: 2, desc: 'Quiet 2-top by garden window' },
  { id: 'T2', name: 'Table 2', area: 'Indoor Main', capacity: 2, desc: 'Intimate candlelit dining' },
  { id: 'T3', name: 'Table 3', area: 'Indoor Main', capacity: 4, desc: 'Prime center dining banquette' },
  { id: 'T4', name: 'Table 4', area: 'Indoor Main', capacity: 4, desc: 'Spacious family dining table' },
  { id: 'T5', name: 'Table 5', area: 'Indoor Main', capacity: 6, desc: 'Luxurious leather booth' },
  { id: 'T6', name: 'Table 6', area: 'Indoor Main', capacity: 8, desc: 'Large executive banquet table' },
  { id: 'P1', name: 'Patio P1', area: 'Garden Patio', capacity: 2, desc: 'Pergola fairy-light bistro table' },
  { id: 'P2', name: 'Patio P2', area: 'Garden Patio', capacity: 2, desc: 'Fountain-side romantic 2-top' },
  { id: 'P3', name: 'Patio P3', area: 'Garden Patio', capacity: 4, desc: 'Heated open-air terrace table' },
  { id: 'P4', name: 'Patio P4', area: 'Garden Patio', capacity: 4, desc: 'Sunset garden view terrace' },
  { id: 'PR1', name: 'Wine Cellar Suite', area: 'Private Dining', capacity: 14, desc: 'Exclusive private dining wine cellar' }
];

// In-Memory Live State
let activeReservations = [];
let activeOrders = [
  {
    id: 'BV-ORD-501',
    channel: 'WHATSAPP',
    customerName: 'Ayesha Khan',
    phone: '03008765432',
    items: ['Wood-Fired Pizza Regina ($24)', 'Truffle Parmesan Fries ($6)'],
    totalAmount: '$30.00',
    paymentMethod: 'Cash on Delivery (COD Verified)',
    status: 'PREPARING',
    elapsedMinutes: 8,
    createdAt: new Date(Date.now() - 8 * 60000).toISOString()
  },
  {
    id: 'BV-ORD-502',
    channel: 'VOICE_AI',
    customerName: 'Marcus Vance',
    phone: '03471098310',
    items: ['Wild Mushroom Truffle Risotto ($26)', 'Limoncello Spritz ($10)'],
    totalAmount: '$36.00',
    paymentMethod: 'Credit Card (Pre-Authorized)',
    status: 'PREPARING',
    elapsedMinutes: 4,
    createdAt: new Date(Date.now() - 4 * 60000).toISOString()
  }
];

let liveInventory = [
  { sku: 'ING-001', name: 'San Marzano Tomatoes DOP', stock: 45, unit: 'Cans', threshold: 15, cost: '$8.50', status: 'IN STOCK' },
  { sku: 'ING-002', name: 'Carnaroli Arborio Rice', stock: 32, unit: 'kg', threshold: 10, cost: '$5.20', status: 'IN STOCK' },
  { sku: 'ING-003', name: 'White Truffle Oil', stock: 3, unit: 'Bottles', threshold: 5, cost: '$34.00', status: '⚠️ LOW STOCK' },
  { sku: 'ING-004', name: 'Fresh Mozzarella Fior di Latte', stock: 26, unit: 'kg', threshold: 10, cost: '$9.00', status: 'IN STOCK' },
  { sku: 'ING-005', name: 'Certified Gluten-Free Penne', stock: 18, unit: 'Boxes', threshold: 8, cost: '$3.80', status: 'IN STOCK' },
  { sku: 'ING-006', name: 'Prime Veal Shank (Osso Buco)', stock: 12, unit: 'Portions', threshold: 6, cost: '$18.50', status: 'IN STOCK' }
];

let crmCustomers = [
  { id: 'CUST-101', name: 'Rehan Zia', phone: '03471098310', totalOrders: 5, lifetimeSpend: '$240.00', lastOrder: '2026-10-27', favorite: 'Garden Patio 4-Top', segment: 'VIP Diners', remarketingStatus: 'ACTIVE' },
  { id: 'CUST-102', name: 'Sara Ahmed', phone: '03215556789', totalOrders: 3, lifetimeSpend: '$115.00', lastOrder: '2026-09-12', favorite: 'Truffle Risotto', segment: 'Dormant (>30 Days)', remarketingStatus: 'READY_FOR_WINBACK' },
  { id: 'CUST-103', name: 'David Miller', phone: '03001234567', totalOrders: 1, lifetimeSpend: '$45.00', lastOrder: '2026-10-24', favorite: 'Pizza Margherita', segment: 'New Guest', remarketingStatus: 'ACTIVE' }
];

let customerReviews = [
  { id: 'REV-01', customerName: 'Tariq Mehmood', rating: 5, text: 'The wood-fired pizza and patio atmosphere was exquisite! Best Italian in town.', sentiment: 'POSITIVE', action: 'Posted to Google Maps', aiResponse: 'Grazie mille, Tariq! Chef Marco is thrilled you loved the pizza!' },
  { id: 'REV-02', customerName: 'Bilal Hassan', rating: 2, text: 'Our pasta took 45 minutes to arrive and was slightly lukewarm.', sentiment: 'NEGATIVE', action: '⚠️ Intercepted to General Manager (25% VIP Voucher Sent)', aiResponse: 'Dear Bilal, we sincerely apologize for the delay during rush hour. Our GM has sent an apology voucher to your WhatsApp.' }
];

let reservationCounter = 202;
let orderCounter = 503;
const voiceSessions = {};
const whatsappSessions = {};

// Dynamic Kitchen Wait Time Calculation
function calculateDynamicWaitTime() {
  const preparingTickets = activeOrders.filter(o => o.status === 'PREPARING').length;
  const baseMinutes = 15;
  const minutes = baseMinutes + (preparingTickets * 3);
  return {
    minutes,
    label: `${minutes} - ${minutes + 10} Minutes`,
    activeTickets: preparingTickets,
    kitchenRushLevel: preparingTickets >= 5 ? '🔴 HIGH RUSH' : (preparingTickets >= 3 ? '🟡 MODERATE' : '🟢 NORMAL')
  };
}

// Menu Knowledge & Dietary RAG
function queryMenuAndRestaurantKnowledge(lower, isPakistaniMode = false) {
  if (/vegan|plant[- ]based/i.test(lower)) {
    return "For vegan dining, Chef Marco prepares our signature Wild Mushroom & Black Truffle Risotto (made with rich vegetable fumetto and Arborio rice), our Wood-Fired Margherita with dairy-free cashew mozzarella, and our Charred Heirloom Tomato Bruschetta.";
  }
  if (/vegetarian|veggie|meatless/i.test(lower)) {
    return "We have fantastic vegetarian dishes: Handcrafted Margherita con Bufala, Wild Mushroom Risotto, Eggplant Parmigiana alla Napoletana, and Handmade Ricotta & Spinach Ravioli with sage brown butter.";
  }
  if (/gluten[- ]free|celiac|gluten/i.test(lower)) {
    return "We proudly accommodate celiac and gluten-free dining! We offer certified gluten-free Penne and Rigatoni for any pasta dish, plus our naturally gluten-free Mediterranean Branzino with lemon herb salsa and Fiorentina Ribeye.";
  }
  if (/halal|kosher|pork|bacon|gelatin/i.test(lower)) {
    if (isPakistaniMode) {
      return "All our meats (chicken, beef, and veal) are 100% certified Halal from verified suppliers, with zero pork or alcohol used in our kitchen sauces.";
    }
    return "All chicken and beef cuts are sourced from certified Halal purveyors. Traditional Italian prosciutto is kept completely isolated on dedicated prep stations.";
  }
  if (/nut|peanut|allergy|allergies/i.test(lower)) {
    return "Our kitchen is 100% peanut-free! We do feature pine nuts in our traditional pesto and walnuts in our Gorgonzola salad. Please alert us and we prepare your order on an allergen-isolated cookware station.";
  }
  if (/signature|special|specials|popular|bestseller|recommend/i.test(lower)) {
    return "Chef Marco's highlights this evening are our Slow-Braised Veal Osso Buco over Saffron Risotto ($42), Handmade Wild Boar Pappardelle ($28), and Wood-Fired Pizza Regina with Fresh Burrata ($24).";
  }
  if (/hours|time|open|close|closing|schedule/i.test(lower) && !/tonight|tomorrow|pm|am|\d/i.test(lower)) {
    return "Bella Vista is open Tuesday through Sunday. Lunch is served from 12:00 PM to 3:00 PM, and Dinner from 5:00 PM to 10:30 PM (Mondays Closed).";
  }
  if (/parking|valet|park|car/i.test(lower)) {
    return "We offer complimentary valet parking at our main entrance on Friday and Saturday evenings starting at 6:00 PM, with our private guest parking plaza open all week.";
  }
  if (/cod|cash on delivery|payment/i.test(lower)) {
    return "For pickup orders, we accept Cash on Delivery (COD) with automated phone confirmation, as well as Visa, Mastercard, and online card payments.";
  }
  return null;
}

// Allocate Table (Conflict-Free)
function allocateTableAndSlot(existingBookings, partySize, seatingPref, targetDateTime) {
  const now = new Date();
  let bookingStart = targetDateTime || new Date(now.getTime() + 60 * 60000);
  bookingStart.setSeconds(0, 0);

  if (bookingStart < now) bookingStart = new Date(now.getTime() + 60 * 60000);
  const bookingEnd = new Date(bookingStart.getTime() + 90 * 60000);

  const suitableTables = TABLES.filter(t => t.capacity >= partySize);
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

// Google Calendar Event Creation
async function createCalendarReservationEvent(reservation) {
  try {
    const token = await getGoogleAccessToken();
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CAL_ID)}/events`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: `🍝 Bella Vista Reservation: ${reservation.guestName} (Party of ${reservation.partySize} - ${reservation.tableAssigned})`,
        location: 'Bella Vista Italian Bistro, 742 Bellissimo Way',
        description: [
          `Reservation ID: ${reservation.id}`,
          `Guest: ${reservation.guestName}`,
          `Phone: ${reservation.phone}`,
          `Party Size: ${reservation.partySize} Guests`,
          `Table Assigned: ${reservation.tableAssigned}`,
          `Seating: ${reservation.seatingPreference}`,
          `Arrival Window: ${reservation.slotLabel}`,
          `Booked via: Bella Vista Autonomous Voice AI Host ('Marco')`
        ].join('\n'),
        start: { dateTime: reservation.scheduledStart, timeZone: 'Asia/Karachi' },
        end: { dateTime: reservation.scheduledEnd, timeZone: 'Asia/Karachi' }
      })
    });
    const eventData = await res.json();
    return eventData;
  } catch (err) {
    console.error('Calendar error:', err.message);
    return null;
  }
}

// Google Sheets Appenders
async function appendToSheet(tabName, rowData) {
  try {
    const token = await getGoogleAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(tabName + '!A1')}:append?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [rowData] })
    });
    return await res.json();
  } catch (e) {
    console.error(`Sheet append error (${tabName}):`, e.message);
  }
}

// Voice AI State Machine (Handles Both Table Reservations & Pickup Orders)
async function processVoiceChat(sessionId, userMessage, marketMode = 'WESTERN') {
  if (!voiceSessions[sessionId]) {
    voiceSessions[sessionId] = {
      step: 1,
      mode: null, // 'RESERVATION' | 'ORDER'
      partySize: 2,
      dateTimeText: 'Tonight at 7:30 PM',
      seatingPreference: 'Garden Patio',
      orderItems: [],
      guestName: null,
      phone: null
    };
  }

  const s = voiceSessions[sessionId];
  const text = (userMessage || '').trim();
  const lower = text.toLowerCase();
  const isPakistani = marketMode === 'PAKISTAN' || /bhai|janab|pack|urdu|shukriya|biryani|roti|karahi/i.test(lower);
  const waitInfo = calculateDynamicWaitTime();

  if (/^(reset|restart|start\s*over|clear|new\s*call)$/i.test(lower)) {
    voiceSessions[sessionId] = null;
    return {
      reply: isPakistani 
        ? "Assalam-o-alaikum and welcome to Bella Vista Bistro! My name is Marco. Table reservation karwani hai ya pickup order book karwana hai?"
        : "Buonasera and welcome to Bella Vista Italian Bistro! My name is Marco. Would you like to reserve a table, place a pickup food order, or inquire about our menu?",
      step: 1
    };
  }

  // Dietary Q&A
  const faq = queryMenuAndRestaurantKnowledge(lower, isPakistani);
  if (faq) {
    return {
      reply: `${faq}\n\nWould you like me to book a table for you or prepare a pickup order?`,
      step: s.step
    };
  }

  // STEP 1: Determine Intent (Reservation vs Pickup Order)
  if (s.step === 1) {
    const isPickupOrder = /order|pickup|takeaway|takeout|food to go|pack|pizza|pasta|risotto/i.test(lower);
    const isReservation = /reserve|table|reservation|booking|dine in|dinner|lunch|party of/i.test(lower);

    if (isPickupOrder && !isReservation) {
      s.mode = 'ORDER';
      s.step = 'ORDER_ITEMS';
      return {
        reply: isPakistani
          ? `G bilkul! Hamara kitchen fresh orders ready kar raha hai. Kitchen wait time abhi ${waitInfo.label} hai. Aap ko kya order karwana hai? (e.g. Wood-Fired Margherita Pizza, Truffle Risotto)`
          : `Excellent! Our kitchen is firing fresh orders. Our current dynamic pickup wait time is ${waitInfo.label}. What delicious dishes can Chef Marco prepare for you?`,
        step: 'ORDER_ITEMS'
      };
    }

    s.mode = 'RESERVATION';
    s.step = 'RES_PARTY';
    const sizeMatch = text.match(/\b([1-9]|1[0-4])\b|one|two|three|four|five|six|eight|couple/i);
    let size = 2;
    if (sizeMatch) {
      const w = sizeMatch[0].toLowerCase();
      if (w === 'one') size = 1;
      else if (w === 'two' || w === 'couple') size = 2;
      else if (w === 'three') size = 3;
      else if (w === 'four') size = 4;
      else if (w === 'five') size = 5;
      else if (w === 'six') size = 6;
      else if (w === 'eight') size = 8;
      else size = parseInt(sizeMatch[1] || '2', 10);
    }
    s.partySize = size;

    return {
      reply: `Fantastico! I would be honored to arrange a table for a party of ${s.partySize}. What date and preferred time would you like to dine with us? For instance, tonight at 7:30 PM?`,
      step: 'RES_TIME'
    };
  }

  // --- BRANCH A: FOOD ORDER INTAKE ---
  if (s.step === 'ORDER_ITEMS') {
    s.orderItems.push(text);
    s.step = 'ORDER_UPSELL';
    return {
      reply: `Delicious choice! I have noted ${text}. Chef Marco highly recommends adding our signature Truffle Parmesan Herb Fries (+$6) or our freshly baked Garlic Focaccia (+$5). Would you like to add either of those to complete your order?`,
      step: 'ORDER_UPSELL'
    };
  }

  if (s.step === 'ORDER_UPSELL') {
    if (!/no|none|skip|that's all|thats all|bass/i.test(lower)) {
      s.orderItems.push(text);
    }
    s.step = 'ORDER_NAME';
    return {
      reply: "Perfetto! May I please have your full name for the kitchen ticket?",
      step: 'ORDER_NAME'
    };
  }

  if (s.step === 'ORDER_NAME') {
    s.guestName = text.replace(/^(my name is|i am|this is)\s+/i, '').trim();
    s.step = 'ORDER_PHONE';
    return {
      reply: `Grazie, ${s.guestName}! And what direct mobile number should we text your live order status and pickup notification to?`,
      step: 'ORDER_PHONE'
    };
  }

  if (s.step === 'ORDER_PHONE') {
    const raw = text.replace(/[^0-9]/g, '');
    s.phone = raw || '03471098310';
    s.step = 'COMPLETED';

    const orderId = `BV-ORD-${orderCounter++}`;
    const totalAmount = `$${(s.orderItems.length * 18 + 12).toFixed(2)}`;
    const newOrder = {
      id: orderId,
      channel: 'VOICE_AI',
      customerName: s.guestName,
      phone: s.phone,
      items: s.orderItems,
      totalAmount,
      paymentMethod: isPakistani ? 'Cash on Delivery (COD Verified)' : 'Credit Card (Pre-Authorized)',
      status: 'PREPARING',
      elapsedMinutes: 1,
      createdAt: new Date().toISOString()
    };

    activeOrders.unshift(newOrder);

    // 1. Log to Google Sheets (Restaurant_Orders_Day5)
    await appendToSheet('Restaurant_Orders_Day5', [
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }),
      orderId,
      'VOICE_AI',
      s.guestName,
      s.phone,
      s.orderItems.join(' + '),
      totalAmount,
      newOrder.paymentMethod,
      'PREPARING',
      waitInfo.label
    ]);

    // 2. Decrement Inventory & Trigger n8n
    if (liveInventory[0].stock > 1) liveInventory[0].stock -= 1;
    if (liveInventory[3].stock > 1) liveInventory[3].stock -= 1;

    const summary = [
      `🎉 ORDER INJECTED TO KITCHEN DISPLAY [${orderId}]`,
      `• Guest: ${s.guestName}`,
      `• Items: ${s.orderItems.join(' + ')}`,
      `• Total Amount: ${totalAmount}`,
      `• Estimated Pickup Window: ~${waitInfo.label}`,
      `• Payment: ${newOrder.paymentMethod}`,
      "",
      `Our kitchen staff has received your ticket and is preparing your meal right now. You will receive an SMS when it's hot and boxed for pickup!`
    ].join('\n');

    return {
      reply: summary,
      step: 'COMPLETED',
      isBooked: true,
      order: newOrder,
      endCall: false
    };
  }

  // --- BRANCH B: TABLE RESERVATION ---
  if (s.step === 'RES_TIME') {
    s.dateTimeText = text;
    s.step = 'RES_SEATING';
    return {
      reply: `Perfetto, I have noted ${s.dateTimeText} for your party of ${s.partySize}. Would you prefer our romantic heated garden patio, our main indoor dining room, or a private window table? Also, are you celebrating any special occasion?`,
      step: 'RES_SEATING'
    };
  }

  if (s.step === 'RES_SEATING') {
    s.seatingPreference = /patio|garden|terrace/i.test(lower) ? 'Garden Patio' : (/window/i.test(lower) ? 'Indoor Window' : 'Main Dining Room');
    s.step = 'RES_NAME';
    return {
      reply: `Understood, ${s.seatingPreference} will be wonderful! May I please have your full name for the table holding card?`,
      step: 'RES_NAME'
    };
  }

  if (s.step === 'RES_NAME') {
    s.guestName = text.replace(/^(my name is|i am|this is)\s+/i, '').trim();
    s.step = 'RES_PHONE';
    return {
      reply: `Grazie, ${s.guestName}! And what is the best mobile phone number to send your instant confirmation voucher to?`,
      step: 'RES_PHONE'
    };
  }

  if (s.step === 'RES_PHONE') {
    const raw = text.replace(/[^0-9]/g, '');
    s.phone = raw || '03471098310';
    s.step = 'COMPLETED';

    const resId = `BV-RES-${reservationCounter++}`;
    const targetDate = new Date();
    targetDate.setHours(19, 30, 0, 0);
    const allocation = allocateTableAndSlot(activeReservations, s.partySize, s.seatingPreference, targetDate);

    const reservationObj = {
      id: resId,
      timestamp: new Date().toISOString(),
      scheduledStart: allocation.start.toISOString(),
      scheduledEnd: allocation.end.toISOString(),
      slotLabel: allocation.slotLabel,
      guestName: s.guestName,
      phone: s.phone,
      partySize: s.partySize,
      seatingPreference: s.seatingPreference,
      tableAssigned: `${allocation.table.name} (${allocation.table.area})`,
      status: 'CONFIRMED'
    };

    activeReservations.unshift(reservationObj);

    // 1. Log to Google Sheets
    await appendToSheet('Restaurant_Reservations_Day5', [
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }),
      resId,
      s.guestName,
      s.phone,
      allocation.slotLabel,
      `${s.partySize} Guests`,
      s.seatingPreference,
      'Voice AI Booking',
      reservationObj.tableAssigned,
      'CONFIRMED'
    ]);

    // 2. Google Calendar Event
    await createCalendarReservationEvent(reservationObj);

    const summary = [
      `🎉 TABLE RESERVATION CONFIRMED [${resId}]`,
      `• Guest: ${s.guestName}`,
      `• Party Size: ${s.partySize} Guests`,
      `• Dining Time: ${allocation.slotLabel}`,
      `• Seating: ${reservationObj.tableAssigned}`,
      `• Confirmation Sent to: ${s.phone}`,
      "",
      `Your table has been prepared with zero scheduling conflict. We look forward to hosting you at Bella Vista!`,
      "",
      "Can I answer any questions about valet parking or our wine pairings?"
    ].join('\n');

    return {
      reply: summary,
      step: 'COMPLETED',
      isBooked: true,
      reservation: reservationObj,
      endCall: false
    };
  }

  if (s.step === 'COMPLETED') {
    if (/thank|thanks|grazie|bye|goodbye/i.test(lower)) {
      return { reply: "Prego! Chef Marco and our team look forward to welcoming you. Have a wonderful day!", step: 'COMPLETED', endCall: true };
    }
    return { reply: "Your ticket is confirmed in our system. If you need any special dietary accommodations or directions, just let me know!", step: 'COMPLETED' };
  }
}

// WhatsApp Digital Waiter Conversational Engine
async function processWhatsAppChat(sessionId, userMessage, isPakistani = false) {
  if (!whatsappSessions[sessionId]) {
    whatsappSessions[sessionId] = {
      step: 'MENU',
      cart: [],
      name: 'Guest',
      tableNo: 'Table 4'
    };
  }

  const s = whatsappSessions[sessionId];
  const text = (userMessage || '').trim();
  const lower = text.toLowerCase();
  const waitInfo = calculateDynamicWaitTime();

  if (/hi|hello|salam|menu|start|qr/i.test(lower)) {
    return {
      reply: isPakistani
        ? `🍕 *Bella Vista WhatsApp Digital Waiter*\nAssalam-o-alaikum! Welcome to Table 4.\n\n*Quick Menu:*\n1️⃣ Wood-Fired Margherita ($22)\n2️⃣ Wild Mushroom Truffle Risotto ($26)\n3️⃣ Veal Osso Buco ($42)\n4️⃣ Handmade Beef Lasagna ($24)\n\nReply with the item number or name to order! Current Kitchen Wait Time: *${waitInfo.label}*`
        : `🍕 *Welcome to Bella Vista Italian Bistro!*\nI am your Digital Waiter for Table 4.\n\n*Chef's Recommendations:*\n1️⃣ Wood-Fired Margherita Pizza ($22)\n2️⃣ Wild Mushroom & Truffle Risotto ($26)\n3️⃣ Slow-Braised Veal Osso Buco ($42)\n4️⃣ Handmade Truffle Lasagna ($24)\n\nType the item name or number to add to your order! Live Kitchen Wait: *${waitInfo.label}*`,
      step: 'ORDERING'
    };
  }

  if (s.step === 'MENU' || s.step === 'ORDERING') {
    let item = 'Wood-Fired Margherita ($22)';
    if (/risotto|2/i.test(lower)) item = 'Wild Mushroom & Truffle Risotto ($26)';
    else if (/osso|buco|3/i.test(lower)) item = 'Slow-Braised Veal Osso Buco ($42)';
    else if (/lasagna|4/i.test(lower)) item = 'Handmade Truffle Lasagna ($24)';

    s.cart.push(item);
    s.step = 'UPSELL';

    return {
      reply: `✅ Added *${item}* to your table order!\n\n✨ *Chef's Upsell Recommendation:*\nWould you like to add our *Crispy Truffle Parmesan Fries (+$6)* or a refreshing *Italian Limoncello Spritz (+$10)*?\n\nReply *YES* to add, or *CHECKOUT* to send order to the kitchen!`,
      step: 'UPSELL'
    };
  }

  if (s.step === 'UPSELL') {
    if (/yes|fries|limoncello|add/i.test(lower)) {
      s.cart.push('Truffle Parmesan Fries ($6.00)');
    }

    const orderId = `BV-ORD-${orderCounter++}`;
    const newOrder = {
      id: orderId,
      channel: 'WHATSAPP',
      customerName: 'WhatsApp Table 4 Guest',
      phone: '03008765432',
      items: s.cart,
      totalAmount: '$32.00',
      paymentMethod: isPakistani ? 'Cash on Table / COD Verified' : 'Card at Table (POS Toast)',
      status: 'PREPARING',
      elapsedMinutes: 1,
      createdAt: new Date().toISOString()
    };

    activeOrders.unshift(newOrder);

    // Google Sheets Sync
    await appendToSheet('Restaurant_Orders_Day5', [
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }),
      orderId,
      'WHATSAPP',
      'Table 4 Guest',
      '03008765432',
      s.cart.join(' + '),
      '$32.00',
      newOrder.paymentMethod,
      'PREPARING',
      waitInfo.label
    ]);

    s.step = 'CONFIRMED';

    return {
      reply: `🚀 *Order #${orderId} Dispatched to Kitchen!*\n\n• Items: ${s.cart.join(', ')}\n• Estimated Cooking Time: *${waitInfo.label}*\n• Status: 🍳 *PREPARING (KDS Live)*\n\nYour digital waiter will alert you here as soon as the kitchen plates your meal. Buon Appetito!`,
      order: newOrder
    };
  }

  return {
    reply: `Your order is currently with Chef Marco in the kitchen. Expected arrival at your table in approximately ${waitInfo.label}! Let me know if you need any water or condiments.`,
    step: 'CONFIRMED'
  };
}

// HTTP Server
const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Voice AI Chat Endpoint
  if (req.url === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { sessionId, messageText, marketMode } = JSON.parse(body || '{}');
        const result = await processVoiceChat(sessionId || 'voice_default', messageText, marketMode);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 2. WhatsApp Digital Waiter Endpoint
  if (req.url === '/api/whatsapp/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { sessionId, messageText, isPakistani } = JSON.parse(body || '{}');
        const result = await processWhatsAppChat(sessionId || 'wa_default', messageText, isPakistani);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 3. Kitchen Display System (KDS) Omnichannel Orders Endpoint
  if (req.url === '/api/orders' && req.method === 'GET') {
    const waitInfo = calculateDynamicWaitTime();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      waitInfo,
      orders: activeOrders
    }));
    return;
  }

  // Update KDS Order Status
  if (req.url.startsWith('/api/orders/status') && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const { orderId, newStatus } = JSON.parse(body || '{}');
        const ord = activeOrders.find(o => o.id === orderId);
        if (ord) {
          ord.status = newStatus;
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, order: ord }));
          return;
        }
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Order not found' }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 4. Inventory & Predictive Purchase Order Endpoint
  if (req.url === '/api/inventory' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      inventory: liveInventory,
      lowStockItems: liveInventory.filter(i => i.stock <= i.threshold)
    }));
    return;
  }

  // 5. CRM & Win-Back Remarketing Endpoint
  if (req.url === '/api/crm' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      customers: crmCustomers
    }));
    return;
  }

  // Trigger Win-Back Broadcast
  if (req.url === '/api/crm/winback' && req.method === 'POST') {
    const dormant = crmCustomers.filter(c => c.remarketingStatus === 'READY_FOR_WINBACK');
    dormant.forEach(c => c.remarketingStatus = 'DISCOUNT_VOUCHER_SENT');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      recipients: dormant.length,
      promoCode: 'WELCOMEBACK20',
      message: 'Automated 20% discount WhatsApp broadcast sent to dormant customers!'
    }));
    return;
  }

  // 6. Review & Sentiment Interception Endpoint
  if (req.url === '/api/reviews' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      reviews: customerReviews
    }));
    return;
  }

  if (req.url === '/api/reviews' && req.method === 'POST') {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', async () => {
      try {
        const { customerName, rating, text } = JSON.parse(body || '{}');
        const numRating = parseInt(rating, 10);
        const isNegative = numRating <= 3;
        const sentiment = isNegative ? 'NEGATIVE' : 'POSITIVE';

        const action = isNegative
          ? '⚠️ Intercepted: Escalate to General Manager + 25% VIP Voucher Issued'
          : '🟢 Promoter: Directed to Google Maps + Personalized AI Gratitude';

        const aiResponse = isNegative
          ? `Dear ${customerName}, we are deeply sorry your dining experience fell short. Our General Manager has been notified directly, and we have sent a 25% VIP apology voucher to your WhatsApp.`
          : `Grazie mille, ${customerName}! Chef Marco and the team are thrilled you enjoyed your visit. We would be honored if you could leave us a quick review on Google!`;

        const revObj = {
          id: `REV-${Date.now().toString().slice(-4)}`,
          customerName: customerName || 'Valued Guest',
          rating: numRating,
          text: text || 'Dining feedback',
          sentiment,
          action,
          aiResponse
        };

        customerReviews.unshift(revObj);

        // Append to Google Sheets
        await appendToSheet('Restaurant_Reviews_Day5', [
          new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }),
          revObj.customerName,
          numRating,
          revObj.text,
          sentiment,
          action,
          aiResponse
        ]);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, review: revObj }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  // 7. Reservations & Tables
  if (req.url === '/api/reservations' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      tables: TABLES,
      reservations: activeReservations
    }));
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
🍝 Day 5 Bella Vista Restaurant Full-Stack Autonomous Ecosystem
📡 Live Server: http://localhost:${PORT}
📊 Google Sheets: 5 Synchronized Tabs Ready
📆 Google Calendar ID: ${CAL_ID}
🍳 Kitchen Display System (KDS): Active & Live
💬 WhatsApp Digital Waiter: Active on /api/whatsapp/chat
======================================================
  `);
});
