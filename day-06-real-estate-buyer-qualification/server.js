const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3006;
const SPREADSHEET_ID = '1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo';
const CALENDAR_ID = 'dc16a29b27611448569f6f342e1e982aa44e6c6bfa3b3ca7d2fe180c4231748b@group.calendar.google.com';
const N8N_WEBHOOK_URL = 'https://n8n.srv1767318.hstgr.cloud/webhook/apex-buyer-chat';
const N8N_CRM_LEADS_URL = 'https://n8n.srv1767318.hstgr.cloud/webhook/apex-crm-leads';
const N8N_LISTINGS_URL = 'https://n8n.srv1767318.hstgr.cloud/webhook/apex-listings';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Google Service Account for Google Sheets Sync
const serviceAccount = {
  client_email: "antigravity-mcp@valiant-epsilon-501913-g2.iam.gserviceaccount.com",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC6/8ATa9+hemSf\naqpP5WQTVHoRIv3JAXCFihZM3vV00/WcKevaQtqM+hYyMWOhapcADH2+rDEEGvJ5\nJij72yzH3j0WgFEFz3wszX1knUHsgHa+m8XSNuyzGeVAydWcAKKeHoS6U20NeOXZ\n40oJUYzPZ6rgGGGztikxzTdoQCGrMhnvVY/ErSyHyU4c6cx5xLbhlEXrMjK611iy\n4Tjn07zydQFVXi9zBflnISIIYDZfWMQ9DYp3GKONaPwA5DvK2W9ev+9PbqZA15XQ\nKnXVBi5v93f2dkrZ+WdG4Rp8AENcNC2iBE6TW8OwTB8JnPSS1gsCexP8ultibc8g\nWRdtPGSRAgMBAAECggEAFbGj49zo5b/gOopSVdCD6qYrPx+zF4WeOy/I5IQdL7+D\nR+mpHfoRhrdgqdQG/evytqO8Vsl9Kj/CD4H40TcdG9bReXHLdIQcoMn6GRkRU9GX\ndQd3TKrojOKdMQX5TQ7ZzsQ1m7Qf+6ch60QuC6S1VD5vmW3ar9GbN9bZ7bM69LQ5\neMyUeFSKAbaju+O1vV3mlPpiz5ndSn+VQsY8NhV8DF1yhYyNlf0QiffdnOQU7Msj\nzGMypJ21EXVdmuKlKhxjYJY4bK9YWUDDg3LmK/vYzCLj7Cl2nDuU/8WBzi3YW7AK\nPzmESzdOnQzw1UErXNo54PH6xpKO1pFMB4tg9ueo3QKBgQDiIpr503zn65tsyazw\n3vELXg+ZZBGwHc7SNsxeTW5P/fDKrVV404cKK5+8Pw+mgoZjDkc3CFaUzAI9pXnR\nvFDclbOk/GKSBPtcJfot94EQUgzlBpeEcqIj8Z9+gaUfuHL7ZYOQzwR0z6fG9A3O\nnlDICb1ja5NvwOYWBwvctr3g2wKBgQDTsf4NnJK+fYRVACgYaXGWm7HvTDa8lR/3\n6PTd9Z72+jCuBRkSqT0OcbxV+CCniZXJJAioFm1raYoP7utn6PjIONC54RzP9nXw\n3HIE5dYJRm7U1Efen5CYxyXg8lIHrMPbwrCAuwcTeE+QizSNfhSBunz7zYvivNUu\nAnWELFrmAwKBgEocGToiy16eYnOGrLzL86dMDkSw/PMA8dUGzHdjXPGuQYnKwKY2\nfJ0iqtjgudpSEITKGyC4BNgC/AEECCZqVv3TueoqJIvCQjZy48jIwm181mkAfguU\nHfs1ppWpG1qH8nbdT/7XOZimrU+QkC3UyJimSIEaslj/mOhDKuoMobHdAoGAeMns\nnbOi/1H6+c0XE6bGixrXUiT4bm3gScIARc1qIJ3svL5n6f/quJ0oyxzC9RVKA/St\ng8sYL9uOTT0T0Lxbh1Lztbu+huKntQDzhdvmXnBzuLhPMbV1+dZXxJw/NeXb8z6J\nG0qb5P4W1/C10a4I4WSY/8vubzczpAb/KqVsUCUCgYEAi7yC38YXnqSKMypyllhg\n21BRoh1a07V+8QY/ahYxzmdLY9cVmgZe9h8fHq18oCZtzJvwBuk8u5tV+7LuGyxi\nwLi5qBlg+zBA0RNT03pmN7D6JJBsdGQ2KtWHYvnBSayt4p/IJJ5Rpi67DDwcfsi8\nKA/MJzN4Cj+IKJnZxvEa7r8=\n-----END PRIVATE KEY-----\n"
};

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
    exp, iat: now
  };

  const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
  const sigIn = `${b64(header)}.${b64(claim)}`;
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(sigIn);
  const sig = signer.sign(serviceAccount.private_key, 'base64url');
  const jwt = `${sigIn}.${sig}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });

  const data = await res.json();
  if (data.access_token) {
    cachedToken = data.access_token;
    tokenExpiry = now + data.expires_in;
    return cachedToken;
  }
  throw new Error('Failed to acquire Google token: ' + JSON.stringify(data));
}

async function readSheetValues(tabName) {
  try {
    const token = await getGoogleAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(tabName)}?valueRenderOption=UNFORMATTED_VALUE`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    return data.values || [];
  } catch (err) {
    console.error(`Read error (${tabName}):`, err.message);
    return [];
  }
}

