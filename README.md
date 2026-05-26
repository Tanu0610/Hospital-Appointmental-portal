# MediCare Hospital Appointment Portal Website
A complete, production-ready Hospital Appointment Portal Website built with a robust, modern full-stack architecture.

---

## 🚀 Key Features

### 👤 Multi-Role Identity Portal
- **Patients**: Create medical profiles, browse certified specialists, check real-time availability calendar hours, hold and schedule appointments, process payments, and print/download diagnostic recipes & billing receipts.
- **Doctors**: Manage consultation logs, confirm/reject bookings, configure active practice timing slots, and draft multi-line digital prescriptions with diagnostic advice.
- **Administrators**: Track strategic KPIs, review Recharts metrics (gross revenue, specialty distributions), approve new doctor specialties/registrations, and oversee patient directories with block/unblock toggles.

### 🛡️ Smart Double-Booking Prevention
- Dynamic slot checking queries both scheduled doctor shifts and active patient reservations to shield specialists from conflict bookings.

### 🔌 Dual-Engine Configuration (Out-of-the-Box Setup)
- Automatically checks for environment credentials. If `SUPABASE_URL` is omitted, the portal operates in high-performance **Local Persistent Mode** (reading and writing to `/server_db.json`), featuring persistent logging and preloaded test accounts.

---

## 🏢 Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, React Router DOM, Recharts, Lucide Icons, Context API
- **Backend**: Node.js, Express.js (supporting live server assets rendering & API routing)
- **Database & Auth**: Supabase Certified (with row-level security policy mappings)
- **Compiling / Bundling**: esbuild, tsx, typescript compiler

---

## 🗄️ Relational Database Schema (Supabase SQL)
The complete relational setup is stored inside `/supabase_schema.sql` at the root folder. Paste the content of this script directly in your Supabase SQL Editor. It constructs:
1. `users`: Master credential profiles.
2. `patients`: Demographic information (DOB, phones, blood types).
3. `doctors`: Bio text panels, hourly consulting shifts, rating, approvals.
4. `appointments`: Time-locked outpatient consultation logs.
5. `prescriptions`: Digital medication cards of completed visits.
6. `payments`: Invoice details linked to bookings.
7. `notifications`: Alert center tracking status shifts.

---

## 🔑 Test-Drive Presets (Interactive Demo Mode)
For peerless review of the outpatient portal, click any of the preloaded **"Test-Drive Presets"** on the Auth page to auto-fill these authentic simulated accounts:

| Role | Test Username | Test Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Patient** | `patient@medicare.com` | `patient123` | Booking specialists, rescheduling, printing receipts, viewed prescriptions |
| **Doctor** | `doctor@medicare.com` | `doctor123` | Approving appointments, writing prescriptions, setting shifts |
| **Admin** | `admin@medicare.com` | `admin123` | KPI trackers, Recharts graphics, doctor vetting, blocking users |

---

## ⚙️ Development Installation Steps

To spin up a local copy in your operating environment:

### 1. Close repository and install matching packages:
```bash
npm install
```

### 2. Configure Environment variables:
Rename `.env.example` to `.env` and fill in Supabase keys if deploying live:
```env
SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"
SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 3. Spin up full-stack development servers:
```bash
npm run dev
```
The server will boot and serve both backend APIs and the frontend SPA under port `3000`.

### 4. Build for Production:
```bash
npm run build
```
This script bundles the React files in `dist/` and compiles TypeScript Express to output a clean, standalone, high-performance `dist/server.cjs` file.
