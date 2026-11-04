# Raqba — Autonomous Real Estate Brokerage Operating System

> **Brokerage Focus:** Single Luxury Real Estate Brokerage in Pakistan (Lahore, Islamabad, Karachi, Rawalpindi)  
> **Brand Identity:** Raqba — *Your trusted property partner*  
> **System Architecture:** React 18 + Vite 5 + Tailwind CSS + Supabase PostgreSQL Realtime + Hostinger n8n Engine  
> **Currency & Units:** PKR (Lakhs / Crores) • Marla & Kanal • Automated Language Detection (English / Roman Urdu / Urdu Script)

---

## 🏛️ The Four-Part Operating Flow

Raqba organizes all brokerage operations into a simple, deterministic 4-step pipeline:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  1. CAPTURE  │ ──> │  2. QUALIFY  │ ──> │    3. ACT    │ ──> │   4. CLOSE   │
│ Leads Ingest │     │ Score+Verify │     │Assign+Showing│     │E-Sign+Deals  │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
```

### 1. CAPTURE (Leads In)
- **Public Portal:** High-conversion luxury inquiry form with data consent checkbox (`/`).
- **Single-Line Header:** Desktop navigation in a single horizontal row (`72px`, `whitespace-nowrap`, `flex items-center justify-between`) that transitions from transparent to solid white on scroll. Clean mobile drawer at `<768px`.
- **Raqba AI Chat Concierge:** Guided slot-filling conversational assistant supporting 5 primary services:
  1. *Buy* (Residential & commercial acquisition)
  2. *Rent* (Luxury rental search)
  3. *Sell* (Property disposition & appraisal intake)
  4. *Rent out my property* (Landlord leasing intake)
  5. *Invest* (High-yield portfolio & commercial investment)
- **Automatic Language Detection:** Chatbot detects language per message (English, Roman Urdu, or Urdu script) without manual toggle buttons. The main website UI remains in clean English.
- **Portal Ingest Webhook:** Ingests leads from Zameen.com, OLX Pakistan, and social ad campaigns via `POST /webhook/raqba/portal-lead`.
- **Direct Lead Intake:** Receptionists or agents manually log office walk-ins and phone calls directly into the system (`/admin` -> Manual Lead Entry).

### 2. QUALIFY (Score & Manual Budget Check)
- **Silent 4-Vector Scoring & Temperature:** Runs in PostgreSQL backend (`raqba_score_and_dispatch`). Evaluates financing, timeline, budget realism, and composite intent.
- **Temperature Classification:**
  - **Hot (P0 Critical):** All-cash buyers, immediate timeline (≤1 month), high intent score (≥85).
  - **Warm (P1 High):** Bank financing or 1–3 months timeline, intent score 60–84.
  - **Cold (P2 Routine):** Exploratory buyers, developer installments, or long timeline (>3 months).
- **Broker-Verified Budget:** No artificial auto-approvals. The assigned broker verifies buyer capability via phone consultation or bank statement and marks the lead **"Verified"** with one click.

### 3. ACT (Round-Robin Dispatch & Showing Logistics)
- **Sub-15s Round-Robin Dispatch:** Hot / P0 leads are instantly dispatched to active licensed brokers (Chaudhry Kamran in Lahore, Zainab Malik in Islamabad, Hamza Abbasi in Karachi, Ayesha Siddiqui in Rawalpindi).
- **3-Bullet Dossier:** Delivers an actionable briefing to the broker:
  1. *Financial Vector:* Declared liquidity in Crores/Lakhs and verification status.
  2. *Timeline & Intent:* Target property, purchase window, and intent score.
  3. *Action & Quote:* Verbatim client request and callback recommendation.
- **Controlled Showing Clearance:** Showing logistics (Google Maps pin & society gate pass for gated communities like DHA and Bahria Town) are only issued **after** the assigned broker reviews and confirms the walkthrough (`raqba_confirm_showing`).
- **1-Click WhatsApp Pass:** Formatted walkthrough pass sent directly to the client's WhatsApp.

### 4. CLOSE (Agreements, Pipeline & Settlement)
- **E-Signature Pipeline:** Client representation agreements and Luxury NDAs are digitally signed with legally valid timestamps under Pakistan's **Electronic Transactions Ordinance (ETO) 2002** (`raqba_sign_agreement`).
- *Statutory Notice:* Formal title conveyance in Pakistan requires stamp paper and Sub-Registrar registration; this system handles preliminary representation, non-disclosure, and offer agreements.
- **Deal Pipeline Kanban:** `New` ➔ `Budget Verified` ➔ `Showing Scheduled` ➔ `Offer in Review` ➔ `Escrow & Closing`.
- **Property Submissions Screen:** Review owner submissions from the AI Chatbot (`/admin` -> Property Submissions). Brokers can review property documents, contact owners, and approve submissions to publish them directly to active inventory.
- **Full Chat Transcript & Dossier Modal:** Clicking "View Transcript & Dossier" on any Kanban card opens the complete multi-turn conversation history and extracted slot data.
- **Commission & Payment Tracking:** Brokerage commission rate is editable per deal. Direct payment statuses (`None` | `Token Received` | `Advance Received` | `Balance Pending`) are logged with broker notes since payments are settled directly.
- **Unified Executive Performance Card:** Combines gross commission forecasts with broker YTD closed volume leaderboards.

---

## 🤖 Raqba AI Chatbot Architecture

The AI Chat Concierge is driven by a stateful slot-filling engine hosted on Hostinger n8n (`/webhook/raqba/chat-concierge`):

```
User Message ➔ Auto Language Detect (EN / Roman Urdu / Urdu)
             ➔ Multi-Slot Extractor (Pakistani entities: Lakh/Crore, Marla/Kanal, DHA/Bahria)
             ➔ Human Handoff Check (Escalates to senior broker if requested)
             ➔ Skip Check (Handles 'skip' / 'pata nahi')
             ➔ Slot State Machine (Greeting ➔ Intent ➔ Contact ➔ Property ➔ Budget ➔ Appointment)
             ➔ Interactive Summary Card (Allows 1-click edits before submitting)
             ➔ Closing & Reference ID Assignment (RQB-YYYY-XXXX)
             ➔ Supabase Persistence (chat_sessions, chat_messages, leads)
