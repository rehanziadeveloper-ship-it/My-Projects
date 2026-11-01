PROJECT: SMILE DENTAL CLINIC - a complete, SIMPLE system for ONE dental clinic with ONE doctor in Pakistan.
It has: a public website (which is also the patient portal), a web chatbot, a WhatsApp chatbot, an admin portal with analytics, and ONE n8n workflow as the whole backend, with Supabase (Postgres) as the only database.

======================================================
0. HOW TO WORK
======================================================
- You are a senior full-stack engineer and designer. Build everything below in ONE pass. Work in the order of section 18 yourself, verify as you go, and keep a checklist in docs/PROGRESS.md. If you run low on budget, stop at a clean point, update PROGRESS.md and tell me exactly what remains.
- Keep everything SIMPLE and easy to understand. Do NOT add features that are not listed. There must be NO payments/Stripe, NO insurance scanner, NO ROI dashboard, NO waitlist, NO video consultation, NO branches, NO blog.
- Do not ask questions unless truly blocked. Make simple decisions and write each in 1-2 lines in docs/DECISIONS.md.
- Never claim something works unless you tested it against the REAL n8n and the REAL Supabase. Do NOT build a local fake server to make tests pass. Keep docs/STATUS.md honest: for every feature say REAL or MOCK.
- Save this whole prompt as docs/SPEC.md.

======================================================
1. SAFETY RULES (mandatory)
======================================================
- Work ONLY inside a new folder: smile-dental/. Do NOT touch, edit, deactivate or delete any other project, any other Supabase project (including "Clinic Bot"), or ANY existing n8n workflow. Only workflows tagged "smile-dental" are yours.
- Use the NEW Supabase project I created. I run SQL myself in the Supabase SQL Editor: never run SQL against my database yourself. smile-dental/schema.sql is the source of truth and must not be edited. If you need a change, write smile-dental/schema_changes.sql and tell me to run it.
- Secrets: n8n credentials only. Never put the Supabase service_role key, WhatsApp token or LLM key in any file, in the frontend, in logs, or in the workflow JSON. The frontend may only use the Supabase anon key. This n8n host blocks $env access inside nodes, so do NOT use $env; keep non-secret settings in one "Config" node.
- Import the workflow into n8n INACTIVE with the tag "smile-dental". Activate only after I confirm credentials are created.
- Delete any test data you create when the tests finish (use names starting with "TEST ").

======================================================
2. FACTS
======================================================
Clinic name: Smile Dental Clinic. One doctor. Pakistan. Time zone Asia/Karachi (no daylight saving). Currency PKR. Phone numbers are Pakistani (+92). Everything about the clinic (phone, WhatsApp number, address, map, hours, doctor, services) comes from the database and is edited in the admin portal; do not hardcode it. Placeholders are fine but must be clearly marked and easy to replace. Never invent doctor credentials, years of experience, statistics or reviews.

======================================================
3. DATABASE (already designed in schema.sql - read it fully first)
======================================================
Tables: clinic (1 row), doctor (1 row), services (name_en, name_roman, descriptions, duration_min, optional price_from_pkr), working_hours (per weekday, optional break such as Friday prayer), days_off (Eid, leave), patients (full_name, phone in +923XXXXXXXXX format, language en|roman_ur, notes), appointments (patient, service, starts_at/ends_at, status booked|confirmed|completed|cancelled|no_show, source website|whatsapp|call|admin, reason, is_emergency, manage_token, reminder_sent_at), chat_sessions (channel, contact_key, language, step, data jsonb), missed_calls, reviews (published only after admin approval), admins. Views for analytics: v_stats_daily, v_new_patients_daily, v_missed_calls_daily, v_top_services.
Business rules live in Postgres, NOT in n8n: get_available_slots(p_day, p_service_id) (public, read-only), book_appointment(...) (service_role only; errors: invalid_phone, invalid_name, unknown_service, slot_not_available, slot_taken) and normalize_pk_phone(). One doctor means the database itself refuses overlapping appointments. Never re-implement double-booking checks in n8n or the frontend.
Add to schema_changes.sql: a function reschedule_appointment(p_token text, p_new_start timestamptz) that, in ONE transaction, cancels the old appointment and books the new time with the same rules (if the new booking fails, the cancel is rolled back). Also add `google_event_id text` to appointments (only used by the optional Google Calendar section).

