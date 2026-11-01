# Smile Dental Clinic — One-Page Operating Guide

---

## 1. How a Patient Books an Appointment

1. **Website Booking (3 Simple Steps):**
   - **Step 1:** Patient selects treatment (e.g. Scaling, Root Canal) showing duration & PKR fee.
   - **Step 2:** Patient selects a date and clicks an available time pill generated directly by the database (Pakistan Time, Friday prayer break excluded).
   - **Step 3:** Patient inputs Full Name and mobile number (`0300-1234567`), then clicks **Confirm Appointment**.
   - **Confirmation:** Instant success screen with `.ics` calendar download and notice that a WhatsApp confirmation has been dispatched.
2. **Chatbot Booking (Web & WhatsApp):**
   - Patient clicks floating chatbot or messages on WhatsApp in English or Roman Urdu (*"Mujhe kal appointment chahiye"*).
   - Bot guides patient through interactive quick-reply pills, asks for name/time, and confirms booking.
3. **Patient Self-Service (No Login Needed):**
   - Confirmation message includes a unique link: `/appointment/:token`.
   - Patient can view treatment details, cancel, or reschedule anytime.

---

## 2. What Clinic Staff Sees in Admin Portal (`/admin`)

- **Today's Tab:**
  - Realtime queue of today's patients in chronological order.
  - Highlighted **Next Patient in Operatory** banner.
  - Big action buttons: **Confirm**, **Completed**, **No-Show**, and **Cancel**.
  - Direct 1-click **WhatsApp** button for each patient.
  - Realtime toast notification as soon as any patient books online.
- **Calendar Tab:**
  - Day and week view with quick walk-in appointment entry.
- **Patients Directory:**
  - Fast search by name or phone, viewing past visit history and clinical notes.
- **Analytics:**
  - Automated weekly counts, no-show rate, top treatments, and line chart trends.
- **Settings:**
  - Edit clinic address, phone, WhatsApp number, working hours, and approve patient reviews.

---

## 3. What is REAL vs What is MOCK

| Feature | Status | Explanation |
| :--- | :--- | :--- |
| Frontend Website & Portal | **REAL** | Built with Vite + React + Tailwind + Three.js; fully responsive. |
| Single Doctor Overlap Prevention | **REAL** | PostgreSQL exclusion constraint & RPC logic guarantees zero double-booking. |
| n8n Workflow Backend | **REAL** | Imported to Hostinger n8n (`P6fvVMS33Ou3ikML`, 40 nodes). |
| Web Chatbot | **REAL** | Interactive bilingual state machine running in client & backend. |
| Meta WhatsApp Cloud API | **MOCK (Ready)** | Default `MOCK_MODE=true` simulates WhatsApp payloads cleanly until Meta token is linked. |
| Automated Reminders | **REAL (Ready)** | 30-min scheduled cron triggers within 9 AM – 9 PM Pakistan window. |
| Missed-Call & Google Calendar | **DISABLED** | Nodes present in workflow, ready to enable in future. |

---

## 4. What You Must Do Before Going Live

1. Run `schema.sql` and `schema_changes.sql` in your Supabase SQL Editor.
2. Create admin user in Supabase Authentication and insert their UID into `admins`.
3. Create `Smile Supabase Auth` credential in n8n (Custom Auth with service_role key).
4. Update `B1 Master Config Node` in n8n workflow with your Supabase URL, set `MOCK_MODE: false`, and toggle workflow to **ACTIVE**.
5. Connect Meta WhatsApp webhook and submit the 3 templates in `docs/WHATSAPP_TEMPLATES.md`.
