# 🎙️ Autonomous Voice AI & Clinic Automation Suite

> Production-grade Voice AI agents, inbound triage systems, and automated clinic pipelines built by **Muhammad Rehan** ([LinkedIn](https://www.linkedin.com/in/rehan-zia-voiceai/)).

---

## 🏆 30-Day Voice AI Build Challenge

A comprehensive sprint building 1 production-ready voice and automation system every day for 30 days.

| Day | Project | Core Tech Stack | Deliverables & Docs | Status | Live Demo |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **01** | **24/7 AI Dental Clinic Receptionist & Call Triage** | Vapi (WebRTC), n8n, Google Sheets, Groq | [View Day 1](day-01-dental-voice-receptionist/) | 🟢 **Production Live** | [Portal](day-01-dental-voice-receptionist/) |
| **02** | **Sub-60s Missed-Call Auto-Recovery & AI Lead Qualification** | WhatsApp Gateway, n8n, Google Sheets CRM | [View Day 2](day-02-missed-call-recovery/) | 🟢 **Production Live** | [Portal](day-02-missed-call-recovery/) |
| **03** | **Dental & Clinic Real-Time Calendar Booking Voicebot** | Web Speech API, Google Calendar API (Free/Busy), n8n | [View Day 3](day-03-calendar-voicebot/) | 🟢 **Production Live** | [Portal](day-03-calendar-voicebot/) |
| **04** | **Home Services Emergency Dispatch Voicebot (Plumbing/HVAC/Electrical)** | Netlify Serverless, Web Speech API, Google Calendar & Sheets CRM, Conflict Prevention | [View Day 4](day-04-emergency-dispatch-voicebot/) | 🟢 **Production Live** | [⚡ Live App](https://apex-emergency-dispatch.netlify.app) |
| **05** | **Restaurant Table Reservation & Menu Q&A Voicebot (Bella Vista Bistro)** | Web Speech API, Menu RAG Engine, 11-Table Floor Matrix, Google Sheets & Calendar Sync | [View Day 5](day-05-restaurant-reservation-voicebot/) | 🟢 **Production Live** | [Portal](day-05-restaurant-reservation-voicebot/) |
| **06** | **Real Estate Inbound Buyer Qualification Voicebot** | Inbound Lead Scorer, Twilio / WebRTC, CRM Pipeline, Slack Hot Leads | Day 6 | 🚀 Next Sprint | Coming Soon |
| **...** | *30 Days Roadmap* | n8n, Groq, Claude 3.5, Gemini, Supabase | [Full Roadmap](memory/02_PROJECTS/30_DAYS_BUILD_CHALLENGE.md) | 🚀 In Progress | — |

---

## 📂 Active Modules

### 📍 [Day 01: 24/7 AI Dental Clinic Voice Receptionist](day-01-dental-voice-receptionist/)
* **Inbound Call Triage:** Automatic detection of dental emergencies (severe pain, bleeding, swelling) vs. routine appointments.
* **Latency Optimization:** Sub-50ms verbal response to caller with asynchronous background Google Sheets logging.
* **Zero Carrier Blockers:** Full in-browser WebRTC testing without telephony carrier SMS delays.

### 📍 [Day 02: Sub-60s Missed-Call Auto-Recovery & AI Qualification](day-02-missed-call-recovery/)
* **Zero Patient Loss:** Automatically recaptures missed patient phone calls in under 60 seconds via WhatsApp.
* **Intelligent Clinical Triage:** Classifies urgency into emergency toothaches vs routine hygiene checkups.
* **Zero-Cost Architecture:** Complete local-bridge + webhook automation with 0 API cost and no credit card requirement.

### 📍 [Day 03: Dental Real-Time Voice Appointment Booking & Google Calendar Engine](day-03-calendar-voicebot/)
* **Zero Double-Booking:** Real-time Google Calendar Free/Busy slot verification prevents overlapping bookings.
* **Natural Dialogue Flow:** Dynamic date/time parsing with reschedule handling and doctor availability FAQ handler.
* **Dual-Write Architecture:** Writes confirmed appointments directly to Google Calendar and syncs patient records into Google Sheets.

### 📍 [Day 04: Home Services Emergency Dispatch Voicebot](day-04-emergency-dispatch-voicebot/) — [🌐 Live Demo](https://apex-emergency-dispatch.netlify.app)
* **24/7 Voice AI Dispatcher ("Marcus"):** Autonomous dispatcher triaging high-ticket emergencies (plumbing floods, freezing furnaces, sparking panels) vs. standard daytime service.
* **Life & Property Containment Advice:** Immediate spoken safety guidance (e.g. main water shutoff valve, electrical breaker distance).
* **Conflict-Free Scheduling Engine:** Guarantees zero technician overlap by cross-checking active dispatches and locking the next available window.
* **Serverless Dual-Write Architecture:** Powered by Netlify functions with direct RS256 JWT writes to Google Sheets (`Emergency_Dispatch_Day4`) and Google Calendar.
* **Mobile-Hardened Web Audio:** 0ms instant start delay, deep baritone dispatcher voice, 1000ms silence debounce, and tactile push-to-talk controls.

### 📍 [Day 05: Restaurant Table Reservation & Menu Q&A Voice Agent](day-05-restaurant-reservation-voicebot/)
* **24/7 Voice AI Host ("Marco"):** Sophisticated Italian Maître d' managing peak-hour reservation calls and table seating.
* **Menu & Dietary RAG Assistant:** Instant spoken answers on vegan options (Wild Mushroom & Black Truffle Risotto), certified gluten-free pastas, nut-free kitchen protocols, operating hours, and complimentary valet parking.
* **11-Table Floor Matrix & Conflict-Free Seating:** Allocates 2-top romantic tables, heated garden patio seating, family booths, and a private 14-guest Wine Cellar Suite with zero double-booking.
* **Dual-Write Operations Sync:** Real-time logging to Google Sheets (`Restaurant_Reservations_Day5`) and Google Calendar seating blocks.
* **Interactive Hospitality Operations Console:** Live interactive table occupancy map, audio equalizer canvas, and restaurant revenue recapture ROI calculator.

---

## 🛠️ Global Tech Stack
* **Voice & Telephony:** Web Speech API, Vapi.ai (WebRTC & VoIP), Web Audio API
* **Hosting & Serverless:** Netlify Functions (Node.js 24)
* **Messaging & Chat:** WhatsApp (Baileys WebRTC Gateway), Webhooks
* **Workflow Automation:** `n8n` (Self-hosted on Cloud VPS)
* **AI Models:** OpenAI GPT-4o-mini, Anthropic Claude 3.5 Sonnet, Groq Llama 3.3, Google Gemini Flash
* **Data & CRM:** Google Sheets API, Google Calendar API (v3), Supabase

---

## 👤 Author & Contact
**Muhammad Rehan**  
Founder & Voice AI Specialist  
* **LinkedIn:** [linkedin.com/in/rehan-zia-voiceai](https://www.linkedin.com/in/rehan-zia-voiceai/)  
* **Email:** `rehanziadeveloper@gmail.com`  
* **Location:** Dera Ismail Khan, KP, Pakistan