======================================================
4. LANGUAGES (web bot, WhatsApp bot, later the call agent)
======================================================
- English and Roman Urdu (Urdu written in Latin letters). Examples that must work: "Mujhe kal appointment chahiye", "dant mein bohat dard hai", "timing kya hai", "kal shaam ko", "parso subah", "agle hafte", "cancel karna hai", "kitne paise lagenge". Understand weekday/time words such as aaj, kal, parso, subah, dopahar, shaam, raat, Peer, Mangal, Budh, Jumerat, Jumma, Hafta, Itwaar.
- Reply in the language of the patient's LATEST message. Default English. If a message is in Urdu script, reply in Roman Urdu. Save patients.language and chat_sessions.language.
- All fixed bot texts live in ONE bilingual dictionary (en + roman_ur) in one place so I can edit wording easily. Show dates/times in Pakistan time, 12-hour format, e.g. "Tuesday, 4 Nov, 5:30 PM".

======================================================
5. PUBLIC WEBSITE (route /, it is also the patient portal; no patient login)
======================================================
Stack: React + Vite + Tailwind, React Router, Framer Motion (subtle), supabase-js (anon key: public reads + admin login + realtime only), react-hook-form + zod, recharts, @react-three/fiber + drei. Mobile-first (most patients use phones). English interface. Env: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_N8N_BASE_URL, VITE_DEMO_CONTENT.
Design (based on my reference screenshots): calm cream background, deep green rounded-full buttons, light-green accents, dark-green footer and one dark-green section. Sans font Outfit plus an italic serif (Cormorant Garamond) for key words in headlines, e.g. "A healthier smile. A more *confident you.*" Rounded cards, soft shadows, lots of white space. Tokens: cream #F6F8F3, text #123524, primary #1B6B3A, light green #CFEBD6, dark #10201A. All text must pass WCAG AA contrast.
Brand: logo + "Smile Dental Clinic". REMOVE everywhere (these were crossed out in my reference): the word "Center", Branches (menu, text, footer), Blog, Virtual Consultation, Book Video Consultation, the "Islamabad" tag line, "5 branches". There is no video consultation feature.
- Sticky header: logo, Home, About Us, Services, Why Choose Us, Our Doctor, Reviews, Dental Insurance (a simple static info page with placeholder text), Contact Us, and a green "Book Appointment" button. Mobile: hamburger, with the button always visible.
- Hero: headline, two short lines, buttons "Book Appointment" and "Chat on WhatsApp", a slowly rotating 3D tooth on the right (react-three-fiber; load public/models/tooth.glb if it exists, otherwise build a stylized tooth procedurally; document in docs/ that any downloaded model must have a license allowing commercial use), plus two small floating cards ("Modern dental technology", "Personalised treatment plans"). Respect prefers-reduced-motion (static image).
- Floating buttons bottom-right: Chat, WhatsApp, Call.
- Sections in order: Hero; "Find your care" services slider (numbered cards 01, 02... with image, name, one line, arrow; data from the services table; clicking one opens booking with that service pre-selected); About; Why Choose Us (4-6 points, NO invented statistics); Our Doctor (from the doctor table); Results (before/after slider, clearly marked SAMPLE in code and docs until real photos with patient consent exist); Reviews (only is_published reviews; hide the section if none; with VITE_DEMO_CONTENT=true show 3 sample reviews labelled "Sample"); Contact (phone, WhatsApp, address, map, working hours, days off); Footer (services list, quick links, Book Now, "Leave a Google Review" from clinic.google_review_url, WhatsApp, privacy policy page). Add basic SEO (title, meta, Dentist JSON-LD from DB values).
- Skeleton loading everywhere, never spinners. No layout shift.

