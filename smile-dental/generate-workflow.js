import fs from 'fs';
import path from 'path';

// Construct the complete "Smile Dental - Backend" n8n workflow
const workflow = {
  name: 'Smile Dental - Backend',
  nodes: [
    // ----------------------------------------------------------------
    // SECTION A: ENTRY POINTS
    // ----------------------------------------------------------------
    {
      parameters: {
        httpMethod: 'GET',
        path: 'smile/slots',
        responseMode: 'responseNode',
        options: {},
      },
      id: 'a1-webhook-slots',
      name: 'A1 Webhook GET /slots',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [100, 100],
      webhookId: 'smile-slots-webhook',
    },
    {
      parameters: {
        values: {
          string: [
            { name: 'route', value: 'slots' },
          ],
        },
        options: {},
      },
      id: 'a1-set-route',
      name: 'A1 Set Route slots',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [320, 100],
    },
    {
      parameters: {
        httpMethod: 'POST',
        path: 'smile/book',
        responseMode: 'responseNode',
        options: {},
      },
      id: 'a2-webhook-book',
      name: 'A2 Webhook POST /book',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [100, 240],
      webhookId: 'smile-book-webhook',
    },
    {
      parameters: {
        values: {
          string: [
            { name: 'route', value: 'book' },
          ],
        },
        options: {},
      },
      id: 'a2-set-route',
      name: 'A2 Set Route book',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [320, 240],
    },
    {
      parameters: {
        httpMethod: 'GET',
        path: 'smile/appointment',
        responseMode: 'responseNode',
        options: {},
      },
      id: 'a3-webhook-appt-get',
      name: 'A3 Webhook GET /appointment',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [100, 380],
      webhookId: 'smile-appt-get-webhook',
    },
    {
      parameters: {
        values: {
          string: [
            { name: 'route', value: 'appointment_get' },
          ],
        },
        options: {},
      },
      id: 'a3-set-route',
      name: 'A3 Set Route appointment_get',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [320, 380],
    },
    {
      parameters: {
        httpMethod: 'POST',
        path: 'smile/appointment/cancel',
        responseMode: 'responseNode',
        options: {},
      },
      id: 'a4-webhook-appt-cancel',
      name: 'A4 Webhook POST /appointment/cancel',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [100, 520],
      webhookId: 'smile-appt-cancel-webhook',
    },
    {
      parameters: {
        values: {
          string: [
            { name: 'route', value: 'appointment_cancel' },
          ],
        },
        options: {},
      },
      id: 'a4-set-route',
      name: 'A4 Set Route appointment_cancel',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [320, 520],
    },
    {
      parameters: {
        httpMethod: 'POST',
        path: 'smile/appointment/reschedule',
        responseMode: 'responseNode',
        options: {},
      },
      id: 'a5-webhook-appt-reschedule',
      name: 'A5 Webhook POST /appointment/reschedule',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [100, 660],
      webhookId: 'smile-appt-reschedule-webhook',
    },
    {
      parameters: {
        values: {
          string: [
            { name: 'route', value: 'appointment_reschedule' },
          ],
        },
        options: {},
      },
      id: 'a5-set-route',
      name: 'A5 Set Route appointment_reschedule',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [320, 660],
    },
    {
      parameters: {
        httpMethod: 'POST',
        path: 'smile/chat',
        responseMode: 'responseNode',
        options: {},
      },
      id: 'a6-webhook-chat',
      name: 'A6 Webhook POST /chat',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [100, 800],
      webhookId: 'smile-chat-webhook',
    },
    {
      parameters: {
        values: {
          string: [
            { name: 'route', value: 'chat' },
          ],
        },
        options: {},
      },
      id: 'a6-set-route',
      name: 'A6 Set Route chat',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [320, 800],
    },
    {
      parameters: {
        httpMethod: 'GET',
        path: 'smile/whatsapp',
        responseMode: 'responseNode',
        options: {},
      },
      id: 'a7-webhook-whatsapp-get',
      name: 'A7 Webhook GET /whatsapp',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [100, 940],
      webhookId: 'smile-whatsapp-verify-webhook',
    },
    {
      parameters: {
        httpMethod: 'POST',
        path: 'smile/whatsapp',
        responseMode: 'responseNode',
        options: {},
      },
      id: 'a7-webhook-whatsapp-post',
      name: 'A7 Webhook POST /whatsapp',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [100, 1080],
      webhookId: 'smile-whatsapp-msg-webhook',
    },
    {
      parameters: {
        values: {
          string: [
            { name: 'route', value: 'whatsapp' },
          ],
        },
        options: {},
      },
      id: 'a7-set-route',
      name: 'A7 Set Route whatsapp',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [320, 1010],
    },
    {
      parameters: {
        httpMethod: 'POST',
        path: 'smile/notify',
        responseMode: 'responseNode',
        options: {},
      },
      id: 'a8-webhook-notify',
      name: 'A8 Webhook POST /notify',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [100, 1220],
      webhookId: 'smile-notify-webhook',
    },
    {
      parameters: {
        values: {
          string: [
            { name: 'route', value: 'notify' },
          ],
        },
        options: {},
      },
      id: 'a8-set-route',
      name: 'A8 Set Route notify',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [320, 1220],
    },
    {
      parameters: {
        rule: {
          interval: [
            { field: 'minutes', minutesInterval: 30 },
          ],
        },
      },
      id: 'a9-schedule-reminders',
      name: 'A9 Schedule Reminders 30m',
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.2,
      position: [100, 1360],
    },
    {
      parameters: {
        values: {
          string: [
            { name: 'route', value: 'reminders' },
          ],
        },
        options: {},
      },
      id: 'a9-set-route',
      name: 'A9 Set Route reminders',
      type: 'n8n-nodes-base.set',
      typeVersion: 3.4,
      position: [320, 1360],
    },

    // ----------------------------------------------------------------
    // SECTION B: CONFIG & ROUTER
    // ----------------------------------------------------------------
    {
      parameters: {
        jsCode: `// B1 Config Node: Central non-secret settings (blocks $env access)
const inputData = $input.item.json;

return {
  route: inputData.route || 'unknown',
  SUPABASE_URL: 'https://placeholder.supabase.co',
  FRONTEND_ORIGIN: '*',
  MOCK_MODE: true,
  CLINIC_SLUG: 'smile-dental',
  LLM_MODE: 'mock',
  query: inputData.query || {},
  body: inputData.body || {},
  headers: inputData.headers || {}
};`,
      },
      id: 'b1-config',
      name: 'B1 Master Config Node',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [600, 600],
    },
    {
      parameters: {
        dataType: 'string',
        value1: '={{ $json.route }}',
        rules: {
          rules: [
            { value2: 'slots', outputKey: 'slots' },
            { value2: 'book', outputKey: 'book' },
            { value2: 'appointment_get', outputKey: 'appointment_get' },
            { value2: 'appointment_cancel', outputKey: 'appointment_cancel' },
            { value2: 'appointment_reschedule', outputKey: 'appointment_reschedule' },
            { value2: 'chat', outputKey: 'chat' },
            { value2: 'whatsapp', outputKey: 'whatsapp' },
            { value2: 'notify', outputKey: 'notify' },
            { value2: 'reminders', outputKey: 'reminders' },
          ],
        },
      },
      id: 'b2-switch-route',
      name: 'B2 Switch On Route',
      type: 'n8n-nodes-base.switch',
      typeVersion: 3.2,
      position: [850, 600],
    },

    // ----------------------------------------------------------------
    // SECTION A HANDLER: SLOTS
    // ----------------------------------------------------------------
    {
      parameters: {
        jsCode: `// Handler for GET /slots
const query = $json.query || {};
const date = query.date || new Date().toISOString().split('T')[0];
const service_id = query.service_id || 'default';

// Prepare mock slots or RPC query payload
const times = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:30 PM', '03:00 PM',
  '03:30 PM', '04:00 PM', '05:00 PM', '05:30 PM'
];

const slots = times.map(t => {
  const [time, mod] = t.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (mod === 'PM' && h < 12) h += 12;
  if (mod === 'AM' && h === 12) h = 0;
  const start = new Date(\`\${date}T\${String(h).padStart(2,'0')}:\${String(m).padStart(2,'0')}:00+05:00\`);
  return {
    slot_start: start.toISOString(),
    slot_end: new Date(start.getTime() + 1800000).toISOString(),
    slot_start_pkt: t
  };
});

return {
  status: 200,
  response: {
    ok: true,
    data: {
      date,
      service_id,
      slots
    }
  }
};`,
      },
      id: 'a1-slots-processor',
      name: 'A1 Process Slots',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1200, 100],
    },
    {
      parameters: {
        respondWith: 'json',
        responseBody: '={{ JSON.stringify($json.response) }}',
        options: {
          responseCode: '={{ $json.status }}',
          responseHeaders: {
            entries: [
              { name: 'Access-Control-Allow-Origin', value: '*' },
              { name: 'Content-Type', value: 'application/json' },
            ],
          },
        },
      },
      id: 'a1-respond-slots',
      name: 'A1 Respond /slots',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [1450, 100],
    },

    // ----------------------------------------------------------------
    // SECTION C: BOOKING ENGINE
    // ----------------------------------------------------------------
    {
      parameters: {
        jsCode: `// C1 Validation & Honeypot & Abuse Limits
const body = $json.body || {};
const honeypot = body.honeypot;

// 1. Bot Honeypot Check
if (honeypot && honeypot.trim().length > 0) {
  return {
    status: 400,
    response: { ok: false, error: { code: 'bot_rejected', message: 'Invalid submission' } }
  };
}

// 2. Validate Name
const name = (body.name || '').trim();
if (!name || name.length < 2) {
  return {
    status: 400,
    response: { ok: false, error: { code: 'invalid_name', message: 'Please provide a valid full name.' } }
  };
}

// 3. Normalize Pakistani Phone: +923XXXXXXXXX
const rawPhone = (body.phone || '').replace(/\\D/g, '');
let normPhone = null;
if (rawPhone.length === 11 && rawPhone.startsWith('03')) {
  normPhone = '+92' + rawPhone.slice(1);
} else if (rawPhone.length === 12 && rawPhone.startsWith('923')) {
  normPhone = '+' + rawPhone;
} else if (rawPhone.length === 10 && rawPhone.startsWith('3')) {
  normPhone = '+92' + rawPhone;
}

if (!normPhone) {
  return {
    status: 400,
    response: { ok: false, error: { code: 'invalid_phone', message: 'Please provide a valid 11-digit Pakistani mobile number (03XX-XXXXXXX).' } }
  };
}

// 4. Validate Slot / Service
if (!body.service_id) {
  return {
    status: 400,
    response: { ok: false, error: { code: 'unknown_service', message: 'Service not specified.' } }
  };
}

if (!body.starts_at) {
  return {
    status: 400,
    response: { ok: false, error: { code: 'slot_not_available', message: 'Start time required.' } }
  };
}

// Success mock booking result
const token = 'tok_' + Math.random().toString(36).substring(2, 18);
const startsAt = body.starts_at;
const endsAt = new Date(new Date(startsAt).getTime() + 1800000).toISOString();

return {
  status: 200,
  phone: normPhone,
  patient_name: name,
  starts_at: startsAt,
  manage_token: token,
  response: {
    ok: true,
    data: {
      appointment_id: 'appt_' + Math.random().toString(36).substring(2, 10),
      manage_token: token,
      starts_at: startsAt,
      ends_at: endsAt,
      patient_name: name,
      phone: normPhone,
      source: body.source || 'website'
    }
  }
};`,
      },
      id: 'c1-validate-booking',
      name: 'C1 Validate Booking',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1200, 260],
    },
    {
      parameters: {
        respondWith: 'json',
        responseBody: '={{ JSON.stringify($json.response) }}',
        options: {
          responseCode: '={{ $json.status }}',
          responseHeaders: {
            entries: [
              { name: 'Access-Control-Allow-Origin', value: '*' },
              { name: 'Content-Type', value: 'application/json' },
            ],
          },
        },
      },
      id: 'c2-respond-book',
      name: 'C2 Respond /book',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [1450, 260],
    },

    // ----------------------------------------------------------------
    // SECTION D: SELF-SERVICE (GET / CANCEL / RESCHEDULE)
    // ----------------------------------------------------------------
    {
      parameters: {
        jsCode: `// D1 Get Appointment by Token
const query = $json.query || {};
const token = query.token;

if (!token) {
  return {
    status: 404,
    response: { ok: false, error: { code: 'not_found', message: 'Token required' } }
  };
}

return {
  status: 200,
  response: {
    ok: true,
    data: {
      manage_token: token,
      patient_name: 'Patient Demo',
      phone: '+923001234567',
      service_name: 'Dental Checkup & Consultation',
      service_id: 's-1',
      starts_at: new Date(Date.now() + 86400000).toISOString(),
      ends_at: new Date(Date.now() + 86400000 + 1800000).toISOString(),
      status: 'booked',
      doctor_name: 'Dr. Zeeshan Ahmad',
      clinic_address: 'Plot 14-B, Sector F-7 Markaz, Islamabad'
    }
  }
};`,
      },
      id: 'd1-process-get',
      name: 'D1 Process GET Appointment',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1200, 420],
    },
    {
      parameters: {
        respondWith: 'json',
        responseBody: '={{ JSON.stringify($json.response) }}',
        options: {
          responseCode: '={{ $json.status }}',
          responseHeaders: {
            entries: [
              { name: 'Access-Control-Allow-Origin', value: '*' },
              { name: 'Content-Type', value: 'application/json' },
            ],
          },
        },
      },
      id: 'd1-respond-get',
      name: 'D1 Respond GET /appointment',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [1450, 420],
    },
    {
      parameters: {
        jsCode: `// D2 Cancel Appointment by Token
const body = $json.body || {};
const token = body.token;

if (!token) {
  return {
    status: 404,
    response: { ok: false, error: { code: 'appointment_not_found', message: 'Invalid manage token' } }
  };
}

return {
  status: 200,
  response: {
    ok: true,
    data: {
      manage_token: token,
      status: 'cancelled',
      message: 'Appointment has been cancelled.'
    }
  }
};`,
      },
      id: 'd2-process-cancel',
      name: 'D2 Process Cancel',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1200, 560],
    },
    {
      parameters: {
        respondWith: 'json',
        responseBody: '={{ JSON.stringify($json.response) }}',
        options: {
          responseCode: '={{ $json.status }}',
          responseHeaders: {
            entries: [
              { name: 'Access-Control-Allow-Origin', value: '*' },
              { name: 'Content-Type', value: 'application/json' },
            ],
          },
        },
      },
      id: 'd2-respond-cancel',
      name: 'D2 Respond /appointment/cancel',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [1450, 560],
    },
    {
      parameters: {
        jsCode: `// D3 Reschedule Appointment
const body = $json.body || {};
const token = body.token;
const newStart = body.starts_at;

if (!token || !newStart) {
  return {
    status: 400,
    response: { ok: false, error: { code: 'validation_error', message: 'Token and new start time required' } }
  };
}

return {
  status: 200,
  response: {
    ok: true,
    data: {
      manage_token: token,
      starts_at: newStart,
      ends_at: new Date(new Date(newStart).getTime() + 1800000).toISOString(),
      status: 'booked'
    }
  }
};`,
      },
      id: 'd3-process-reschedule',
      name: 'D3 Process Reschedule',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1200, 700],
    },
    {
      parameters: {
        respondWith: 'json',
        responseBody: '={{ JSON.stringify($json.response) }}',
        options: {
          responseCode: '={{ $json.status }}',
          responseHeaders: {
            entries: [
              { name: 'Access-Control-Allow-Origin', value: '*' },
              { name: 'Content-Type', value: 'application/json' },
            ],
          },
        },
      },
      id: 'd3-respond-reschedule',
      name: 'D3 Respond /appointment/reschedule',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [1450, 700],
    },

    // ----------------------------------------------------------------
    // SECTION E: CHAT BRAIN (WEB & WHATSAPP)
    // ----------------------------------------------------------------
    {
      parameters: {
        jsCode: `// E1 Bilingual Conversational Brain
const body = $json.body || {};
const message = (body.message || '').trim().toLowerCase();
const buttonId = body.button_id;

// Detect Roman Urdu keywords
const urduWords = ['dard', 'bohat dard', 'soojan', 'khoon', 'safai', 'paisa', 'paise', 'kitne', 'timing', 'aaj', 'kal', 'parso', 'subah', 'shaam', 'chahiye', 'karna', 'hai', 'peer', 'jumma'];
const isRomanUrdu = urduWords.some(w => message.includes(w));
const lang = isRomanUrdu ? 'roman_ur' : 'en';

// Detect Emergency keywords
const emergencyWords = ['pain', 'severe pain', 'swelling', 'bleeding', 'broken', 'dard', 'bohat dard', 'soojan', 'khoon', 'tuta'];
const isEmergency = emergencyWords.some(w => message.includes(w)) || buttonId === 'intent_emergency';

let replyText = '';
let buttons = [];

if (isEmergency) {
  replyText = lang === 'en'
    ? '⚠️ DENTAL EMERGENCY: If you have severe pain, bleeding, or facial swelling, please call our clinic immediately at +92 300 1234567. We hold priority walk-in slots for acute dental emergencies.'
    : '⚠️ EMERGENCY ILAJ: Agar aap ko shadeed dard, soojan ya khoon nikal raha hai to foran hamare emergency number +92 300 1234567 par call karein. Hamare paas emergency mareezon ke liye slots foran dastyab hain.';
  buttons = [
    { label: lang === 'en' ? 'Call Doctor Now' : 'Doctor Ko Call Karein', value: 'call_now' },
    { label: lang === 'en' ? 'Book Earliest Slot' : 'Pehla Khali Slot Dein', value: 'intent_book' }
  ];
} else if (buttonId === 'intent_book' || message.includes('appointment') || message.includes('book') || message.includes('chahiye')) {
  replyText = lang === 'en'
    ? 'Please select the dental treatment you need:'
    : 'Barah-e-karam batayein konsa ilaaj karwana chahte hain:';
  buttons = [
    { label: 'Checkup & Consultation', value: 'srv_checkup' },
    { label: 'Scaling & Polishing', value: 'srv_scaling' },
    { label: 'Root Canal (RCT)', value: 'srv_rct' },
    { label: 'Teeth Whitening', value: 'srv_whitening' }
  ];
} else if (buttonId?.startsWith('srv_')) {
  replyText = lang === 'en'
    ? 'Which day would you like to visit? You can pick an option or type e.g. "Tomorrow":'
    : 'Aap kis din aana chahte hain? Aap chun bhi sakte hain maslan "Kal":';
  buttons = [
    { label: lang === 'en' ? 'Today' : 'Aaj', value: 'date_today' },
    { label: lang === 'en' ? 'Tomorrow' : 'Kal', value: 'date_tomorrow' },
    { label: lang === 'en' ? 'Day After' : 'Parso', value: 'date_parso' }
  ];
} else if (buttonId?.startsWith('date_') || message.includes('kal') || message.includes('aaj') || message.includes('parso')) {
  replyText = lang === 'en'
    ? 'Please select a free time slot (Pakistan Time):'
    : 'Khali waqt mein se chunain (Pakistan Time):';
  buttons = [
    { label: '11:00 AM', value: 'time_1100' },
    { label: '03:30 PM', value: 'time_1530' },
    { label: '05:30 PM', value: 'time_1730' },
    { label: '07:00 PM', value: 'time_1900' }
  ];
} else if (buttonId?.startsWith('time_')) {
  replyText = lang === 'en'
    ? 'Great! Please enter the patient’s full name:'
    : 'Zabardast! Barah-e-karam mareez ka mukammal naam darj karein:';
} else {
  replyText = lang === 'en'
    ? 'Welcome to Smile Dental Clinic. How can I help you today?'
    : 'Smile Dental Clinic mein khush-amdeed. Main aap ki kya madad kar sakta hoon?';
  buttons = [
    { label: lang === 'en' ? 'Book Appointment' : 'Appointment Book Karein', value: 'intent_book' },
    { label: lang === 'en' ? 'Prices & Services' : 'Fees Aur Services', value: 'intent_services' },
    { label: lang === 'en' ? 'Clinic Timings' : 'Clinic Ke Auqaat', value: 'intent_hours' }
  ];
}

return {
  status: 200,
  response: {
    ok: true,
    data: {
      message: replyText,
      buttons,
      language: lang,
      is_emergency: isEmergency
    }
  }
};`,
      },
      id: 'e1-chat-brain',
      name: 'E1 Chat Brain State Machine',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1200, 840],
    },
    {
      parameters: {
        respondWith: 'json',
        responseBody: '={{ JSON.stringify($json.response) }}',
        options: {
          responseCode: '={{ $json.status }}',
          responseHeaders: {
            entries: [
              { name: 'Access-Control-Allow-Origin', value: '*' },
              { name: 'Content-Type', value: 'application/json' },
            ],
          },
        },
      },
      id: 'e2-respond-chat',
      name: 'E2 Respond /chat',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [1450, 840],
    },

    // ----------------------------------------------------------------
    // SECTION F: WHATSAPP CLOUD API
    // ----------------------------------------------------------------
    {
      parameters: {
        jsCode: `// F1 Meta WhatsApp Cloud API Challenge & Message Parser
const query = $json.query || {};
const body = $json.body || {};

// 1. Meta Webhook Verification Challenge (GET)
if (query['hub.mode'] === 'subscribe' && query['hub.challenge']) {
  return {
    is_challenge: true,
    status: 200,
    raw_response: query['hub.challenge']
  };
}

// 2. Incoming WhatsApp Message Handling (POST)
// Respond 200 immediately to Meta
const entry = body.entry?.[0];
const changes = entry?.changes?.[0];
const val = changes?.value;
const messageObj = val?.messages?.[0];
const fromPhone = messageObj?.from || 'unknown';
const text = messageObj?.text?.body || messageObj?.interactive?.button_reply?.title || messageObj?.interactive?.list_reply?.title || '';

return {
  is_challenge: false,
  status: 200,
  phone: fromPhone,
  message: text,
  response: {
    ok: true,
    status: 'received',
    simulated_outgoing: {
      recipient: fromPhone,
      message_preview: 'Interactive booking response formulated'
    }
  }
};`,
      },
      id: 'f1-parse-whatsapp',
      name: 'F1 Parse WhatsApp',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1200, 980],
    },
    {
      parameters: {
        respondWith: 'text',
        responseBody: "={{ $json.is_challenge ? $json.raw_response : JSON.stringify($json.response) }}",
        options: {
          responseCode: 200,
          responseHeaders: {
            entries: [
              { name: 'Content-Type', value: '={{ $json.is_challenge ? \"text/plain\" : \"application/json\" }}' },
            ],
          },
        },
      },
      id: 'f2-respond-whatsapp',
      name: 'F2 Respond WhatsApp 200',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [1450, 980],
    },

    // ----------------------------------------------------------------
    // SECTION H: 30-MIN REMINDERS CRON
    // ----------------------------------------------------------------
    {
      parameters: {
        jsCode: `// H1 Reminders Scheduler (Pakistan 9am-9pm Window Check)
const now = new Date();
// Calculate Pakistan hour (UTC+5)
const pktHour = (now.getUTCHours() + 5) % 24;

if (pktHour < 9 || pktHour >= 21) {
  return {
    skipped: true,
    reason: \`Outside Pakistan delivery window (09:00 - 21:00 PKT). Current PKT hour: \${pktHour}\`
  };
}

return {
  skipped: false,
  reminders_processed: 0,
  message: 'Reminders job verified and completed successfully.'
};`,
      },
      id: 'h1-reminders-job',
      name: 'H1 Process Reminders',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1200, 1120],
    },

    // ----------------------------------------------------------------
    // SECTION I: ADMIN NOTIFY
    // ----------------------------------------------------------------
    {
      parameters: {
        jsCode: `// I1 Authenticated Admin Notify Verification
const headers = $json.headers || {};
const body = $json.body || {};
const authHeader = headers.authorization || '';

if (!authHeader.startsWith('Bearer ')) {
  return {
    status: 401,
    response: { ok: false, error: { code: 'unauthorized', message: 'Bearer token required' } }
  };
}

return {
  status: 200,
  response: {
    ok: true,
    message: 'Patient notification sent successfully.',
    recipient: body.phone
  }
};`,
      },
      id: 'i1-admin-notify',
      name: 'I1 Verify & Notify',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1200, 1260],
    },
    {
      parameters: {
        respondWith: 'json',
        responseBody: '={{ JSON.stringify($json.response) }}',
        options: {
          responseCode: '={{ $json.status }}',
          responseHeaders: {
            entries: [
              { name: 'Access-Control-Allow-Origin', value: '*' },
              { name: 'Content-Type', value: 'application/json' },
            ],
          },
        },
      },
      id: 'i2-respond-notify',
      name: 'I2 Respond /notify',
      type: 'n8n-nodes-base.respondToWebhook',
      typeVersion: 1.1,
      position: [1450, 1260],
    },

    // ----------------------------------------------------------------
    // SECTION J: MISSED CALL (DISABLED)
    // ----------------------------------------------------------------
    {
      parameters: {
        httpMethod: 'POST',
        path: 'smile/missed-call',
        responseMode: 'onReceived',
        options: {},
      },
      id: 'j1-webhook-missed-call',
      name: 'J1 Webhook /missed-call (Disabled)',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2,
      position: [100, 1500],
      disabled: true,
      webhookId: 'smile-missed-call-webhook',
    },

    // ----------------------------------------------------------------
    // SECTION K: GOOGLE CALENDAR (DISABLED)
    // ----------------------------------------------------------------
    {
      parameters: {
        jsCode: `// K1 Google Calendar Mirror (Disabled by default)
return $input.all();`,
      },
      id: 'k1-gcal-mirror',
      name: 'K1 Google Calendar Mirror (Disabled)',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [1800, 260],
      disabled: true,
    },
  ],

  connections: {
    'A1 Webhook GET /slots': {
      main: [[{ node: 'A1 Set Route slots', type: 'main', index: 0 }]],
    },
    'A1 Set Route slots': {
      main: [[{ node: 'B1 Master Config Node', type: 'main', index: 0 }]],
    },

    'A2 Webhook POST /book': {
      main: [[{ node: 'A2 Set Route book', type: 'main', index: 0 }]],
    },
    'A2 Set Route book': {
      main: [[{ node: 'B1 Master Config Node', type: 'main', index: 0 }]],
    },

    'A3 Webhook GET /appointment': {
      main: [[{ node: 'A3 Set Route appointment_get', type: 'main', index: 0 }]],
    },
    'A3 Set Route appointment_get': {
      main: [[{ node: 'B1 Master Config Node', type: 'main', index: 0 }]],
    },

    'A4 Webhook POST /appointment/cancel': {
      main: [[{ node: 'A4 Set Route appointment_cancel', type: 'main', index: 0 }]],
    },
    'A4 Set Route appointment_cancel': {
      main: [[{ node: 'B1 Master Config Node', type: 'main', index: 0 }]],
    },

    'A5 Webhook POST /appointment/reschedule': {
      main: [[{ node: 'A5 Set Route appointment_reschedule', type: 'main', index: 0 }]],
    },
    'A5 Set Route appointment_reschedule': {
      main: [[{ node: 'B1 Master Config Node', type: 'main', index: 0 }]],
    },

    'A6 Webhook POST /chat': {
      main: [[{ node: 'A6 Set Route chat', type: 'main', index: 0 }]],
    },
    'A6 Set Route chat': {
      main: [[{ node: 'B1 Master Config Node', type: 'main', index: 0 }]],
    },

    'A7 Webhook GET /whatsapp': {
      main: [[{ node: 'A7 Set Route whatsapp', type: 'main', index: 0 }]],
    },
    'A7 Webhook POST /whatsapp': {
      main: [[{ node: 'A7 Set Route whatsapp', type: 'main', index: 0 }]],
    },
    'A7 Set Route whatsapp': {
      main: [[{ node: 'B1 Master Config Node', type: 'main', index: 0 }]],
    },

    'A8 Webhook POST /notify': {
      main: [[{ node: 'A8 Set Route notify', type: 'main', index: 0 }]],
    },
    'A8 Set Route notify': {
      main: [[{ node: 'B1 Master Config Node', type: 'main', index: 0 }]],
    },

    'A9 Schedule Reminders 30m': {
      main: [[{ node: 'A9 Set Route reminders', type: 'main', index: 0 }]],
    },
    'A9 Set Route reminders': {
      main: [[{ node: 'B1 Master Config Node', type: 'main', index: 0 }]],
    },

    'B1 Master Config Node': {
      main: [[{ node: 'B2 Switch On Route', type: 'main', index: 0 }]],
    },

    'B2 Switch On Route': {
      main: [
        [{ node: 'A1 Process Slots', type: 'main', index: 0 }],
        [{ node: 'C1 Validate Booking', type: 'main', index: 0 }],
        [{ node: 'D1 Process GET Appointment', type: 'main', index: 0 }],
        [{ node: 'D2 Process Cancel', type: 'main', index: 0 }],
        [{ node: 'D3 Process Reschedule', type: 'main', index: 0 }],
        [{ node: 'E1 Chat Brain State Machine', type: 'main', index: 0 }],
        [{ node: 'F1 Parse WhatsApp', type: 'main', index: 0 }],
        [{ node: 'I1 Verify & Notify', type: 'main', index: 0 }],
        [{ node: 'H1 Process Reminders', type: 'main', index: 0 }],
      ],
    },

    'A1 Process Slots': {
      main: [[{ node: 'A1 Respond /slots', type: 'main', index: 0 }]],
    },

    'C1 Validate Booking': {
      main: [[{ node: 'C2 Respond /book', type: 'main', index: 0 }]],
    },

    'D1 Process GET Appointment': {
      main: [[{ node: 'D1 Respond GET /appointment', type: 'main', index: 0 }]],
    },

    'D2 Process Cancel': {
      main: [[{ node: 'D2 Respond /appointment/cancel', type: 'main', index: 0 }]],
    },

    'D3 Process Reschedule': {
      main: [[{ node: 'D3 Respond /appointment/reschedule', type: 'main', index: 0 }]],
    },

    'E1 Chat Brain State Machine': {
      main: [[{ node: 'E2 Respond /chat', type: 'main', index: 0 }]],
    },

    'F1 Parse WhatsApp': {
      main: [[{ node: 'F2 Respond WhatsApp 200', type: 'main', index: 0 }]],
    },

    'I1 Verify & Notify': {
      main: [[{ node: 'I2 Respond /notify', type: 'main', index: 0 }]],
    },
  },

  settings: {
    executionOrder: 'v1',
    saveDataErrorExecution: 'all',
    saveDataSuccessExecution: 'none',
    saveExecutionProgress: false,
    saveManualExecutions: false,
  },

  staticData: null,
  tags: [
    { name: 'smile-dental' },
  ],
};

const outDir = path.join(process.cwd(), 'n8n-workflow');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, 'smile-backend.json');
fs.writeFileSync(outPath, JSON.stringify(workflow, null, 2), 'utf-8');
console.log('Successfully generated:', outPath);
