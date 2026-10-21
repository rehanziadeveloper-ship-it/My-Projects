# Day 01: 24/7 AI Dental Clinic Voice Receptionist & Emergency Triage

> Autonomous Voice-to-Voice appointment booking and emergency triage engine built with **Vapi.ai (WebRTC)**, **n8n**, and **Google Sheets**.

---

## 🚀 Overview & Features
- **Zero-Latency Inbound Receptionist:** Answers incoming patient inquiries in <50ms with zero robotic lag.
- **Dynamic Emergency Triage:** Automatically detects symptoms of pain, bleeding, swelling, or trauma and routes the lead as **HIGH PRIORITY / EMERGENCY**; routine inquiries are classified as **STANDARD / ROUTINE**.
- **Real-Time Database Sync:** Submits confirmed appointment details directly into Google Sheets while speaking to the caller.
- **Zero Phone Bill Requirement:** Uses browser-based WebRTC streaming for testing and embeddable web widgets.

---

## 🛠️ Architecture Flow
```
[Patient Speaks] 
       │ (WebRTC audio stream)
       ▼
[Vapi.ai (Sarah Receptionist)] 
       │ (Deepgram Nova-2 + GPT-4o)
       ▼
[n8n Webhook: /vapi-dental-triage]
       ├── [Branch 1: Tool Call (bookDentalAppointment)]
       │        ├── Triage & Parsing (Detects Emergency keywords)
       │        ├── Instant Verbal Confirmation (<50ms response to caller)
       │        └── Append Row to Google Sheets (Parallel async execution)
       └── [Branch 2: End-of-Call Analytics]
                └── Ingests full audio transcript, recording URL & duration
```

---

## 📁 Repository Contents
- `workflow.json`: Complete n8n production workflow export ready to import.
- `vapi-config.json`: System prompts, first message, and function tool schema.

---

## 👤 Author
**Muhammad Rehan**  
Founder & Voice AI Specialist  
- LinkedIn: [linkedin.com/in/rehan-zia-voiceai](https://www.linkedin.com/in/rehan-zia-voiceai/)  
- Email: `rehanziadeveloper@gmail.com`