======================================================
6. BOOKING FLOW (website) - 3 steps, one thing per screen
======================================================
1. Choose service. 2. Choose date and time: calendar + time pills from supabase.rpc('get_available_slots'), closed days disabled, times in Pakistan time. 3. Details: name, mobile number (masked 03XX-XXXXXXX; the DB normalizes it), optional short note, consent line with link to the privacy page, hidden honeypot field.
Submit to POST {N8N}/webhook/smile/book. Success screen: date/time, address, "Add to calendar" (.ics), note that a WhatsApp confirmation is sent. If the slot was just taken, show the next free times. No payment step.
Patient self-service WITHOUT login: page /appointment/:token (manage_token) to view, cancel or reschedule. The link is sent in the confirmation message.

======================================================
7. WEB CHATBOT (widget on every public page)
======================================================
Floating launcher opens a chat panel (full-screen sheet on mobile). ONE question per message, quick-reply pill buttons for standard answers, typing indicator, session id kept in sessionStorage, "Start over" button, language switch pill (English / Roman Urdu) in addition to auto-detection. Phone input is masked. It calls POST {N8N}/webhook/smile/chat {session_id, message, button_id}. Flow (see section 9 for logic).

======================================================
8. WHATSAPP CHATBOT (Meta WhatsApp Cloud API)
======================================================
- Same brain and same booking flow as the web chatbot. Patients can book, ask timings/services/address/prices, cancel, reschedule, and reach the clinic.
- Use interactive messages: reply buttons (max 3) and list messages (max 10 rows). Show time slots as a list with a "More times / Aur waqt" row.
- The patient's phone number is already known: do not ask for it. If the patient exists, greet by name; ask for the name only for new patients.
- Respect the 24-hour rule: free-form messages only within 24h of the patient's last message; otherwise approved TEMPLATES. Define templates appointment_confirmation, appointment_reminder, missed_call_followup. Write their exact English + Roman Urdu text in docs/WHATSAPP_TEMPLATES.md so I can submit them to Meta.
- MOCK_MODE (set in the Config node, default true): in mock mode nothing is sent to Meta; the workflow returns/logs what it WOULD send (without phone numbers or message text in logs).

======================================================
9. CHAT BRAIN (inside the same workflow, shared by web and WhatsApp)
======================================================
- A simple step-by-step state machine in Code nodes. State is stored in chat_sessions (one key per answer in data). Steps: start -> intent (Book appointment / Services & prices / Timings & location / Emergency / Cancel or reschedule / Talk to the clinic) -> service -> date -> time -> name (new patients only) -> phone (web only) -> confirm (Yes/No) -> done.
- An LLM (provider and key come from an n8n credential; make the provider easy to swap) is used ONLY to: (a) detect language, (b) turn free text such as "kal shaam ko" into a date/time range or an intent, (c) answer simple FAQs from clinic data. It NEVER books by itself. The booking is always book_appointment via the workflow. If the LLM is unavailable or in mock mode, the buttons-only flow still works fully.
- Emergency words (pain, severe pain, swelling, bleeding, broken/knocked-out tooth, dard, bohat dard, soojan, khoon, tuta hua dant...) show the clinic call button first and offer the earliest free slot (is_emergency=true).
- Validate every answer; re-ask the same question with a friendly hint. If the chosen slot is taken, show the next free slots.
- After booking: send a confirmation with the day, time, address and the manage link. Cancel/reschedule via chat uses the patient's phone to find their upcoming appointment.

======================================================
10. THE ONE N8N WORKFLOW (the whole backend)
======================================================
Name: "Smile Dental - Backend". One workflow, many entry points on one canvas, organized in labelled sections using Sticky Notes and numbered node names (A1, A2, B1...). No sub-workflows, no Execute Workflow nodes.
Layout:
A. ENTRY POINTS (each followed by a tiny Set node that writes route=<name>):
   - GET  /webhook/smile/slots?date=YYYY-MM-DD&service_id=       (also used later by the call agent)
   - POST /webhook/smile/book            {name, phone, service_id, starts_at, reason, language, honeypot}
   - GET  /webhook/smile/appointment?token=
   - POST /webhook/smile/appointment/cancel       {token}
   - POST /webhook/smile/appointment/reschedule   {token, starts_at}
   - POST /webhook/smile/chat            {session_id, message, button_id}
   - GET + POST /webhook/smile/whatsapp  (Meta verification challenge + incoming messages; answer 200 immediately, then continue processing)
   - POST /webhook/smile/notify          (admin only: tell the patient their appointment was cancelled/rescheduled)
   - Schedule Trigger: every 30 minutes (reminders)
