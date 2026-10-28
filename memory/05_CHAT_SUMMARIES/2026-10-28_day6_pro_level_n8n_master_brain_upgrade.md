# Day 6 — Pro-Level Architecture: n8n Master Brain & Dumb UI Migration

**Date:** 2026-10-28  
**Agent:** Antigravity  
**Sprint:** 30-Day Project Build Sprint — Day 6 Upgrade  
**Tags:** #real-estate #n8n #architecture #dumb-ui #google-sheets #lead-scoring #master-brain #day6  

---

## 1. Objectives
- Migrate 100% of the backend logic, conversational state machine, 4-vector lead scoring, and database operations into n8n for Day 6 ("Apex Realty AI").
- Transform the frontend into an ultra-clean, lightweight "Dumb UI" that purely captures voice/text, delegates all processing to the n8n Master Brain webhook, and displays/speaks the returned responses.
- Route Broker CRM data fetching strictly through an n8n `GET` webhook that extracts and formats live rows from Google Sheets (`Real_Estate_Qualified_Leads`), eliminating direct client-side Sheets API calls.
- Deploy the complete n8n workflow JSON directly to the Hostinger n8n production instance, verify end-to-end execution, and synchronize Netlify production (`https://apex-realty-ai.netlify.app`) and GitHub.

---

## 2. Key Decisions & Code Changes

### A. The Master n8n Workflow ("The Brain")
- **Workflow ID:** `TNibBZ9eGODuEUhC` ("Day 6 - Apex Realty Master Brain (Pro-Level Backend)")
- **Status:** Active & Activated on Hostinger n8n.
- **Node Architecture (13 Nodes):**
  1. `Buyer_Inbound_Webhook` (`POST /webhook/apex-buyer-chat`): Accepts `{ sessionId, userMessage, targetProperty, sessionState }`.
  2. `AI_Acquisition_Brain` (`Code Node`): Converses naturally, tracks conversational turn count, and dynamically extracts all 4 key vectors:
     - Vector 1: Financing (40 pts max - Cash, Pre-Approved, Working with Broker, Mortgage Needed).
     - Vector 2: Budget (20 pts max - Evaluates target budget or property price).
     - Vector 3: Timeline (30 pts max - Immediate <30d, 1-3m, 3-6m, >6m browsing).
     - Vector 4: Buyer Intent (10 pts max - Primary Residence, Corporate Relocation, Vacation Retreat, Investment).
     - Contact Extraction: Phone, email, and safe name parsing (guarding against conversational words).
  3. `Check_Vectors_Complete` (`If Node`): Evaluates `{{ $json.isComplete }}`.
     - *False branch:* Routes to `Respond_Next_Question` (`Respond to Webhook`) with the natural follow-up prompt.
     - *True branch:* Routes to `Push_Lead_To_Google_Sheets` and responds with the complete Lead Scorecard & Triage.
  4. `Push_Lead_To_Google_Sheets` (`Google Sheets Node`, `operation: append`): Uses Service Account credential `AqyKDLuwANoDYrEw` (`Google Service Account`) to automatically append new qualified lead profiles directly into `Real_Estate_Qualified_Leads` on spreadsheet `1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo`.
  5. `Respond_Scorecard_&_Triage` (`Respond to Webhook`): Synchronously responds with the complete scorecard, tier badge (HOT 🔥 / WARM ⚡ / COLD ❄️), and immediate broker dispatch action.
  6. `CRM_Leads_Webhook` (`GET /webhook/apex-crm-leads`): Fetches live leads via `Read_Sheets_Leads` and normalizes rows with `Format_CRM_Leads` into a clean JSON array.
  7. `Listings_Webhook` (`GET /webhook/apex-listings`): Serves the 5 luxury portfolio listings and high-res imagery.

### B. Dumb Frontend Refactor (`public/index.html`)
- Completely stripped all local vector math, scoring algorithms, and client-side decision trees.
- Implemented a lightweight session client: passes `{ sessionId, userMessage, targetProperty, sessionState }` to `/api/chat`.
- Automatically renders whatever text/scorecard n8n returns and speaks it via the Web Speech API.
- Replaced direct Sheets reads in Broker CRM with calls to `/api/leads` (backed by n8n).

### C. Server & Serverless Function Alignment (`server.js` & `netlify/functions/api.js`)
- Standardized proxy endpoints to forward requests directly to the 3 active n8n webhooks:
  - `POST /api/chat` -> `https://n8n.srv1767318.hstgr.cloud/webhook/apex-buyer-chat`
  - `GET /api/leads` -> `https://n8n.srv1767318.hstgr.cloud/webhook/apex-crm-leads`
  - `GET /api/listings` -> `https://n8n.srv1767318.hstgr.cloud/webhook/apex-listings`
- Kept zero-downtime fallback engines for production resilience.

