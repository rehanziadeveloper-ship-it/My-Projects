const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const path = require('path');
const http = require('http');

// Configuration
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1767318.hstgr.cloud/webhook/whatsapp-missed-call-recovery';
const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');
const TEST_PORT = process.env.TEST_PORT || 3001;

let sockInstance = null;

// Send incoming payload to n8n Webhook
async function forwardToN8n(payload) {
  try {
    console.log(`\n[n8n Forwarder] Sending event to n8n:`, JSON.stringify(payload, null, 2));
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`[n8n Forwarder] Error from n8n webhook: ${response.status} ${response.statusText}`);
      const errText = await response.text();
      console.error(`[n8n Forwarder] Details:`, errText);
      return null;
    }

    const data = await response.json();
    console.log(`[n8n Forwarder] Response received from n8n:`, data);
    return data;
  } catch (err) {
    console.error(`[n8n Forwarder] Network error contacting n8n:`, err.message);
    return null;
  }
}

// Connect to WhatsApp
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`[WhatsApp Gateway] Using Baileys v${version.join('.')}, isLatest: ${isLatest}`);

  const sock = makeWASocket({
    version,
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false
  });

  sockInstance = sock;

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n======================================================');
      console.log('📱 SCAN THIS QR CODE WITH WHATSAPP TO CONNECT:');
      console.log('1. Open WhatsApp on your phone');
      console.log('2. Tap Settings (or 3 dots) -> Linked Devices');
      console.log('3. Tap "Link a Device" and scan the code below:');
      console.log('======================================================\n');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`\n[WhatsApp Gateway] Connection closed (code: ${statusCode}). Reconnecting: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 3000);
      } else {
        console.log('[WhatsApp Gateway] Logged out. Delete auth_info_baileys folder and restart to re-scan.');
      }
    } else if (connection === 'open') {
      console.log('\n======================================================');
      console.log('✅ WHATSAPP GATEWAY CONNECTED SUCCESSFULLY!');
      console.log(`Target n8n Webhook: ${N8N_WEBHOOK_URL}`);
      console.log(`Test simulator listening at: http://localhost:${TEST_PORT}`);
      console.log('Ready to receive incoming WhatsApp messages & calls.');
      console.log('======================================================\n');
    }
  });

  // Handle Incoming WhatsApp Messages
  sock.ev.on('messages.upsert', async (m) => {
    if (m.type !== 'notify') return;

    for (const msg of m.messages) {
      if (msg.key.fromMe) continue;
      const senderJid = msg.key.remoteJid;
      if (!senderJid || senderJid === 'status@broadcast' || senderJid.endsWith('@g.us')) continue;

      const messageText = msg.message?.conversation ||
                          msg.message?.extendedTextMessage?.text ||
                          msg.message?.imageMessage?.caption ||
                          '';

      if (!messageText.trim()) continue;

      const senderPhone = senderJid.replace('@s.whatsapp.net', '');
      const senderName = msg.pushName || 'WhatsApp Caller';

      console.log(`\n📩 [Incoming WhatsApp] From: ${senderName} (+${senderPhone})`);
      console.log(`   Message: "${messageText}"`);

      const payload = {
        event: 'whatsapp_message',
        senderPhone: `+${senderPhone}`,
        senderName: senderName,
        messageText: messageText,
        remoteJid: senderJid,
        timestamp: new Date().toISOString()
      };

      const n8nResult = await forwardToN8n(payload);

      if (n8nResult && n8nResult.reply) {
        console.log(`🤖 [Auto-TextBack] Sending reply to +${senderPhone}: "${n8nResult.reply}"`);
        await sock.sendMessage(senderJid, { text: n8nResult.reply });
        console.log(`✅ [Auto-TextBack] Reply successfully delivered to +${senderPhone}!`);
      }
    }
  });

  // Handle Missed / Incoming Calls
  sock.ev.on('call', async (callEvents) => {
    for (const call of callEvents) {
      const callerJid = call.from;
      const callerPhone = callerJid.replace('@s.whatsapp.net', '');
      console.log(`\n📞 [Incoming/Missed Call Detected] From: +${callerPhone}, Status: ${call.status}`);

      if (call.status === 'offer' || call.status === 'timeout' || call.status === 'reject') {
        const payload = {
          event: 'whatsapp_missed_call',
          senderPhone: `+${callerPhone}`,
          senderName: 'Phone Caller',
          messageText: 'Missed Voice Call Detected',
          remoteJid: callerJid,
          timestamp: new Date().toISOString()
        };

        const n8nResult = await forwardToN8n(payload);

        if (n8nResult && n8nResult.reply) {
          console.log(`🤖 [Sub-60s Auto-TextBack] Sending recovery reply to +${callerPhone}: "${n8nResult.reply}"`);
          await sock.sendMessage(callerJid, { text: n8nResult.reply });
          console.log(`✅ [Sub-60s Auto-TextBack] Delivered to +${callerPhone}!`);
        }
      }
    }
  });
}

// Minimal local HTTP server for testing & simulation
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  if (url.pathname === '/simulate-missed-call' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const data = body ? JSON.parse(body) : {};
        const testPayload = {
          event: 'whatsapp_missed_call',
          senderPhone: data.phone || '+923001234567',
          senderName: data.name || 'Test Patient (Muhammad Rehan)',
          messageText: data.message || 'Hi, I just called your clinic. I have a severe toothache and need an emergency appointment today.',
          remoteJid: data.phone ? `${data.phone.replace('+', '')}@s.whatsapp.net` : 'test@s.whatsapp.net',
          timestamp: new Date().toISOString()
        };

        const result = await forwardToN8n(testPayload);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'success', result }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', error: e.message }));
      }
    });
  } else if (url.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'online',
      connected: !!sockInstance,
      n8n_url: N8N_WEBHOOK_URL
    }));
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WhatsApp Gateway is Running. Endpoints: POST /simulate-missed-call, GET /health');
  }
});

server.listen(TEST_PORT, () => {
  console.log(`[Simulator HTTP] Local test server running at http://localhost:${TEST_PORT}`);
  connectToWhatsApp().catch(err => console.error('[WhatsApp Gateway Init Error]:', err));
});
