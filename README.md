<<<<<<< HEAD
# TeraSync

A modern SaaS platform for freelancers, agencies, and small businesses to create and manage **Invoices** and **Contracts** — with QR-code verified public invoice links.

## Running locally (current mode: no backend needed)

This build runs **entirely in your browser using localStorage** — no Firebase project, no `.env` file, no signup required. It's meant for local testing/demo of the full workflow before wiring up a real backend.
=======
# Meridian — Personal Productivity OS

A premium, single-user productivity workspace: tasks, projects, calendar,
Pomodoro, notes, journal, brainstorming, habits, goals, a personal media
library, bookmarks, files, developer utilities, and analytics — all in one
calm, glassmorphic interface inspired by Linear, Notion, Arc, and Raycast.

## Stack

- **React 19** + **Vite** — app shell and build tooling
- **Tailwind CSS v4** — design system (see `src/index.css` for tokens)
- **React Router** (hash routing, for zero-config GitHub Pages hosting)
- **Zustand** — UI/local state (theme, auth, Pomodoro timer, sidebar)
- **TanStack Query** — data fetching/caching layer for every domain
- **Firebase** (Auth, Firestore, Storage) — optional cloud sync
- **Recharts** — dashboard and analytics charts
- **marked** — Markdown rendering for Notes

## Local mode (works immediately, no setup)

By default the app runs entirely on `localStorage` and signs you in as a
local guest profile. Every feature — tasks, projects, notes, habits, the
whole app — works fully offline with rich sample data pre-loaded, so you can
try it immediately:
>>>>>>> b4b2ee123dad43c2655a52eab73876263db4f19f

```bash
npm install
npm run dev
```

<<<<<<< HEAD
Open `http://localhost:5173`, register an account, and everything (auth, clients, invoices, contracts, business settings, logo) is stored in your browser's localStorage under the `invoiceflow:` prefix.

