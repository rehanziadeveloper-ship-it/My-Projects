# Smile Dental Clinic — Production System

> Complete, simple digital operating system for **ONE dental clinic with ONE doctor in Pakistan**.  
> Features: Public Website, Patient Portal, Bilingual Web Chatbot, WhatsApp Chatbot Engine, Admin Portal with Analytics, and ONE n8n Master Workflow Backend with PostgreSQL (Supabase).

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ (verified on Node v22.14.0)
- npm 9+

### 2. Installation
```bash
cd smile-dental
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate your environment variables:
- `VITE_SUPABASE_URL`: Your Supabase project URL (`https://your-project.supabase.co`)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon public API key
- `VITE_N8N_BASE_URL`: `https://n8n.srv1767318.hstgr.cloud`
- `VITE_DEMO_CONTENT`: `true` (enables fallback preview content when database is fresh)

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Run Live Verification Tests
```bash
npm test
```
Executes all 13 comprehensive end-to-end and business logic tests.

---

## 📦 Production Build & Deployment

### Build Command
```bash
npm run build
```
Creates an optimized, minified production distribution inside `dist/`.

### Deployment to Netlify or Vercel
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **SPA Rewrite Rule:** For Netlify, redirect `/*` to `/index.html 200`. For Vercel, use standard `vercel.json` rewrites.

---

## 🏛️ System Architecture

1. **Database Layer (PostgreSQL / Supabase):**
   - Source of truth: `schema.sql` and `schema_changes.sql`.
   - Business rules executed in Postgres: `get_available_slots()`, `book_appointment()`, `reschedule_appointment()`, `normalize_pk_phone()`.
   - Hard exclusion constraint (`EXCLUDE USING gist`) prevents any double-booking for the single doctor.
2. **Backend Engine (Hostinger n8n):**
   - Single workflow: **"Smile Dental - Backend"** (ID: `P6fvVMS33Ou3ikML`, Tag: `smile-dental`).
   - 40 numbered nodes across 11 visual sections with zero sub-workflows.
3. **Frontend & Admin Portal:**
   - React + Vite + Tailwind CSS + Three.js / React Three Fiber + Recharts.
   - Routes:
     - `/`: Public website & 3-step booking flow
     - `/appointment/:token`: Patient self-service without login
     - `/insurance`: Dental insurance guide in Pakistan
     - `/privacy`: Patient data minimization policy
     - `/admin`: Clinic staff portal (Today queue, Calendar, Patients, Analytics, Settings)

---

## 📚 Documentation Index
- `docs/SPEC.md`: Full project specification and engineering constraints
- `docs/SETUP_CHECKLIST.md`: Manual steps for Supabase, n8n, and Meta setup
- `docs/SIMPLE_GUIDE.md`: One-page staff and patient operating guide
- `docs/WHATSAPP_TEMPLATES.md`: Exact English & Roman Urdu Meta utility templates
- `docs/STATUS.md`: Feature-by-feature REAL vs MOCK transparent status matrix
- `docs/DECISIONS.md`: Key architectural decisions
- `docs/PROGRESS.md`: Engineering build checklist
