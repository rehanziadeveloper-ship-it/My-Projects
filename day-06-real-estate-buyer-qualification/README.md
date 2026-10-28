# 🏛️ Apex Realty AI — Inbound Buyer Qualification & Lead Triage

> **Autonomous Real Estate Inbound Acquisition & Buyer Qualification System. Features hands-free spoken Voice AI & Chat screening, 4-vector purchasing power scoring (0–100), real-time Lead Tier classification (`HOT` 🔥, `WARM` ⚡, `COLD` ❄️), instant broker dispatch, and a password-protected Broker CRM synced with Google Sheets.**

[![Live Local Server](https://img.shields.io/badge/Port-3006-orange?style=for-the-badge&logo=node.js)](http://localhost:3006)
[![Google Sheets CRM](https://img.shields.io/badge/Google%20Sheets-Live%20CRM-success?style=for-the-badge&logo=googlesheets)](https://docs.google.com/spreadsheets/d/1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo)
[![n8n Workflow](https://img.shields.io/badge/n8n-Active%20Scoring%20Engine-red?style=for-the-badge&logo=n8n)](https://n8n.srv1767318.hstgr.cloud)

---

## 📌 Executive Summary

Top real estate agents spend 15–20 hours per week fielding inbound calls and messages from unqualified looky-loos. **Apex Realty AI** automates the entire front-end buyer screening pipeline:

1. **24/7 Inbound Screening Desk:** Ingests buyer inquiries on luxury property listings via interactive **Voice AI (Web Speech API)** or conversational text chat.
2. **4-Vector Weighted Scoring Matrix:**
   - **Financing Proof (40%):** All-Cash (40 pts) | Verified Lender Pre-Approval (35 pts) | Mortgage Broker in progress (20 pts) | Needs Financing (10 pts).
   - **Timeline (30%):** Immediate <30 days (30 pts) | 1–3 months (20 pts) | 3–6 months (10 pts) | Casual Browsing (5 pts).
   - **Budget Match (20%):** Realistic purchasing power matching luxury active listings ($1.2M - $6M+).
   - **Intent & Readiness (10%):** Primary Luxury Residence vs Relocation vs Vacation Home vs Investment.
3. **Automated Lead Triage:**
   - 🔥 **HOT (Score 80–100):** Immediate dispatch alert to managing broker for 15-minute VIP call & showing.
   - ⚡ **WARM (Score 50–79):** Queued for 24h follow-up, 3D Matterport dossier, and weekend tour.
   - ❄️ **NURTURE (Score <50):** Automatically routed to preferred lending partners for mortgage pre-qualification.
4. **Broker & Agent CRM Portal (Password: `broker123`):**
   - Live KPI tracking (Total Leads, Hot Leads, Warm Leads, Average Score).
   - Filterable triage table with one-click status updates (`NEW`, `ASSIGNED`, `SHOWING SCHEDULED`, `UNDER CONTRACT`, `CLOSED`).
   - Detailed Lead Scorecard modal for every buyer.

---

## 🗄️ Database Architecture (Google Sheets)

Spreadsheet ID: `1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo`

### 1. `Real_Estate_Qualified_Leads`
| Column | Header | Description |
| :---: | :--- | :--- |
| **A** | `Lead_ID` | Unique identifier (e.g. `LEAD-8801`) |
| **B** | `Timestamp` | Inbound qualification timestamp |
| **C** | `Full_Name` | Buyer name |
| **D** | `Phone` | Direct phone number |
| **E** | `Email` | Client email address |
| **F** | `Property_Interest`| Target property or market area |
| **G** | `Budget_Range` | Stated purchase budget |
| **H** | `Financing_Status`| Cash / Pre-Approved / Broker / Need Loan |
| **I** | `Purchase_Timeline`| Immediate / 1-3 mo / 3-6 mo / Browsing |
| **J** | `Buyer_Type` | Primary / Relocation / Vacation / Investment |
| **K** | `Lead_Score` | 0 to 100 calculated score |
| **L** | `Lead_Tier` | `HOT`, `WARM`, `COLD` |
| **M** | `Recommended_Action`| Prescribed broker next step |
| **N** | `Status` | `NEW`, `ASSIGNED`, `SHOWING SCHEDULED`, etc. |

### 2. `Real_Estate_Listings`
Contains active inventory: The Bel-Air Modern Estate ($4.25M), Tribeca Sky Penthouse ($3.1M), Austin Lakefront Contemporary ($1.85M), Miami Brickell Skyline ($1.25M), Aspen Pinecrest Alpine Retreat ($5.8M).

---

## ⚡ Active n8n Workflow

- **Workflow Name:** `Day 6 - Real Estate Inbound Buyer Qualification & Lead Triage`
- **Workflow ID:** `s2a48wQyD7IG4S5S`
- **Production Webhook:** `https://n8n.srv1767318.hstgr.cloud/webhook/real-estate-qualification`
- **Status:** 🟢 Active & Live

---

## 🚀 Running Locally

```bash
# Navigate to the project directory
cd day-06-real-estate-buyer-qualification

# Launch the server
node server.js
```
Open [`http://localhost:3006`](http://localhost:3006) in your browser.
Default Broker CRM password: `broker123`
