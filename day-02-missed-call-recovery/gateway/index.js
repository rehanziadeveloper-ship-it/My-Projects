const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const path = require('path');
const fs = require('fs');
const http = require('http');

// Configuration
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n.srv1767318.hstgr.cloud/webhook/whatsapp-missed-call-recovery';
const AUTH_DIR = path.join(__dirname, 'auth_info_baileys');
const SESSIONS_FILE = path.join(__dirname, 'sessions.json');
const TEST_PORT = process.env.TEST_PORT || 3001;

let sockInstance = null;

// Persistent Session Management
let sessions = {};
try {
  if (fs.existsSync(SESSIONS_FILE)) {
    sessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    console.log(`[Session Store] Loaded ${Object.keys(sessions).length} active sessions from disk.`);
  }
} catch (e) {
  sessions = {};
}

function saveSessions() {
  try {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf8');
  } catch (e) {
    console.error('[Session Store] Error saving sessions:', e.message);
  }
}

// Send incoming payload to n8n Webhook
async function forwardToN8n(payload) {
  try {
    console.log(`\n[n8n Forwarder] Forwarding to n8n Webhook:`, JSON.stringify(payload, null, 2));
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
    console.log(`[n8n Forwarder] Response from n8n:`, data);
    return data;
  } catch (err) {
    console.error(`[n8n Forwarder] Network error contacting n8n:`, err.message);
    return null;
  }
}

// Connect to WhatsApp Web
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version, isLatest } = await fetchLatestBaileysVersion();
  console.log(`[WhatsApp Gateway] Starting Baileys v${version.join('.')}, isLatest: ${isLatest}`);

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
      const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
      console.log(`\n[WhatsApp Gateway] Connection closed (code: ${statusCode}). Logged out: ${isLoggedOut}`);
      if (isLoggedOut) {
        console.log('🔄 Session expired or unlinked from phone. Automatically clearing auth cache to generate a fresh QR code...');
        try {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        } catch (e) {}
        setTimeout(connectToWhatsApp, 1500);
      } else {
        setTimeout(connectToWhatsApp, 3000);
      }
    } else if (connection === 'open') {
      console.log('\n======================================================');
      console.log('✅ WHATSAPP GATEWAY CONNECTED SUCCESSFULLY!');
      console.log(`Target n8n Webhook: ${N8N_WEBHOOK_URL}`);
      console.log(`Test simulator listening at: http://localhost:${TEST_PORT}`);
      console.log('Multi-turn conversation & appointment booking active.');
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

      let messageText = '';

      if (msg.message?.conversation) {
        messageText = msg.message.conversation;
      } else if (msg.message?.extendedTextMessage?.text) {
        messageText = msg.message.extendedTextMessage.text;
      } else if (msg.message?.imageMessage?.caption) {
        messageText = msg.message.imageMessage.caption;
      } else if (msg.message?.audioMessage) {
        console.log(`🎙️ [Incoming Voice Note] Received from ${senderJid}`);
        messageText = 'Hello, I sent a voice note inquiring about booking an appointment.';
      }

      if (!messageText.trim()) continue;

      let senderPhone = senderJid.replace('@s.whatsapp.net', '').replace('@lid', '').split(':')[0];
      const senderName = msg.pushName || 'Valued Patient';

      // Load previous multi-turn session
      const currentSession = sessions[senderJid] || {
        stage: 'INIT',
        patientName: senderName,
        senderPhone: `+${senderPhone}`,
        isBooked: false
      };

      console.log(`\n📩 [Incoming Message] From: ${senderName} (+${senderPhone})`);
      console.log(`   Text: "${messageText}"`);
      console.log(`   Current Stage: ${currentSession.stage}, IsBooked: ${currentSession.isBooked}`);

      const payload = {
        event: 'whatsapp_message',
        senderPhone: `+${senderPhone}`,
        senderName: senderName,
        messageText: messageText,
        remoteJid: senderJid,
        session: currentSession,
        timestamp: new Date().toISOString()
      };

      // Forward to n8n Engine
      const n8nResult = await forwardToN8n(payload);

      if (n8nResult && n8nResult.reply) {
        // 1. Update Session Memory
        if (n8nResult.updatedSession) {
          sessions[senderJid] = n8nResult.updatedSession;
          saveSessions();
          console.log(`💾 [Session Saved] Stage: ${n8nResult.updatedSession.stage}, Booked: ${n8nResult.updatedSession.isBooked}`);
        }

        // 2. Send Clean Text Reply (Single, fast, perfectly formatted)
        console.log(`💬 [Sending Text Reply] to +${senderPhone}: "${n8nResult.reply.slice(0, 80)}..."`);
        await sock.sendMessage(senderJid, { text: n8nResult.reply });
        console.log(`✅ Reply delivered to +${senderPhone}!`);
      }
    }
  });

  // Handle Incoming Phone Calls on WhatsApp
  sock.ev.on('call', async (callEvents) => {
    for (const call of callEvents) {
      const callerJid = call.from;
      let callerPhone = callerJid.replace('@s.whatsapp.net', '').replace('@lid', '').split(':')[0];
      console.log(`\n📞 [Incoming Call Detected] From: +${callerPhone}, Status: ${call.status}, Call ID: ${call.id}`);

      if (call.status === 'offer' || call.status === 'ringing') {
        try {
          if (sock.rejectCall) {
            await sock.rejectCall(call.id, callerJid);
            console.log(`⏹️ [Call Handled] Rejected incoming voice call to trigger Sub-60s Recovery.`);
          }
        } catch (e) {
          console.log(`Call reject notice: ${e.message}`);
        }

        const currentSession = sessions[callerJid] || { stage: 'INIT', senderPhone: `+${callerPhone}` };

        const payload = {
          event: 'whatsapp_missed_call',
          senderPhone: `+${callerPhone}`,
          senderName: 'Valued Patient',
          messageText: 'Missed Voice Call Detected',
          remoteJid: callerJid,
          session: currentSession,
          timestamp: new Date().toISOString()
        };

        const n8nResult = await forwardToN8n(payload);

        if (n8nResult && n8nResult.reply) {
          if (n8nResult.updatedSession) {
            sessions[callerJid] = n8nResult.updatedSession;
            saveSessions();
          }

          await sock.sendMessage(callerJid, { text: n8nResult.reply });
          console.log(`✅ [Sub-60s Auto-TextBack] Text delivered to +${callerPhone}!`);
        }
      }
    }
  });
}

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
          session: { stage: 'INIT' },
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
      activeSessions: Object.keys(sessions).length,
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