**Limitations of local mode** (by design, since there's no server):
- Data lives only in your current browser. Clearing site data / using another browser / incognito wipes it.
- Data is not shared between devices or users — there's no real backend.
- Passwords are stored in plain text locally. Fine for local testing, **never** for production.
- Logo uploads are stored as base64 data URLs (works, but bulky — a real Storage bucket is better long-term).
- The public invoice page (`/invoice/[publicId]`) only works in the same browser where the invoice was created, since the data isn't actually hosted anywhere.

## Migrating to Firebase (for real deployment)

The whole app was built with a swappable data layer so this is a drop-in replacement, not a rewrite:

1. `src/local/db.js` and `src/local/auth.js` hold the local implementation. `src/services/*.js` (clientService, invoiceService, contractService, businessService, storageService) call into them.
2. To go back to Firebase:
   - Re-add the `firebase` package: `npm install firebase`
   - Recreate `src/firebase/config.js` initializing `initializeApp`, `getAuth`, `getFirestore`, `getStorage` from `.env` values (Project Settings → General → Your apps in the Firebase console)
   - Rewrite the five `services/*.js` files to call Firestore/Storage instead of `local/db.js` — the exported function names and signatures (`listClients(userId)`, `createInvoice(userId, data)`, etc.) are the same, so no page or component needs to change.
   - Rewrite `AuthContext.jsx` to use `onAuthStateChanged`, `createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut` from `firebase/auth` instead of `local/auth.js`.
   - Deploy `firestore.rules` (already included in this repo) so each user can only read/write their own data. Also add Storage rules restricting `logos/{userId}/*` uploads to that user.

## Tech Stack

- React + Vite
- Tailwind CSS
- React Router
- jsPDF + jspdf-autotable (PDF generation)
- qrcode.react / qrcode (QR codes)
- Recharts (dashboard chart)
- (Optional, for production) Firebase Authentication, Firestore, Storage

## Folder Structure

```
src/
  local/            # Local-mode data layer (localStorage) — swap for Firebase later
  contexts/          # AuthContext (global auth state)
  services/          # Data access (clients, invoices, contracts, business) — swappable backend
  utils/             # Formatting, calculations, PDF generation, contract templates
  components/
    ui/               # Reusable primitives (Button, Input, Modal, Badge, ...)
    layout/           # Sidebar, Topbar, DashboardLayout
    dashboard/        # Dashboard-specific widgets
    invoices/         # Invoice form, preview, items table, QR block
    clients/          # Client form + table
    contracts/        # Contract templates, form, preview
    auth/             # ProtectedRoute
  pages/
    public/           # Landing, Login, Register, PublicInvoice (QR verification)
    dashboard/        # Overview, Invoices, Clients, Contracts, Settings, Profile
  router/             # AppRouter (all route definitions)
```

## Data Model

```
users        -> { uid, name, email, business }  (local: auth_users + userdata collections)
clients      -> { id, userId, name, company, email, phone, address, createdAt }
invoices     -> { id, userId, publicId, invoiceNumber, businessInfo, clientInfo,
                   items[], subtotal, discount, tax, total, status,
                   issueDate, dueDate, notes, terms, paymentInfo, createdAt }
contracts    -> { id, userId, title, clientId, clientName, template, content, status, createdAt }
```

## Core Workflow

Client → Create Invoice → Unique Public ID generated → QR Code generated →
Download/Print/Share PDF → Client scans QR → Verifies invoice on `/invoice/[publicId]` → Owner updates payment status.

## Notes

- All data access is scoped by `userId` in every `services/*.js` function — this pattern carries over directly to Firestore security rules when you migrate.
- This is a functional starting point, not a finished production product — review security before going live, especially once you're back on Firebase (rules, rate limiting, real payment status webhooks).
=======
## Connecting real Firebase (optional)

To sync data to the cloud and enable real authentication:

1. Create a project at https://console.firebase.google.com
2. Enable **Authentication** (Email/Password and/or Google), **Firestore**,
   and **Storage**.
3. Copy `.env.example` to `.env` and fill in your project's web app config.
4. Restart the dev server. The app automatically detects the config and
   switches from local mode to Firebase — no code changes needed. Data is
   scoped per-user under `users/{uid}/{collection}` in Firestore.

## Scripts

```bash
npm run dev       # start local dev server
npm run build     # production build to dist/
npm run preview   # preview the production build locally
npm run deploy    # build and publish dist/ to the gh-pages branch
```

## Deploying to GitHub Pages

1. Push this project to a GitHub repository.
2. In `package.json`, no `homepage` field is required since the app uses
   relative asset paths (`base: './'`) and hash-based routing.
3. Run:
   ```bash
   npm run deploy
   ```
4. In your repo settings, set GitHub Pages to serve from the `gh-pages`
   branch. Your app will be live at `https://<user>.github.io/<repo>/`.

## Project structure

```
src/
  components/
    ui/          Design-system primitives (Button, Card, Modal, etc.)
    layout/      Sidebar, Topbar, mobile nav, aurora background
    command/     ⌘K global command palette / search
    charts/      Recharts wrappers used on Dashboard & Analytics
    auth/        ProtectedRoute
  hooks/
    useCollection.js   Generic TanStack Query + CRUD hook used by every page
  lib/
    firebase.js        Firebase bootstrap (no-op until configured)
    dataService.js     Unified data layer — local storage or Firestore
    localData.js        Local storage implementation
    firestoreData.js     Firestore implementation
    seed.js            Demo data
    stats.js           Streaks, trends, and chart data helpers
    utils.js           Small shared helpers
  store/         Zustand stores (theme, auth, UI, pomodoro)
  pages/         One folder per feature area
  routes/        Router configuration
```

## Design system

Tokens live in `src/index.css` under the `@theme` block: a Space Grotesk +
Inter + JetBrains Mono type system, an indigo primary with teal/amber/rose
accents, rounded-2xl surfaces, and a `.glass` utility for frosted panels. The
signature ambient "aurora" background (`AuroraField.jsx`) is a set of slowly
drifting blurred gradient blobs behind the interface — the one deliberately
decorative flourish tying the whole UI together. Accent color and light/dark
theme are both user-configurable from Settings and persist across sessions.

## Notes on scope

This is a fully functional, single-user app built for personal use. A few
intentionally lightweight choices given that scope:
- The Files page stores metadata locally and uploads real bytes to Firebase
  Storage only when Firebase is configured.
- Rich text in Notes is Markdown (via `marked`), not a WYSIWYG editor.
- Delete confirmations use the browser's native `confirm()` dialog.
- Notifications (event reminders, task-due digest, evening habit nudges) are
  generated by an in-app scheduler that checks every 30s while a tab is
  open — there's no service worker, so nothing fires while the app is fully
  closed. Browser system notifications require granting permission from
  Settings → Notifikasi.
- Library covers uploaded in local mode are stored as inline base64 inside
  that record (fine for personal use; connect Firebase Storage for real
  file uploads and smaller localStorage footprint).
- The in-app guide (Settings → Panduan) is written in Bahasa Indonesia.
- The AI Assistant (Settings → General → "AI Assistant (Gemini)") calls the
  Gemini API directly from the browser using a key you paste in at runtime.
  That key is stored only in `localStorage` — it is **never** read from
  `.env`/build-time env vars, specifically so it's safe to paste even if
  this app is deployed publicly (e.g. GitHub Pages): it never ends up
  inside the JS bundle anyone could inspect. You can toggle whether a
  summary of your tasks/projects/habits/goals is sent as context per chat
  (on by default) — see `src/lib/assistantContext.js`. The assistant also
  accepts image/PDF/text attachments (up to 4 files, 8MB each); attachment
  bytes are kept in-memory only and stripped before the chat history is
  persisted to `localStorage`, so past attachments show as a filename label
  after a page reload rather than staying inline forever.
>>>>>>> b4b2ee123dad43c2655a52eab73876263db4f19f
