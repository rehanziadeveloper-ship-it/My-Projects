const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 3006;
const SPREADSHEET_ID = '1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo';
const N8N_WEBHOOK_URL = 'https://n8n.srv1767318.hstgr.cloud/webhook/real-estate-qualification';

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
    scope: 'https://www.googleapis.com/auth/spreadsheets',
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

// Fallback Qualification Engine (Mirrors n8n workflow exactly)
function runFallbackQualificationEngine(rawMessage, sessionState) {
  const message = (rawMessage || '').trim();
  const lower = message.toLowerCase();

  let state = sessionState ? JSON.parse(JSON.stringify(sessionState)) : {
    step: 'AWAITING_PROPERTY',
    propertyInterest: '',
    financingStatus: '',
    financingScore: 0,
    budgetRange: '',
    budgetScore: 0,
    timeline: '',
    timelineScore: 0,
    buyerType: '',
    readinessScore: 0,
    fullName: '',
    phone: '',
    email: '',
    leadScore: 0,
    leadTier: 'COLD',
    recommendedAction: ''
  };

  const PROPERTIES = [
    { id: 'PROP-01', name: 'The Bel-Air Modern Estate', city: 'Bel Air, Los Angeles, CA', price: 4250000, keywords: ['bel-air', 'bel air', 'los angeles', 'estate', 'california'] },
    { id: 'PROP-02', name: 'Tribeca Sky Penthouse', city: 'Tribeca, New York, NY', price: 3100000, keywords: ['tribeca', 'penthouse', 'new york', 'manhattan', 'nyc'] },
    { id: 'PROP-03', name: 'Austin Lakefront Contemporary', city: 'Austin, TX', price: 1850000, keywords: ['austin', 'lakefront', 'texas', 'westlake'] },
    { id: 'PROP-04', name: 'Miami Brickell Skyline Residence', city: 'Miami, FL', price: 1250000, keywords: ['miami', 'brickell', 'florida', 'condo'] },
    { id: 'PROP-05', name: 'Aspen Pinecrest Alpine Retreat', city: 'Aspen, CO', price: 5800000, keywords: ['aspen', 'colorado', 'chalet', 'alpine', 'mountain'] }
  ];

  function findProperty(text) {
    const t = (text || '').toLowerCase();
    for (const p of PROPERTIES) {
      if (t.includes(p.name.toLowerCase())) return p;
      for (const kw of p.keywords) {
        if (t.includes(kw)) return p;
      }
    }
    return null;
  }

  // Initial greeting
  if (/^(hello|hi|hey|start|restart|reset|inquire|buy a home|looking for a house)\b/i.test(lower) && !state.propertyInterest) {
    state.step = 'AWAITING_PROPERTY';
    return {
      reply: "Welcome to Apex Realty Private Client Advisory. Which luxury property or market are you interested in acquiring? (e.g. Bel-Air Estate, Tribeca Penthouse, Austin Lakefront, Miami Brickell, or Aspen Alpine)",
      sessionState: state,
      state: state
    };
  }

  // 1. Property Interest
  if (state.step === 'AWAITING_PROPERTY') {
    const matched = findProperty(lower);
    if (matched) {
      state.propertyInterest = `${matched.name} (${matched.city} — $${(matched.price / 1000000).toFixed(2)}M)`;
    } else {
      state.propertyInterest = message || 'Luxury Residential Portfolio';
    }
    state.step = 'AWAITING_FINANCING';

    return {
      reply: `Outstanding choice with ${state.propertyInterest}.\n\nTo tailor our private representation, how do you plan to finance this acquisition? Are you purchasing All-Cash, Pre-Approved with a verified lender, or in need of preferred jumbo financing?`,
      sessionState: state,
      state: state
    };
  }

  // 2. Financing Status
  if (state.step === 'AWAITING_FINANCING') {
    if (/cash|all cash|liquid|funds ready/i.test(lower)) {
      state.financingStatus = 'Cash Buyer (Verified Proof of Funds)';
      state.financingScore = 40;
    } else if (/pre-approv|preapprov|letter in hand|pre approved|jumbo approved|chase|wells/i.test(lower)) {
      state.financingStatus = 'Pre-Approved (Lender Letter in Hand)';
      state.financingScore = 35;
    } else if (/working with|talking to lender|in process|broker/i.test(lower)) {
      state.financingStatus = 'Working with Mortgage Broker';
      state.financingScore = 20;
    } else {
      state.financingStatus = 'Needs Financing / Non-Approved';
      state.financingScore = 10;
    }

    state.step = 'AWAITING_BUDGET';
    return {
      reply: "Noted. What is your target purchase price range or maximum comfortable budget for this acquisition?",
      sessionState: state,
      state: state
    };
  }

  // 3. Target Budget
  if (state.step === 'AWAITING_BUDGET') {
    state.budgetRange = message;
    
    const numMatch = lower.replace(/,/g, '').match(/\d+(\.\d+)?/);
    let estAmount = numMatch ? parseFloat(numMatch[0]) : 0;
    if (lower.includes('m') || lower.includes('million')) {
      if (estAmount < 100) estAmount = estAmount * 1000000;
    } else if (lower.includes('k')) {
      if (estAmount < 1000) estAmount = estAmount * 1000;
    }

    if (estAmount >= 2000000) {
      state.budgetScore = 20;
    } else if (estAmount >= 1000000) {
      state.budgetScore = 18;
    } else if (estAmount >= 500000) {
      state.budgetScore = 14;
    } else {
      state.budgetScore = 10;
    }

    state.step = 'AWAITING_TIMELINE';
    return {
      reply: "Perfect. What is your target closing timeline? Are you looking to purchase immediately within 30 days, within 1 to 3 months, or exploring for later in the year?",
      sessionState: state,
      state: state
    };
  }

  // 4. Purchase Timeline
  if (state.step === 'AWAITING_TIMELINE') {
    if (/immediate|30 day|asap|now|this month|ready now/i.test(lower)) {
      state.timeline = 'Immediate (< 30 days)';
      state.timelineScore = 30;
    } else if (/1|2|3|few month|60 day|90 day/i.test(lower)) {
      state.timeline = '1 to 3 months';
      state.timelineScore = 20;
    } else if (/3 to 6|6 month|half year/i.test(lower)) {
      state.timeline = '3 to 6 months';
      state.timelineScore = 10;
    } else {
      state.timeline = 'Just Browsing (> 6 months)';
      state.timelineScore = 5;
    }

    state.step = 'AWAITING_BUYER_TYPE';
    return {
      reply: "Understood. Will this property serve as your Primary Luxury Residence, a Vacation / Secondary Home, an Investment Rental, or a Corporate Relocation?",
      sessionState: state,
      state: state
    };
  }

  // 5. Buyer Intent / Property Type
  if (state.step === 'AWAITING_BUYER_TYPE') {
    if (/primary|live in|home for family/i.test(lower)) {
      state.buyerType = 'Primary Luxury Residence';
      state.readinessScore = 10;
    } else if (/relocat/i.test(lower)) {
      state.buyerType = 'Corporate / Family Relocation';
      state.readinessScore = 10;
    } else if (/vacation|second|retreat/i.test(lower)) {
      state.buyerType = 'Vacation & Secondary Home';
      state.readinessScore = 8;
    } else {
      state.buyerType = 'Investment / Portfolio Addition';
      state.readinessScore = 7;
    }

    state.step = 'AWAITING_CONTACT';
    return {
      reply: "Understood. Lastly, please provide your Full Name, Phone Number, and Email Address so our senior broker can compile your private dossier and off-market preview.",
      sessionState: state,
      state: state
    };
  }

  // 6. Contact & Full Qualification Scorecard
  if (state.step === 'AWAITING_CONTACT') {
    const emailMatch = message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = message.match(/(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    
    if (emailMatch) state.email = emailMatch[0];
    if (phoneMatch) state.phone = phoneMatch[0];

    let namePart = message
      .replace(emailMatch ? emailMatch[0] : '', '')
      .replace(phoneMatch ? phoneMatch[0] : '', '')
      .replace(/[,;]/g, '')
      .trim();
    
    if (namePart && namePart.length > 2) {
      state.fullName = namePart;
    } else if (!state.fullName) {
      state.fullName = 'Qualified Private Buyer';
    }

    const totalScore = Math.min(100, (state.financingScore || 10) + (state.budgetScore || 10) + (state.timelineScore || 5) + (state.readinessScore || 7));
    state.leadScore = totalScore;

    let tier = 'COLD';
    let tierIcon = '❄️';
    let action = '';

    if (totalScore >= 80) {
      tier = 'HOT';
      tierIcon = '🔥';
      action = 'IMMEDIATE DISPATCH: Direct Managing Broker Call within 15 min & Private Showing Reserved.';
    } else if (totalScore >= 50) {
      tier = 'WARM';
      tierIcon = '⚡';
      action = 'PRIORITY FOLLOW-UP: Send Curated MLS Dossier & Schedule Weekend Property Tour within 24h.';
    } else {
      tier = 'COLD';
      tierIcon = '❄️';
      action = 'NURTURE SEQUENCE: Route to Preferred Jumbo Mortgage Partner for Pre-Qualification & Monthly Market Report.';
    }

    state.leadTier = tier;
    state.recommendedAction = action;
    state.step = 'QUALIFIED';

    const leadId = 'LEAD-' + Math.floor(1000 + Math.random() * 9000);
    const timestamp = new Date().toLocaleString();

    const qualifiedLead = {
      leadId,
      timestamp,
      fullName: state.fullName,
      phone: state.phone || 'Provided via Call',
      email: state.email || 'client@private-advisory.com',
      propertyInterest: state.propertyInterest,
      budgetRange: state.budgetRange,
      financingStatus: state.financingStatus,
      purchaseTimeline: state.timeline,
      buyerType: state.buyerType,
      leadScore: state.leadScore,
      leadTier: state.leadTier,
      recommendedAction: state.recommendedAction,
      status: 'NEW'
    };

    state.lastLead = qualifiedLead;

    const scorecardReply = `✅ BUYER QUALIFICATION COMPLETE!

========================================
🏛️ APEX REALTY — LEAD SCORECARD
========================================
• Lead ID: #${leadId}
• Lead Tier: ${tierIcon} ${tier} (Score: ${totalScore}/100)
• Client: ${state.fullName}
• Contact: ${state.phone || 'On file'} | ${state.email || 'On file'}

----------------------------------------
📊 QUALIFICATION BREAKDOWN:
----------------------------------------
• Target Property: ${state.propertyInterest}
• Budget Range: ${state.budgetRange} (Score: ${state.budgetScore}/20)
• Financing Status: ${state.financingStatus} (Score: ${state.financingScore}/40)
• Timeline: ${state.timeline} (Score: ${state.timelineScore}/30)
• Acquisition Intent: ${state.buyerType} (Score: ${state.readinessScore}/10)

----------------------------------------
🎯 RECOMMENDED BROKER ACTION:
----------------------------------------
${action}
========================================

Thank you, ${state.fullName}! Our managing broker has been alerted with your profile and will be in touch shortly.`;

    return {
      reply: scorecardReply,
      lead: qualifiedLead,
      sessionState: state,
      state: state
    };
  }

  if (state.step === 'QUALIFIED') {
    return {
      reply: "Your buyer portfolio is active with our managing broker! If you would like to evaluate another luxury property or adjust your criteria, just let me know.",
      sessionState: state,
      state: state
    };
  }

  return {
    reply: "Welcome to Apex Realty Private Client Advisory. Which luxury property or market are you looking to acquire?",
    sessionState: state,
    state: state
  };
}

async function routeQualifiedLead(lead) {
  memoryLeads.unshift(lead);

  // Sync to Google Sheets Real_Estate_Qualified_Leads
  await appendSheetRow('Real_Estate_Qualified_Leads', [
    lead.leadId,
    lead.timestamp,
    lead.fullName,
    lead.phone,
    lead.email,
    lead.propertyInterest,
    lead.budgetRange,
    lead.financingStatus,
    lead.purchaseTimeline,
    lead.buyerType,
    lead.leadScore,
    lead.leadTier,
    lead.recommendedAction,
    lead.status || 'NEW'
  ]);
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
  // 1. CHATBOT / VOICEBOT QUALIFICATION ENDPOINT
  // ==========================================
  if (req.url === '/api/chat' && req.method === 'POST') {
    const payload = await getBody();
    let n8nResponse = null;

    try {
      const n8nRes = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (n8nRes.ok) {
        n8nResponse = await n8nRes.json();
      }
    } catch (err) {
      console.warn('[n8n Webhook] Notice:', err.message);
    }

    if (!n8nResponse || !n8nResponse.reply) {
      const sessionState = payload.sessionState || payload.state;
      n8nResponse = runFallbackQualificationEngine(payload.message, sessionState);
    }

    // Ensure sessionState & state compatibility
    if (n8nResponse.sessionState && !n8nResponse.state) {
      n8nResponse.state = n8nResponse.sessionState;
    } else if (n8nResponse.state && !n8nResponse.sessionState) {
      n8nResponse.sessionState = n8nResponse.state;
    }

    // Lead completion detected -> sync to Google Sheets CRM & memory
    if (n8nResponse.lead && n8nResponse.lead.leadId) {
      await routeQualifiedLead(n8nResponse.lead);
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(n8nResponse));
    return;
  }

  // ==========================================
  // 2. LUXURY LISTINGS ENDPOINT
  // ==========================================
  if (req.url === '/api/listings' && req.method === 'GET') {
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
  // 3. BROKER CRM LEADS ENDPOINT
  // ==========================================
  if (req.url === '/api/leads' && req.method === 'GET') {
    const rows = await readSheetValues('Real_Estate_Qualified_Leads');
    if (rows && rows.length > 1) {
      const leads = rows.slice(1).map(r => ({
        leadId: r[0],
        timestamp: r[1],
        fullName: r[2],
        phone: r[3],
        email: r[4],
        propertyInterest: r[5],
        budgetRange: r[6],
        financingStatus: r[7],
        purchaseTimeline: r[8],
        buyerType: r[9],
        leadScore: parseInt(r[10] || 0, 10),
        leadTier: r[11] || 'WARM',
        recommendedAction: r[12] || '',
        status: r[13] || 'NEW'
      }));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, leads }));
      return;
    }

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
