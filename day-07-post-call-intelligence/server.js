const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { analyzeCallTranscript } = require('./intelligence-engine');

const PORT = process.env.PORT || 3007;
const SPREADSHEET_ID = '1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo';
const N8N_PIPELINE_URL = 'https://n8n.srv1767318.hstgr.cloud/webhook/post-call-intelligence';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
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
    console.warn('Sheets read error:', err.message);
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
      body: JSON.stringify({ values: [rowData] })\n    });
    const data = await res.json();
    return data;
  } catch (err) {
    console.warn('Sheets append error:', err.message);
  }
}

const sampleCalls = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample-calls', 'calls.json'), 'utf8'));

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const getBody = () => new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch(e) { resolve({}); }
    });
  });

  // ==========================================
  // 1. SAMPLE CALLS ENDPOINT
  // ==========================================
  if (req.url === '/api/sample-calls' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, calls: sampleCalls }));
    return;
  }

  // ==========================================
  // 2. ANALYZE CALL PIPELINE (PROXIES TO n8n BRAIN)
  // ==========================================
  if (req.url === '/api/analyze-call' && req.method === 'POST') {
    const payload = await getBody();
    let result = null;
    let n8nSucceeded = false;

    try {
      const n8nRes = await fetch(N8N_PIPELINE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: payload.transcript || payload.rawTranscript || '',
          callerName: payload.callerName || '',
          phoneNumber: payload.phoneNumber || payload.phone || '',
          company: payload.company || '',
          callType: payload.callType || '',
          duration: payload.duration || '3m 00s',
          id: payload.id || payload.callId || ''
        })
      });
      if (n8nRes.ok) {
        result = await n8nRes.json();
        n8nSucceeded = true;
      }
    } catch (err) {
      console.warn('[n8n Webhook Notice]:', err.message);
    }

    // Fallback to local intelligence engine if n8n offline
    if (!n8nSucceeded || !result || !result.intelligence) {
      result = analyzeCallTranscript(payload.transcript || payload.rawTranscript || '', payload);
      // Log to sheets fallback
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

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, ...result, processedVia: n8nSucceeded ? 'n8n_cloud_workflow' : 'local_ai_engine' }));
    return;
  }

  // ==========================================
  // 3. CALL INTELLIGENCE LOGS (FROM GOOGLE SHEETS)
  // ==========================================
  if (req.url === '/api/call-logs' && req.method === 'GET') {
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
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, total: logs.length, logs }));
    return;
  }

  // ==========================================
  // 4. DISPATCH ALERT SIMULATOR (SLACK / WHATSAPP)
  // ==========================================
  if (req.url === '/api/dispatch-alert' && req.method === 'POST') {
    const payload = await getBody();
    const alertChannel = payload.channel || 'SLACK_AND_WHATSAPP';
    const alertText = payload.alertText || '🚨 Urgent Lead Notification';

    // Simulated webhook dispatch
    console.log(`[DISPATCHED TO ${alertChannel}]:\n${alertText}`);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      channel: alertChannel,
      dispatchedAt: new Date().toLocaleTimeString(),
      status: 'SENT_TO_OWNER_PHONE',
      message: 'Alert delivered via Webhook to on-duty manager within sub-15s SLA.'
    }));
    return;
  }

  // ==========================================
  // 5. STATIC ASSET SERVING
  // ==========================================
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(__dirname, 'public', 'index.html'), (e, fallback) => {
          if (e) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(fallback);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🧠 Day 7: Post-Call Intelligence & Sentiment Pipeline`);
  console.log(`📡 Local Server: http://localhost:${PORT}`);
  console.log(`⚡ n8n Cloud Webhook: ${N8N_PIPELINE_URL}`);
  console.log(`📊 Google Sheets CRM: Tab "Call_Intelligence_Logs"`);
  console.log(`======================================================\n`);
});