async function appendSheetRow(tabName, rowData) {
  try {
    const token = await getGoogleAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(tabName + '!A1')}:append?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [rowData] })
    });
    return await res.json();
  } catch (err) {
    console.error(`Append error (${tabName}):`, err.message);
  }
}

async function updateSheetRange(range, values) {
  try {
    const token = await getGoogleAccessToken();
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values })
    });
    return await res.json();
  } catch (err) {
    console.error(`Update error (${range}):`, err.message);
  }
}

async function createCalendarEvent(eventData) {
  try {
    const token = await getGoogleAccessToken();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: eventData.summary || 'Apex Realty VIP Appointment',
        description: eventData.description || 'Apex Realty AI Assistant Booking',
        start: { dateTime: eventData.startIso || new Date(Date.now() + 86400000).toISOString() },
        end: { dateTime: eventData.endIso || new Date(Date.now() + 86400000 + 45 * 60000).toISOString() }
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log('✅ Google Calendar Event booked:', data.id, data.htmlLink);
    } else {
      console.warn('⚠️ Google Calendar error:', res.status, data);
    }
    return data;
  } catch (err) {
    console.warn('[Calendar Event Error]:', err.message);
  }
}

// In-Memory Fallback State (Synced with Google Sheets)
let memoryListings = [
  {
    id: 'PROP-01',
    title: 'The Bel-Air Modern Estate',
    address: '742 Bellagio Rd, Bel Air, Los Angeles, CA',
    price: 4250000,
    beds: 5,
    baths: 6,
    sqft: 6800,
    type: 'Single Family Luxury',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'PROP-02',
    title: 'Tribeca Sky Penthouse',
    address: '145 Hudson St, Tribeca, New York, NY',
    price: 3100000,
    beds: 3,
    baths: 3.5,
    sqft: 3400,
    type: 'Luxury Penthouse',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'PROP-03',
    title: 'Austin Lakefront Contemporary',
    address: '2804 Westlake Dr, Austin, TX',
    price: 1850000,
    beds: 4,
    baths: 4.5,
    sqft: 4200,
    type: 'Waterfront Villa',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'PROP-04',
    title: 'Miami Brickell Skyline Residence',
    address: '1000 Brickell Plaza, Miami, FL',
    price: 1250000,
    beds: 2,
    baths: 2.5,
    sqft: 2100,
    type: 'High-Rise Condo',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'PROP-05',
    title: 'Aspen Pinecrest Alpine Retreat',
    address: '510 Red Mountain Rd, Aspen, CO',
    price: 5800000,
    beds: 6,
    baths: 7,
    sqft: 7500,
    type: 'Mountain Chalet',
    status: 'ACTIVE',
    image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80'
  }
];

