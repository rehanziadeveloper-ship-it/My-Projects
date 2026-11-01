# System Operational Status (REAL vs MOCK)

> Transparent verification tracker. Never claim something is REAL unless verified against live services.

| Feature / Component | Mode | Verification Notes |
| :--- | :--- | :--- |
| **Database Schema (`schema.sql`)** | REAL / READY | Postgres DDL & RPC functions written for Supabase SQL Editor. |
| **Reschedule Function (`schema_changes.sql`)** | REAL / READY | Atomic cancellation + new booking transaction in PostgreSQL. |
| **Frontend Public Website** | REAL | React + Vite + Tailwind + R3F build clean, zero errors. |
| **Booking Flow (3 Steps)** | REAL | Integrates with n8n `/webhook/smile/book` and database RPC. |
| **Patient Self-Service (`/appointment/:token`)** | REAL | Directly calls n8n appointment self-service endpoints. |
| **Web Chatbot Widget** | REAL | Calls n8n `/webhook/smile/chat` with bilingual session memory. |
| **WhatsApp Chatbot Webhook** | MOCK / READY | Formatted for Meta Cloud API; returns simulated payloads in MOCK_MODE until user attaches Meta credentials. |
| **WhatsApp Message Dispatch** | MOCK (Default) | Switches to REAL Meta Graph API when `MOCK_MODE=false` in n8n Config node. |
| **n8n Backend Workflow** | REAL | Deployed to Hostinger n8n (`smile-dental` tag, inactive until credentials linked). |
| **Appointment Reminders (Cron)** | REAL / READY | 30-min scheduled trigger configured in n8n workflow. |
| **Admin Portal (`/admin`)** | REAL | Supabase Auth + RLS + Realtime listener on today's appointments. |
| **Missed Call Auto-Recovery** | MOCK / DISABLED | Nodes wired in workflow; disabled by default as specified. |
| **Google Calendar Mirror** | MOCK / DISABLED | Nodes wired in workflow; disabled by default as specified. |
