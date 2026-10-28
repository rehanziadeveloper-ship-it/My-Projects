# 🏛️ Apex Realty AI — Pro-Level Virtual Assistant & Inbound Qualification

> **Pro-Level Real Estate Advisory System powered 100% by a master n8n workflow. Features a sleek floating chat widget, hands-free Web Speech API voice input/output, a strict 5-Phase Slot-Filling State Machine, automated Google Calendar appointment booking, and Google Sheets CRM sync.**

[![Live Netlify Site](https://img.shields.io/badge/Netlify-Live%20Production-blue?style=for-the-badge&logo=netlify)](https://apex-realty-ai.netlify.app)
[![Live Local Server](https://img.shields.io/badge/Port-3006-orange?style=for-the-badge&logo=node.js)](http://localhost:3006)
[![Google Sheets CRM](https://img.shields.io/badge/Google%20Sheets-Live%20CRM-success?style=for-the-badge&logo=googlesheets)](https://docs.google.com/spreadsheets/d/1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo)
[![n8n Master Brain](https://img.shields.io/badge/n8n-Master%20Brain%20Active-red?style=for-the-badge&logo=n8n)](https://n8n.srv1767318.hstgr.cloud)

---

## 📌 Architecture Overview

Apex Realty AI eliminates repetitive screening calls by moving 100% of intelligence into a master n8n workflow while providing an ultra-lightweight, luxurious floating chat widget on the frontend.

```mermaid
flowchart TD
    Client["Client / Investor"] -->|Text or Voice| Widget["Floating Chat Widget (Bottom-Right)"]
    Widget -->|POST /api/chat| N8N["Master n8n Brain (TNibBZ9eGODuEUhC)"]
    
    subgraph n8n ["n8n Master Workflow (Hostinger Cloud)"]
        N8N --> Phase1["Phase 1: Opening & Intent (Buy/Rent/Sell/Invest)"]
        Phase1 --> Phase2["Phase 2: Contact (Name, Phone/WhatsApp, Time)"]
        Phase2 --> Decision{"Intent?"}
        Decision -->|Buy/Rent/Invest| Phase3A["Phase 3A: Buyer/Renter Criteria (8 Vectors)"]
        Decision -->|Sell/Rent out| Phase3B["Phase 3B: Seller/Landlord Criteria (7 Vectors)"]
        Phase3A --> Phase4["Phase 4: Next Step (GCal Site Visit / Call Booking)"]
        Phase3B --> Phase4
        Phase4 --> GCal["Google Calendar Node (OAuth2 AW7YkPBa2mAXEwWO)"]
        GCal --> Phase5["Phase 5: Confirmation & Scoring Matrix"]
        Phase5 --> GSheets["Google Sheets CRM (Real_Estate_Qualified_Leads)"]
    end
    
    GSheets -->|Auto Append| SheetRow["Lead Row & Appointment Reserved"]
    Phase5 -->|Ref #APX-XXXX + Scorecard| Widget
    Widget -->|Display & Voice Audio| Client
```

---

## 🌟 Key Features

### 1. Frontend Redesign (Floating Chat Widget)
- **Default State:** Discreet circular floating bubble icon fixed in the bottom-right corner. Zero screen obstruction.
- **Open State:** Smoothly expands into a compact (380px wide), dark obsidian & gold glassmorphic window.
- **Voice Integration:** Integrated Push-to-Talk microphone powered by the Web Speech API with pulsing ring animation and hands-free spoken audio responses.
- **Dumb UI:** Frontend contains 0% scoring or business logic; it strictly sends payloads to the n8n webhook and displays n8n's responses.

### 2. The 5-Phase Slot-Filling State Machine
- **Strict 1-Question Rule:** The assistant asks only ONE missing question at a time. If the user provides multiple pieces of information in a single message, the state machine extracts all of them and skips redundant questions.
- **Phase 1: Opening & Intent:** Greet and extract Intent (`Buy`, `Rent`, `Sell`, `Rent out`, `Invest`).
- **Phase 2: Contact Details:** Safe name parsing, phone/WhatsApp number, optional email, and preferred contact method/time.
- **Phase 3A: Buyer/Renter Branch:** Purpose (Living vs Investment), Property Type, Location, Target Budget, Bedrooms, Payment Method (Cash vs Mortgage), Timeline, Must-Have Amenities.
- **Phase 3B: Seller/Landlord Branch:** Property Type, Location, Size & Condition, Asking Price, Document Readiness (Title deed in hand vs mortgaged), Occupancy Status (Vacant vs Occupied), Timeline.
- **Phase 4: Next Step (Google Calendar Booking):** Prompts for preferred appointment time ("Tomorrow at 3:00 PM for a site visit"), converts to ISO 8601 interval, and automatically reserves the event on Google Calendar.
- **Phase 5: Confirmation & Storage:** Summarizes all extracted vectors for user verification ("Is everything correct?"). Upon confirmation, calculates Lead Score (0–100), generates Reference ID (`#APX-XXXX`), and appends the structured profile to Google Sheets CRM.

### 3. Broker CRM Hub (Password: `broker123`)
- Secured broker portal fetching live leads exclusively via n8n `GET` webhook (`/api/leads`).
- Displays live pipeline metrics (Total Leads, Hot Leads &ge; 80 pts, Warm Leads).

---

## 🗄️ Database Architecture (Google Sheets)

Spreadsheet ID: `1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo`  
Active Tab: `Real_Estate_Qualified_Leads`

| Column | Header | Description |
| :---: | :--- | :--- |
| **A** | `Lead_ID` | Reference ID (e.g. `#APX-2547`) |
| **B** | `Timestamp` | Inbound qualification timestamp |
| **C** | `Full_Name` | Client full name |
| **D** | `Phone` | Direct phone / WhatsApp number |
| **E** | `Email` | Client email address |
| **F** | `Property_Interest` | Property type & target location |
| **G** | `Budget_Range` | Clean budget or asking price |
| **H** | `Financing_Status` | Verified proof of funds / clean title |
| **I** | `Purchase_Timeline` | Closing / listing timeline |
| **J** | `Buyer_Type` | Intent, purpose & scheduled appointment |
| **K** | `Lead_Score` | 0 to 100 calculated score |
| **L** | `Lead_Tier` | `HOT` 🔥, `WARM` ⚡, `COLD` ❄️ |
| **M** | `Recommended_Action` | Managing broker prescribed action |
| **N** | `Status` | `NEW`, `ASSIGNED`, `SHOWING SCHEDULED` |

---

## ⚡ Active n8n Workflow Endpoints

- **Workflow Name:** `Day 6 - Apex Realty Master Brain (Pro-Level Backend)`
- **Workflow ID:** `TNibBZ9eGODuEUhC`
- **Inbound Chat Webhook:** `POST https://n8n.srv1767318.hstgr.cloud/webhook/apex-buyer-chat`
- **CRM Leads Webhook:** `GET https://n8n.srv1767318.hstgr.cloud/webhook/apex-crm-leads`
- **Listings Webhook:** `GET https://n8n.srv1767318.hstgr.cloud/webhook/apex-listings`
- **Google Calendar Credential:** `AW7YkPBa2mAXEwWO`
- **Google Sheets Credential:** `AqyKDLuwANoDYrEw`

---

## 🚀 Running Locally

```bash
cd day-06-real-estate-buyer-qualification
node server.js
```

Open [`http://localhost:3006`](http://localhost:3006) in your browser.  
Broker CRM Password: `broker123`