let memoryLeads = [
  {
    leadId: 'LEAD-8801',
    timestamp: '10/28/2026, 09:15:00',
    fullName: 'Harrison Vance',
    phone: '+1 (310) 555-8910',
    email: 'h.vance@vancemedia.com',
    propertyInterest: 'The Bel-Air Modern Estate',
    budgetRange: '$4,000,000 - $4,500,000',
    financingStatus: 'Cash Buyer (Verified)',
    purchaseTimeline: 'Immediate (< 30 days)',
    buyerType: 'Primary Luxury Residence',
    leadScore: 95,
    leadTier: 'HOT',
    recommendedAction: 'Priority VIP Showing & Direct Broker Call within 15 min',
    status: 'NEW'
  },
  {
    leadId: 'LEAD-8802',
    timestamp: '10/28/2026, 10:40:00',
    fullName: 'Dr. Camille Laurent',
    phone: '+1 (212) 555-4321',
    email: 'claurent@medny.org',
    propertyInterest: 'Tribeca Sky Penthouse',
    budgetRange: '$3,000,000 - $3,500,000',
    financingStatus: 'Pre-Approved with Chase Jumbo ($3.5M)',
    purchaseTimeline: '1 to 3 months',
    buyerType: 'Relocation to NYC',
    leadScore: 85,
    leadTier: 'HOT',
    recommendedAction: 'Send 3D Matterport & Schedule Weekend Private Tour',
    status: 'ASSIGNED'
  },
  {
    leadId: 'LEAD-8803',
    timestamp: '10/28/2026, 11:20:00',
    fullName: 'Brandon & Sarah Cole',
    phone: '+1 (512) 555-9081',
    email: 'bcole@texastech.io',
    propertyInterest: 'Austin Lakefront Contemporary',
    budgetRange: '$1,800,000 - $2,000,000',
    financingStatus: 'Working with Mortgage Broker',
    purchaseTimeline: '3 to 6 months',
    buyerType: 'Upgrading Family Home',
    leadScore: 68,
    leadTier: 'WARM',
    recommendedAction: 'Add to Austin Market Newsletter & Check Lender Pre-Approval',
    status: 'NURTURING'
  },
  {
    leadId: 'LEAD-8804',
    timestamp: '10/28/2026, 11:45:00',
    fullName: 'Kevin Martinez',
    phone: '+1 (305) 555-7762',
    email: 'kmartinez@skylinefl.com',
    propertyInterest: 'Miami Brickell Skyline Residence',
    budgetRange: '$800,000 - $1,000,000',
    financingStatus: 'Need Mortgage Pre-Approval',
    purchaseTimeline: 'Just Browsing (> 6 months)',
    buyerType: 'First-Time Investor',
    leadScore: 42,
    leadTier: 'COLD',
    recommendedAction: 'Connect with Preferred Lending Partner for Loan Pre-Qualification',
    status: 'NURTURING'
  }
];

const { runStateMachine } = require('./state-machine');

function runFallbackQualificationEngine(rawMessage, sessionState, targetProperty) {
  return runStateMachine(rawMessage, targetProperty, sessionState);
}