```

---

## 🔐 Auth & Roles

The system uses role-based access control with Supabase Row Level Security:

| Role | Permissions & Scope |
| :--- | :--- |
| **Admin** | Full master access. Manages property inventory (add/edit/archive), reviews property submissions, views all leads across Pakistan, monitors all brokers, and accesses brokerage commission performance. |
| **Broker** | Scoped workspace. Each broker (e.g. Chaudhry Kamran in Lahore or Zainab Malik in Islamabad) sees **only** their assigned leads, upcoming private showings, and client representation agreements. |

*(In the Admin Control Room, toggle between Admin View and individual Broker identities using the Access Level switcher at the top of the left sidebar).*

---

## 🏡 How to Add a Property Listing

Property listings are 100% database-driven and do not require code changes:

1. Open `/admin` and select **Properties Manager** from the left sidebar.
2. Click **+ Add New Listing**.
3. Fill in the localized Pakistani listing details:
   - **Property Title:** e.g. *1 Kanal Modern Spanish Villa*.
   - **Category:** House / Apartment / Residential Plot / Commercial Plaza.
   - **City & Area:** Lahore (DHA Phase 6), Islamabad (Sector E-7), Karachi (Clifton), or Rawalpindi (Bahria Town).
   - **Price in PKR:** e.g. `45000000` (automatically displays as `Rs 4.50 Crore` across the website).
   - **Area Size & Unit:** Enter size and select `Marla`, `Kanal`, `Sq Ft`, or `Sq Yd`.
   - **Beds & Baths:** Enter room counts.
   - **Gated Community:** Check this box if the society requires security gate entry (the system generates a 4-digit `#PIN*` upon showing confirmation).
   - **Image URL:** Paste a high-resolution photo URL (WebP or JPEG).
4. Click **Publish Listing**. The property immediately appears on the public website and in search filters.

---

## 🔄 Webhook Routing & Migration

The active n8n master workflow (`YvBLqUJF3l5GNEgG`) supports both new Raqba endpoints and legacy paths in parallel:

| Webhook Function | New Raqba Path (Primary) | Legacy Path (Backward Compatible) |
| :--- | :--- | :--- |
| Direct Lead Intake | `POST /webhook/raqba/lead` | `POST /webhook/realtypulse/lead` |
| Portal Leads (Zameen/OLX) | `POST /webhook/raqba/portal-lead` | `POST /webhook/realtypulse/portal-lead` |
| Showing Clearance & Gate | `POST /webhook/raqba/showing-clearance` | `POST /webhook/realtypulse/showing-clearance` |
| AI Chat Concierge | `POST /webhook/raqba/chat-concierge` | `POST /webhook/realtypulse/chat-concierge` |

---

## 🧪 Verification & Test Suite

Run the automated live test suite verifying the database, RPCs, and n8n webhooks:

```bash
cd realtypulse-360
node tests/live.test.cjs
```

**Test Coverage (72 / 72 PASS):**
- Database tables & schema integrity (`properties`, `agents`, `leads`, `showings`, `agreements`, `chat_sessions`, `chat_messages`, `property_submissions`)
- Raqba 4-vector scoring RPC & Hot/Warm/Cold classification (`raqba_score_and_dispatch`)
- Manual budget verification RPC (`raqba_verify_budget`)
- Showing confirmation & gate pass RPC (`realtypulse_confirm_showing`, `raqba_confirm_showing`)
- E-signing audit vault RPC (`raqba_sign_agreement` under ETO 2002)
- Reference ID generation (`raqba_generate_reference_id` -> `RQB-YYYY-XXXX`)
- Live Hostinger n8n webhooks (`/webhook/raqba/*` and `/webhook/realtypulse/*`)
- 5 Chatbot Services: Buy, Rent, Sell, Rent out my property, Invest
- Language Auto-Detection (English, Roman Urdu, Urdu Script)
- Skip handling & Human Handoff triggers
- Summary confirmation card & edit loop
- Frontend header single-line layout (`72px`, `whitespace-nowrap`, `flex items-center justify-between`) & zero language buttons
- Supabase Row Level Security (RLS) policies
