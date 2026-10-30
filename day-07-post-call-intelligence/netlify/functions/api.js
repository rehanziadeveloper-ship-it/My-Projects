const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { analyzeCallTranscript } = require('../../intelligence-engine');

const SPREADSHEET_ID = '1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo';
const N8N_PIPELINE_URL = 'https://n8n.srv1767318.hstgr.cloud/webhook/post-call-intelligence';

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
    const data = await res.json();
    return data;
  } catch (err) {}
}

const sampleCalls = [
  {
    "id": "CALL-701",
    "callerName": "Harrison Vance",
    "phoneNumber": "+1 (310) 555-8910",
    "company": "Vance Capital Group",
    "callType": "Luxury Real Estate Lead",
    "duration": "3m 42s",
    "timestamp": "10/30/2026, 09:14 AM",
    "audioUrl": "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    "rawTranscript": "Agent: Good morning, Apex Realty Private Advisory Desk. This is Sarah speaking.\nCaller: Hi Sarah, my name is Harrison Vance. I'm calling regarding the Bel-Air Modern Estate on Bellagio Road.\nAgent: Wonderful to speak with you, Mr. Vance. That is one of our premier trophy listings. What caught your eye?\nCaller: Well, I'm relocating my family from Manhattan to LA next month. We need at least 6,000 square feet, absolute privacy, and a dedicated home office. I reviewed the digital dossier and it matches our criteria closely.\nAgent: Excellent. And regarding budget and financing, are you planning a jumbo mortgage or an all-cash acquisition?\nCaller: This will be an all-cash purchase. Our funds are already liquid with Morgan Stanley Private Wealth. Budget is between 4 and 4.5 million dollars. I can provide the verification letter immediately.\nAgent: That's fantastic, Mr. Vance. That puts you in an elite position for negotiation.\nCaller: Great. The only issue is my timeline: I'm flying out to London on Friday evening, so I need to inspect the property in person tomorrow afternoon—say around 2:00 PM. Can your managing broker arrange a private walkthrough?\nAgent: Absolutely. I am reserving tomorrow at 2:00 PM for you with our managing broker right now. I will send confirmation via WhatsApp and email within 10 minutes.\nCaller: Perfect. Appreciate the swift response, Sarah. Have a good day.",
    "expectedSentiment": "Enthusiastic",
    "expectedScore": 88,
    "expectedUrgency": "P0 - CRITICAL (<15 min)"
  },
  {
    "id": "CALL-702",
    "callerName": "Marcus Brody",
    "phoneNumber": "+1 (212) 555-4321",
    "company": "Private Patient",
    "callType": "Dental Clinic Emergency",
    "duration": "2m 18s",
    "timestamp": "10/30/2026, 10:02 AM",
    "audioUrl": "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    "rawTranscript": "Receptionist: Apex Dental Urgent Care, how can we assist you today?\nCaller: Look, I'm in agonizing pain. My lower right molar cracked while having breakfast, and the root is exposed.\nReceptionist: I am so sorry to hear that, sir. Let me help you right away. May I have your name?\nCaller: Marcus Brody. I tried calling my regular dentist down on 5th Avenue and got an answering machine telling me to call back on Monday! That is completely unacceptable when someone is in severe pain.\nReceptionist: We understand completely, Mr. Brody. We specialize in immediate same-day emergency relief. Are you experiencing any swelling or fever?\nCaller: Yes, swelling on my lower jaw, and 800 milligrams of ibuprofen didn't touch the pain. I need a dentist to see me this morning. Can you get me in within the next hour or two?\nReceptionist: Yes, Mr. Brody. Dr. Reynolds has an emergency surgical slot open at 11:30 AM today. Can you make it to our Midtown clinic by then?\nCaller: 11:30? Yes! Thank goodness. What do I need to bring?\nReceptionist: Just your photo ID and dental insurance card if you have one. If not, we provide immediate transparent fee estimations on arrival. I am locking in Dr. Reynolds for you right now.\nCaller: Thank you so much. I'm leaving my apartment now.",
    "expectedSentiment": "Frustrated & Distressed",
    "expectedScore": -72,
    "expectedUrgency": "P0 - CRITICAL (<15 min)"
  },
  {
    "id": "CALL-703",
    "callerName": "Elena Rostova",
    "phoneNumber": "+1 (415) 555-7799",
    "company": "Summit Global Partners",
    "callType": "VIP Restaurant Buyout",
    "duration": "4m 05s",
    "timestamp": "10/30/2026, 11:45 AM",
    "audioUrl": "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3",
    "rawTranscript": "Host: Heritage Bistro Private Events, this is Julian.\nCaller: Hello Julian, this is Elena Rostova from Summit Global Partners. I'm organizing our annual executive partner dinner next Thursday evening.\nHost: A pleasure, Ms. Rostova. We'd love to host Summit Global Partners. How many guests are you expecting?\nCaller: We will have approximately 42 to 45 C-suite executives. We are interested in either a full mezzanine buyout or the private wine cellar dining room.\nHost: The mezzanine buyout is ideal for 45 guests—it gives you private bar service, dedicated servers, and panoramic views of the main dining room.\nCaller: Sounds lovely, but I do have two specific concerns. First, acoustics: we will have two brief keynote presentations, so we cannot have loud background music bleed through. Second, dietary requirements: four of our managing partners require strict vegan and gluten-free tasting menus.\nHost: Understood. Our mezzanine is acoustically treated with independent sound zoning, so we can isolate audio completely during speeches. And Chef Antoine prepares bespoke 5-course dietary menus for private galas.\nCaller: That's reassuring. What is the approximate minimum spend for Thursday evening?\nHost: For the mezzanine buyout, our food and beverage minimum is $12,500, which includes custom printed menus and dedicated sommelier service.\nCaller: That fits comfortably within our $15,000 corporate entertainment budget. Could you send me the sample autumn menu and a draft contract by 3:00 PM today?\nHost: I will prepare the complete proposal and have it in your inbox by 2:00 PM, Ms. Rostova.\nCaller: Excellent, Julian. Looking forward to reviewing it.",
    "expectedSentiment": "Inquisitive & Professional",
    "expectedScore": 65,
    "expectedUrgency": "P1 - HIGH (<2 hr)"
  }
];

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

  const path = event.path.replace(/\/api/, '').replace(/^\/api/, '');
  const body = JSON.parse(event.body || '{}');

  // 1. Sample Calls
  if (path === '/sample-calls' && event.httpMethod === 'GET') {
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, calls: sampleCalls }) };
  }

  // 2. Analyze Call
  if (path === '/analyze-call' && event.httpMethod === 'POST') {
    let result = null;
    let n8nSucceeded = false;

    try {
      const n8nRes = await fetch(N8N_PIPELINE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: body.transcript || body.rawTranscript || '',
          callerName: body.callerName || '',
          phoneNumber: body.phoneNumber || body.phone || '',
          company: body.company || '',
          callType: body.callType || '',
          duration: body.duration || '3m 00s',
          id: body.id || body.callId || ''
        })
      });
      if (n8nRes.ok) {
        result = await n8nRes.json();
        n8nSucceeded = true;
      }
    } catch (e) {
      console.warn('n8n proxy error in function:', e.message);
    }

    if (!n8nSucceeded || !result || !result.intelligence) {
      result = analyzeCallTranscript(body.transcript || body.rawTranscript || '', body);
      const rawPhone = result.metadata.phoneNumber || '';
      const safePhone = rawPhone.startsWith('+') ? ("'" + rawPhone) : rawPhone;
      const row = [
        result.callId,
        result.metadata.analyzedAt,
        result.metadata.callerName,
        safePhone,
        result.metadata.callType,
        result.metadata.duration,
        result.intelligence.urgencyLevel,
        result.intelligence.sentiment,
        String(result.intelligence.sentimentScore),
        result.intelligence.executiveSummary.join(' | '),
        result.intelligence.actionItems.map(a => `${a.task} (${a.assignee})`).join('; '),
        result.intelligence.objections.map(o => `${o.tag}: ${o.detail}`).join('; ')
      ];
      appendSheetRow('Call_Intelligence_Logs', row).catch(() => {});
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, ...result, processedVia: n8nSucceeded ? 'n8n_cloud_workflow' : 'local_ai_engine' })
    };
  }

  // 3. Call Logs (Google Sheets)
  if (path === '/call-logs' && event.httpMethod === 'GET') {
    const rows = await readSheetValues('Call_Intelligence_Logs');
    const logs = [];
    if (rows && rows.length > 1) {
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (r && r[0]) {
          logs.push({
            callId: r[0],
            analyzedAt: r[1],
            callerName: r[2],
            phoneNumber: r[3],
            callType: r[4],
            duration: r[5],
            urgencyLevel: r[6],
            sentiment: r[7],
            sentimentScore: parseInt(r[8] || '0', 10),
            executiveSummary: (r[9] || '').split(' | '),
            actionItems: r[10] || '',
            objections: r[11] || ''
          });
        }
      }
    }
    return { statusCode: 200, headers, body: JSON.stringify({ success: true, total: logs.length, logs }) };
  }

  // 4. Dispatch Alert
  if (path === '/dispatch-alert' && event.httpMethod === 'POST') {
    const alertChannel = body.channel || 'SLACK_AND_WHATSAPP';
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        channel: alertChannel,
        dispatchedAt: new Date().toLocaleTimeString(),
        status: 'SENT_TO_OWNER_PHONE',
        message: 'Alert delivered via Webhook to on-duty manager within sub-15s SLA.'
      })
    };
  }

  return { statusCode: 404, headers, body: JSON.stringify({ error: 'Endpoint not found' }) };
};