async function routeQualifiedLead(lead) {
  memoryLeads.unshift(lead);

  const tab = lead.targetTab || 'Buy_Property';
  const rowData = [
    lead.leadId || lead.Lead_ID || '#APX-VIP',
    lead.date || lead.timestamp || lead.Date || new Date().toLocaleString(),
    lead.fullName || lead.Name || 'Private Client',
    lead.phone || lead.Phone || 'On file',
    lead.email || lead.Email || 'Not provided',
    lead.propertyType || lead.propertyInterest || lead.Property_Type || 'Luxury Residence',
    lead.budgetOrPrice || lead.budgetRange || lead.Budget_or_Price || '$2,000,000+',
    lead.timeline || lead.purchaseTimeline || lead.Timeline || 'Immediate',
    lead.statusScore || lead.Status_Score || `${lead.leadScore || 85}/100 (${lead.leadTier || 'HOT'})`
  ];

  await appendSheetRow(tab, rowData);
}

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const getBody = () => new Promise(resolve => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(data)); } catch (e) { resolve({}); }
    });
  });

  // ==========================================
  // 1. CHATBOT / VOICEBOT QUALIFICATION ENDPOINT (PROXIES TO n8n MASTER BRAIN)
  // ==========================================
  if (req.url === '/api/chat' && req.method === 'POST') {
    const payload = await getBody();
    let n8nResponse = null;

    try {
      const n8nRes = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: payload.sessionId || ('sess_' + Date.now()),
          userMessage: payload.userMessage || payload.message || '',
          targetProperty: payload.targetProperty || '',
          sessionState: payload.sessionState || payload.state || {}
        })
      });
      if (n8nRes.ok) {
        n8nResponse = await n8nRes.json();
      }
    } catch (err) {
      console.warn('[n8n Webhook] Notice:', err.message);
    }

    if (!n8nResponse || !n8nResponse.reply) {
      const sessionState = payload.sessionState || payload.state;
      n8nResponse = runFallbackQualificationEngine(payload.userMessage || payload.message, sessionState);
    }

    // Ensure sessionState & state compatibility
    if (n8nResponse.sessionState && !n8nResponse.state) {
      n8nResponse.state = n8nResponse.sessionState;
    } else if (n8nResponse.state && !n8nResponse.sessionState) {
      n8nResponse.sessionState = n8nResponse.state;
    }

    // Double-sync Calendar & Google Sheets
    const isCalendarTurn = n8nResponse.calendarBooked || n8nResponse.bookingDetails || n8nResponse.actionType === 'book_calendar' || n8nResponse.responsePayload?.calendarBooked;
    if (isCalendarTurn) {
      const summaryVal = n8nResponse.calendarSummary || n8nResponse.responsePayload?.calendarSummary || ('Apex Realty: Appointment for ' + (n8nResponse.sessionState?.fullName || n8nResponse.state?.fullName || 'Private Client'));
      const descVal = n8nResponse.calendarDescription || n8nResponse.responsePayload?.calendarDescription || 'Booked via Apex Realty AI Virtual Assistant';
      const startVal = n8nResponse.startIso || n8nResponse.bookingDetails?.startIso || n8nResponse.responsePayload?.bookingDetails?.startIso || n8nResponse.sessionState?.bookingSlot?.startIso;
      const endVal = n8nResponse.endIso || n8nResponse.bookingDetails?.endIso || n8nResponse.responsePayload?.bookingDetails?.endIso || n8nResponse.sessionState?.bookingSlot?.endIso;

      createCalendarEvent({
        summary: summaryVal,
        description: descVal,
        startIso: startVal,
        endIso: endVal
      }).catch(e => console.warn('GCal async error:', e.message));
    }

    const isStorageTurn = n8nResponse.actionType === 'store_sheets' || n8nResponse.isComplete || n8nResponse.responsePayload?.lead;
    if (isStorageTurn && (n8nResponse.responsePayload?.lead || n8nResponse.sessionState?.finalLead || n8nResponse.state?.finalLead)) {
      const leadObj = n8nResponse.responsePayload?.lead || n8nResponse.sessionState?.finalLead || n8nResponse.state?.finalLead || n8nResponse;
      routeQualifiedLead(leadObj).catch(e => console.warn('Sheets async error:', e.message));
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(n8nResponse));
    return;
  }

  // ==========================================
  // 2. LUXURY LISTINGS ENDPOINT (PROXIES TO n8n)
  // ==========================================
  if (req.url === '/api/listings' && req.method === 'GET') {
    try {
      const n8nRes = await fetch(N8N_LISTINGS_URL);
      if (n8nRes.ok) {
        const data = await n8nRes.json();
        if (data.listings && data.listings.length > 0) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
          return;
        }
      }
    } catch (err) {
      console.warn('[n8n Listings Proxy Notice]:', err.message);
    }

    const rows = await readSheetValues('Real_Estate_Listings');
    if (rows && rows.length > 1) {
      const listings = rows.slice(1).map(r => ({
        id: r[0],
        title: r[1],
        address: r[2],
        price: parseFloat(r[3] || 0),
        beds: parseInt(r[4] || 0, 10),
        baths: parseFloat(r[5] || 0),
        sqft: parseInt(r[6] || 0, 10),
        type: r[7] || 'Luxury Residential',
        status: r[8] || 'ACTIVE',
        image: r[9] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80'
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, listings }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, listings: memoryListings }));
    return;
  }

  // ==========================================
  // 3. BROKER CRM LEADS ENDPOINT (AGGREGATES 4 CRM TABS)
  // ==========================================
  if (req.url === '/api/leads' && req.method === 'GET') {
    const tabs = ['Buy_Property', 'Sell_Property', 'Rent_Out', 'Invest'];
    let allLeads = [];
    try {
      const sheetResults = await Promise.all(tabs.map(t => readSheetValues(t)));
      sheetResults.forEach((rows, idx) => {
        const tabName = tabs[idx];
        if (rows && rows.length > 1) {
          for (let i = 1; i < rows.length; i++) {
            const r = rows[i];
            if (r && r[0]) {
              const rawScore = r[8] || '';
              const scoreMatch = String(rawScore).match(/(\d{1,3})/);
              const scoreVal = scoreMatch ? parseInt(scoreMatch[1], 10) : 85;
              const tierVal = String(rawScore).includes('HOT') ? 'HOT' : (String(rawScore).includes('WARM') ? 'WARM' : 'COLD');
              allLeads.push({
                leadId: r[0],
                timestamp: r[1],
                fullName: r[2],
                phone: r[3],
                email: r[4],
                propertyInterest: r[5],
                budgetRange: r[6],
                purchaseTimeline: r[7],
                statusScore: rawScore,
                leadScore: scoreVal,
                leadTier: tierVal,
                recommendedAction: tierVal === 'HOT' ? 'Immediate VIP Showing & Direct Broker Call' : 'Follow up with Property Dossier',
                status: 'NEW',
                category: tabName.replace('_', ' ')
              });
            }
          }
        }
      });
    } catch (err) {
      console.warn('[CRM Sheets Read Notice]:', err.message);
    }

    if (allLeads.length > 0) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, leads: allLeads }));
      return;
    }

    try {
      const n8nRes = await fetch(N8N_CRM_LEADS_URL);
      if (n8nRes.ok) {
        const data = await n8nRes.json();
        if (data.leads && data.leads.length > 0) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(data));
          return;
        }
      }
    } catch (err) {}

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, leads: memoryLeads }));
    return;
  }

  // ==========================================
  // 4. LEAD STATUS UPDATE (BROKER CRM)
  // ==========================================
  if (req.url === '/api/leads/status' && req.method === 'POST') {
    const { leadId, newStatus } = await getBody();
    
    // Update memory
    const target = memoryLeads.find(l => l.leadId === leadId);
    if (target) target.status = newStatus;

    // Update in Google Sheets
    const rows = await readSheetValues('Real_Estate_Qualified_Leads');
    if (rows && rows.length > 1) {
      const rowIndex = rows.findIndex((r, idx) => idx > 0 && r[0] === leadId);
      if (rowIndex !== -1) {
        await updateSheetRange(`Real_Estate_Qualified_Leads!N${rowIndex + 1}`, [[newStatus]]);
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, leadId, newStatus }));
    return;
  }

  // ==========================================
  // 5. STATIC ASSET SERVING
  // ==========================================
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  filePath = filePath.split('?')[0];

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(__dirname, 'public', 'index.html');
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'text/html';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    });
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🏛️ Apex Realty AI — Inbound Buyer Qualification System`);
  console.log(`📡 Local Server: http://localhost:${PORT}`);
  console.log(`💼 Broker CRM: Protected (default: broker123)`);
  console.log(`⚡ n8n Webhook: ${N8N_WEBHOOK_URL}`);
  console.log(`📊 Google Sheets: Spreadsheet ${SPREADSHEET_ID}`);
  console.log(`======================================================\n`);
});