B. CONFIG node (all triggers go through it): SUPABASE_URL, FRONTEND_ORIGIN, MOCK_MODE=true, CLINIC_SLUG, LLM_MODE. Then a Switch on route sends the run to its section.
C. BOOKING ENGINE: validate input, honeypot, abuse limits (max 3 booking requests per phone per hour and max 3 future active appointments per phone, counted in the database), call book_appointment, then send the confirmation (section G).
D. APPOINTMENT SELF-SERVICE: view / cancel / reschedule by manage_token (reschedule = reschedule_appointment function).
E. CHAT BRAIN (section 9) for both /chat and /whatsapp.
F. WHATSAPP: parse incoming messages (text, button replies, list replies), call the brain, build outgoing interactive messages, send (MOCK_MODE aware).
G. SEND-MESSAGE tail: one shared group of nodes used by confirmations, reminders and bot replies.
H. REMINDERS (schedule): appointments with status booked/confirmed, reminder_sent_at null, starting within the next 24 hours, only between 09:00 and 21:00 Pakistan time, skipping appointments created less than 6 hours ago. Send the reminder with Confirm / Cancel / Reschedule buttons, set reminder_sent_at, never send twice, replies update the status (Confirm -> confirmed; Cancel -> cancelled). This job also keeps the Supabase project active.
I. ADMIN NOTIFY: verify the Bearer token by calling Supabase /auth/v1/user, check the user is in the admins table, then message the patient.
J. LATER (nodes present but DISABLED): POST /webhook/smile/missed-call {phone} -> insert into missed_calls -> send template missed_call_followup. English: "We missed your call at Smile Dental Clinic. Would you like to book an appointment?" with a "Book now" button; also in Roman Urdu: "Humein aap ki call miss ho gayi. Kya aap appointment book karna chahte hain?" When the patient replies, the normal WhatsApp flow continues, and the appointment is linked to the missed call. The future AI call agent will use the same /slots and /book endpoints; do not build the agent now.
K. OPTIONAL, DISABLED by default: Google Calendar mirror (create an event when an appointment is booked, delete it when cancelled, store google_event_id). The database stays the source of truth for availability.
Rules for the workflow:
- Talk to Supabase with HTTP Request nodes (REST and /rpc) using ONE n8n credential of type Custom Auth that sends both headers: apikey and Authorization: Bearer <service_role>. Build request bodies in Code nodes and send them as JSON (avoid string-template bodies).
- Every webhook ends with one Respond to Webhook node using the same envelope: {ok:true,data} or {ok:false,error:{code,message}} with the right HTTP status (400 validation, 404 not found, 409 slot_taken/slot_not_available, 429 too many requests, 401/403 auth). Map DB errors to friendly messages in both languages.
- CORS: allow only the frontend origin. n8n has no built-in rate limiting: apply the abuse limits above, and document that Cloudflare in front is recommended.
- Privacy: set the workflow to NOT save successful executions; never write names, phones or message text into logs or error messages.
- Export the final workflow as n8n-workflow/smile-backend.json (no secrets, credential placeholders by name), AND import it into my n8n via the n8n connection (inactive, tag smile-dental). Show me the new workflow ID and the list of webhook URLs.