### D. Vector Extraction & Output Simplification Refinement
- **Clean Budget Extraction:** Stripped phone numbers and email addresses prior to budget evaluation to prevent numbers like `970-555` matching numeric ranges. Implemented strict currency and unit regex matching (`$`, `Million`, `M`, `k`, `Billion`, ranges like `$5 to 6 Million`, or `$4.2M`). Raw user messages are strictly prevented from ever saving into `budgetRange`.
- **Response Format Simplification:** Replaced heavy ASCII borders (`===` and `---`) with the exact clean, bulleted template requested by the user:
  ```text
  ✅ Buyer Qualification Complete!

  Here is the summary of your inquiry:
  • Client: [Name]
  • Target Property: [Property Name]
  • Budget: [Clean Extracted Amount]
  • Financing: [Financing Status]
  • Timeline: [Timeline]
  • Intent: [Intent]

  Lead Score: [Score]/100 ([Tier])
  Action: [Recommended Broker Action]

  Thank you! Our managing broker has received your file and will be in touch shortly.
  ```

---

## 3. Blockers & Technical Resolves
1. **Google Sheets OAuth vs Service Account on Hostinger n8n:**
   - *Issue:* OAuth2 credential lacked refresh permissions for headless webhook execution.
   - *Fix:* Swapped node credentials to instance service account `AqyKDLuwANoDYrEw` (`Google Service Account`) with `authentication: "serviceAccount"` and `options: { valueInputMode: "USER_ENTERED" }`. Successfully verified live append (`LEAD-2715` Charles Montgomery appended to row 8).
2. **Phone Number Formula Error in Google Sheets:**
   - *Issue:* Phone numbers beginning with `+` were evaluated as Excel/Sheets formula expressions `=+...` resulting in `#ERROR!`.
   - *Fix:* Formatted phone numbers with leading single-quote `'` or cleaned string prefix to guarantee clean plain text storage.
3. **Premature Name Assignment:**
   - *Issue:* Regex previously assigned full sentences like "I want to buy the Bel-Air Estate" into `fullName`.
   - *Fix:* Added strict heuristic requiring explicit introductory phrases or isolating name parsing only after the 4 property/financial vectors are locked in.

### E. Pro-Level Floating Chat Widget & 5-Phase Slot-Filling Brain Upgrade
- **Floating Chat Widget (Bottom-Right):**
  - Default State: Discreet circular floating trigger bubble with animated online badge and hover tooltip ("Talk with AI Advisor"). Zero obstruction of luxury portfolio listings.
  - Open State: Compact 380px wide glassmorphic obsidian window with gold borders, voice mute toggle, reset session button, and minimize button.
  - Push-to-Talk Voice Integration: Seamlessly integrated into widget footer using Web Speech API with pulsing ring animation and hands-free spoken speech synthesis.
  - Dumb UI: Stripped 100% of local logic from frontend. Formatted in modular files: [`index.html`](file:///d:/AI_ASSISANT/day-06-real-estate-buyer-qualification/public/index.html), [`styles.css`](file:///d:/AI_ASSISANT/day-06-real-estate-buyer-qualification/public/styles.css), and [`api.js`](file:///d:/AI_ASSISANT/day-06-real-estate-buyer-qualification/public/api.js).
- **5-Phase Slot-Filling State Machine (`TNibBZ9eGODuEUhC`):**
  - Strict 1-question rule: asks only one question at a time and automatically skips questions for slots already provided.
  - Phase 1: Opening & Intent (Buy / Rent / Sell / Rent out / Invest).
  - Phase 2: Contact Details (Name, Phone/WhatsApp, Email, Preferred contact method/time).
  - Phase 3A: Buyer/Renter Criteria (Purpose, Property Type, Location, Budget, Bedrooms, Payment Method, Timeline, Must-Haves).
  - Phase 3B: Seller/Landlord Criteria (Property Type, Location, Size/Condition, Asking Price, Document Readiness, Occupancy, Timeline).
  - Phase 4: Google Calendar Booking (Site visit or appraisal call scheduling; reserves slot via Google Calendar OAuth2 node `AW7YkPBa2mAXEwWO`).
  - Phase 5: Confirmation & Storage (Summary prompt "Is everything correct?", user confirmation, Lead Score calculation, Reference ID `#APX-XXXX` generation, and append to Google Sheets CRM `Real_Estate_Qualified_Leads` via service account `AqyKDLuwANoDYrEw`).

---

## 4. Verification & Testing
- ✅ `POST /webhook/apex-buyer-chat`: Tested multi-turn conversational follow-up questions and single-turn complete qualification.
- ✅ `GET /webhook/apex-crm-leads`: Tested reading from Google Sheets; confirmed 7 leads returned with live data.
- ✅ `GET /webhook/apex-listings`: Tested returning 5 luxury listings.
- ✅ Local Server: Port `3006` verified operational.
- ✅ Netlify Production: Deployed to `https://apex-realty-ai.netlify.app`, verified `200 OK` on `/api/listings` and `/api/leads`.

---

## 5. Next Steps
- Deliver final summary and workflow JSON to the user.
- Proceed to Day 7: Post-Call Intelligence Pipeline (Audio Summarizer + Sentiment Analysis).
