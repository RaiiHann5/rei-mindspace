# TeraSync

A modern SaaS platform for freelancers, agencies, and small businesses to create and manage **Invoices** and **Contracts** — with QR-code verified public invoice links.

## Backend: Firebase

This app uses **Firebase Authentication, Firestore, and Storage** as its backend. There is no server to run — the client talks to Firebase directly.

### Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Add a Web App to the project (the `</>` icon), and copy the config values it shows you.
3. Enable **Authentication → Sign-in method → Email/Password**.
4. Create a **Firestore Database** (any region close to your users).
5. Enable **Storage**.
6. Copy `.env.example` to `.env` and fill in the six `VITE_FIREBASE_*` values from step 2.
7. Deploy the security rules included in this repo:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore storage   # point at your existing project, keep the existing rules files
   firebase deploy --only firestore:rules,storage:rules
   ```
   (Or paste `firestore.rules` / `storage.rules` into the Firebase Console's Rules tab manually.)
8. Run locally:
   ```bash
   npm install
   npm run dev
   ```

### Deploying (e.g. to Vercel)

Add the same six `VITE_FIREBASE_*` variables as Environment Variables in your hosting provider's project settings, then deploy as normal. Framework preset: **Vite**, Build command: `npm run build`, Output directory: `dist`.

**Notes:**
- Every Firestore document scoped to a user (clients, invoices, contracts, the user's own profile/business doc) is protected by `firestore.rules` so only its owner can read/write it — except invoices, which are publicly readable by design (that's what powers the QR-code verification page at `/invoice/[publicId]`).
- Logo and QRIS image uploads go to Firebase Storage under `logos/{userId}/...`, restricted to that user by `storage.rules`.
- `VITE_FIREBASE_API_KEY` and friends are safe to expose in client-side code — Firebase's actual security boundary is the rules files above, not secrecy of these values.

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