======================================================
11. ADMIN PORTAL (/admin) - Supabase Auth email + password, only users in the admins table
======================================================
Collapsible left menu (drawer on mobile). The admin reads/writes the database directly through Row Level Security (no n8n needed), except "notify patient" which calls /smile/notify with the admin session token.
1. Today: today's appointments in time order with big buttons Confirm / Completed / No-show / Cancel, patient phone with a "WhatsApp" link, an emergency badge, a highlighted "Next patient", live updates (Supabase realtime) and a toast when a new booking arrives. When the admin cancels, offer "Notify patient on WhatsApp".
2. Calendar: day and week view; click a free slot to add a manual booking (phone/walk-in, source "admin"); mark days off with a reason; the same no-double-booking rule applies (show the clear error if the database refuses).
3. Patients: search by name/phone, visit history, short notes.
4. Analytics: cards (appointments this week/month, new patients, no-show rate, bookings by source: website / WhatsApp / call / admin, missed calls recovered, top services) and a line chart of appointments per day, with a 7/30/90-day range. Read from the v_ views.
5. Settings: clinic info (phone, WhatsApp, address, map, Google review link), doctor profile, services (add/edit/hide, duration, optional PKR price), working hours and breaks, days off, reviews (approve/hide).
Color-coded status badges (icon + text, not color alone). Light theme with an optional dark-mode toggle. Fully usable on a phone. Skeleton loading, friendly empty states, no blocking alert() dialogs.

======================================================
12. DATA AND PRIVACY
======================================================
Store only what is needed: patient name, phone, optional email, language, short notes, appointments, and the reason in the patient's words. No medical forms, no insurance cards, no payments. Privacy policy page and a consent line on forms. Never log patient data in the browser console. Browsers can only read public data (services, hours, days off, doctor, published reviews, free slots); all patient writes go through n8n. Document in docs/ that real use needs a Supabase plan that does not pause, regular backups, and HTTPS hosting.

======================================================
13. TESTS (against the REAL n8n workflow and REAL Supabase)
======================================================
Write tests/live.test.js and run it. Cover: two parallel bookings of the same slot (one succeeds, the other returns slot_taken coming from Postgres); a slot outside working hours is rejected; a days_off date returns no slots; the Friday break is respected; "0300-1234567" becomes +923001234567 and "123" is rejected; honeypot and per-phone abuse limit work; a full English chat books an appointment; a full Roman Urdu chat books an appointment and replies in Roman Urdu; an emergency message shows the call option first; cancel by token frees the slot; reschedule is atomic (a failed reschedule keeps the old appointment); a WhatsApp webhook payload in MOCK_MODE produces the right reply; the reminder job sends once only; anonymous users cannot read patients or appointments; the admin can read them; the Meta GET verification returns the challenge. Do NOT weaken a test to make it pass. Report every failure honestly and fix the root cause. Remove test data at the end.

======================================================
14. DOCS TO DELIVER (short, plain English)
======================================================
README.md (how to run, env variables, how to deploy the frontend), docs/STATUS.md (REAL vs MOCK per feature), docs/SIMPLE_GUIDE.md (one page: how a patient books, what staff sees, what is mock, what I must do before going live), docs/WHATSAPP_TEMPLATES.md, docs/DECISIONS.md, docs/PROGRESS.md, .env.example, and docs/SETUP_CHECKLIST.md listing exactly what I must do by hand: run schema.sql and schema_changes.sql, create the admin user and insert it into admins, create the n8n credentials (exact names and header names), import/activate the workflow, set up Meta WhatsApp (verify token, phone number ID, templates), and which parts are still mock.

======================================================
15. DEFINITION OF DONE
======================================================
- A patient can book on the website, in the web chat (English or Roman Urdu) and on WhatsApp (mock mode until Meta is connected), and the appointment appears in the admin Today and Calendar views.
- The same time can never be booked twice by any channel.
- Cancel/reschedule by link works. Reminders are ready. Missed-call and Google Calendar sections exist but are disabled.
- The website looks like my reference, without the removed items, with the rotating tooth.
- npm run build passes with no errors, and the live tests pass against the real n8n and Supabase.

======================================================
16. FINAL REPORT (15 lines maximum)
======================================================
What is built, what is REAL and what is MOCK, the workflow ID and webhook URLs, what I must do by hand, and anything not finished.

======================================================
17. REMINDER
======================================================
Simple beats clever. One workflow, one clear database, no extra features.

======================================================
18. BUILD ORDER (do it yourself, in this order)
======================================================
Read schema.sql -> write schema_changes.sql -> frontend setup, design tokens, layout, routing -> public website -> booking flow -> n8n workflow sections A-D and G -> chat brain and web chatbot -> WhatsApp and reminders -> admin portal -> tests -> docs -> final report.
