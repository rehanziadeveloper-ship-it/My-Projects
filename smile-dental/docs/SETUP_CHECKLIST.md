# Smile Dental Clinic — Handover Setup Checklist

> Follow these exact steps to take the system from development/mock mode to production.

---

## 1. Supabase Database Setup
1. Log in to your new Supabase Project dashboard.
2. Open the **SQL Editor**.
3. Copy and run the entire contents of `smile-dental/schema.sql`.
4. Copy and run the entire contents of `smile-dental/schema_changes.sql`.
5. Verify in Table Editor that the 11 tables (`clinic`, `doctor`, `services`, `working_hours`, `days_off`, `patients`, `appointments`, `chat_sessions`, `missed_calls`, `reviews`, `admins`) and 4 views exist.

---

## 2. Admin User Creation
1. In Supabase Dashboard, navigate to **Authentication** -> **Users**.
2. Click **Add User** -> **Create User**.
   - Email: `admin@smiledental.pk` (or doctor's personal email).
   - Password: Choose a strong password.
   - Confirm email: Toggle ON (Auto-confirm).
3. Copy the generated `User UID`.
4. In Supabase SQL Editor, run this command to grant admin rights:
```sql
INSERT INTO admins (user_id, email, full_name, role)
VALUES ('PASTE_USER_UID_HERE', 'admin@smiledental.pk', 'Dr. Zeeshan Ahmad', 'owner');
```

---

## 3. n8n Credentials Configuration
In your Hostinger n8n instance (`https://n8n.srv1767318.hstgr.cloud`):
1. Navigate to **Credentials** -> **New Credential**.
2. Select type: **Custom Auth**.
3. Set Credential Name exactly: `Smile Supabase Auth`
4. Add two headers:
   - Header 1: `apikey` = `<YOUR_SUPABASE_SERVICE_ROLE_KEY>`
   - Header 2: `Authorization` = `Bearer <YOUR_SUPABASE_SERVICE_ROLE_KEY>`
5. Save the credential.

---

## 4. n8n Workflow Activation
1. The workflow **"Smile Dental - Backend"** (ID: `P6fvVMS33Ou3ikML`) is already imported with the tag `smile-dental` in **INACTIVE** state.
2. Open workflow `P6fvVMS33Ou3ikML`.
3. In node `B1 Master Config Node`:
   - Set `SUPABASE_URL` to your actual Supabase project URL (`https://xyz.supabase.co`).
   - When ready for live WhatsApp dispatch, change `MOCK_MODE: true` to `MOCK_MODE: false`.
4. Toggle the workflow to **ACTIVE**.

---

## 5. Webhook Endpoints Reference
Once active, your live webhook URLs on Hostinger n8n are:
- **Slots Availability:** `GET https://n8n.srv1767318.hstgr.cloud/webhook/smile/slots`
- **Book Appointment:** `POST https://n8n.srv1767318.hstgr.cloud/webhook/smile/book`
- **View Appointment:** `GET https://n8n.srv1767318.hstgr.cloud/webhook/smile/appointment`
- **Cancel Appointment:** `POST https://n8n.srv1767318.hstgr.cloud/webhook/smile/appointment/cancel`
- **Reschedule Appointment:** `POST https://n8n.srv1767318.hstgr.cloud/webhook/smile/appointment/reschedule`
- **Web Chatbot:** `POST https://n8n.srv1767318.hstgr.cloud/webhook/smile/chat`
- **Meta WhatsApp Inbound:** `GET & POST https://n8n.srv1767318.hstgr.cloud/webhook/smile/whatsapp`
- **Admin Patient Notification:** `POST https://n8n.srv1767318.hstgr.cloud/webhook/smile/notify`

---

## 6. Meta WhatsApp Cloud API Setup
1. In Meta Developer Portal, select your WhatsApp App.
2. In Webhooks configuration:
   - Callback URL: `https://n8n.srv1767318.hstgr.cloud/webhook/smile/whatsapp`
   - Verify Token: Enter your secret verify token (e.g. `smile_dental_meta_token`).
   - Subscribe to field: `messages`.
3. Submit the 3 message templates in `docs/WHATSAPP_TEMPLATES.md` (`appointment_confirmation`, `appointment_reminder`, `missed_call_followup`).

---

## 7. Frontend Deployment (Vercel / Netlify)
1. Build command: `npm run build`
2. Output directory: `dist`
3. Environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key
   - `VITE_N8N_BASE_URL`: `https://n8n.srv1767318.hstgr.cloud`
   - `VITE_DEMO_CONTENT`: `false` (in production)
