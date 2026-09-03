# TeraSync

A modern SaaS platform for freelancers, agencies, and small businesses to create and manage **Invoices** and **Contracts** — with QR-code verified public invoice links.

## Running locally (current mode: no backend needed)

This build runs **entirely in your browser using localStorage** — no Firebase project, no `.env` file, no signup required. It's meant for local testing/demo of the full workflow before wiring up a real backend.

```bash
npm install
npm run dev
```

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
