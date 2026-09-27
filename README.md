# Space+ — Night Console

A premium, single-user productivity workspace: tasks, projects, calendar,
Pomodoro, notes, journal, brainstorming, habits, goals, a personal media
library, bookmarks, files, developer utilities, and analytics — all in one
calm, dark interface.

## Stack

- **React 19** + **Vite** — app shell and build tooling
- **Tailwind CSS v4** — design system (see `src/index.css` for tokens)
- **React Router** (hash routing, for zero-config GitHub Pages hosting)
- **Zustand** — UI/local state (theme, auth, Pomodoro timer, sidebar)
- **TanStack Query** — data fetching/caching layer for every domain
- **Supabase** (Auth, Postgres, Storage) — optional cloud sync
- **Recharts** — dashboard and analytics charts
- **marked** — Markdown rendering for Notes

## Local mode (works immediately, no setup)

By default the app runs entirely on `localStorage` and signs you in as a
local guest profile. Every feature — tasks, projects, notes, habits, the
whole app — works fully offline with rich sample data pre-loaded, so you can
try it immediately:

```bash
npm install
npm run dev
```

## Connecting real Supabase (optional)

To sync data to the cloud and enable real authentication:

1. Create a project at https://supabase.com/dashboard.
2. Open the **SQL Editor**, paste in the contents of `supabase.sql` (creates
   the `records` table + Row Level Security policies), and run it.
3. Open **Storage**, create a bucket named exactly `uploads`, and mark it
   Public (read access; writes are still locked to each user's own folder
   by the policies `supabase.sql` sets up).
4. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and
   `VITE_SUPABASE_ANON_KEY` from Project Settings → API.
5. Restart the dev server. The app automatically detects the config and
   switches from local mode to Supabase — no code changes needed. Data is
   scoped per-user via `user_id` on the `records` table.

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
    layout/      Sidebar, Topbar, mobile nav
    command/     ⌘K global command palette / search
    charts/      Recharts wrappers used on Dashboard & Analytics
    auth/        ProtectedRoute
  hooks/
    useCollection.js   Generic TanStack Query + CRUD hook used by every page
  lib/
    supabase.js         Supabase bootstrap (no-op until configured)
    dataService.js      Unified data layer — local storage or Supabase
    localData.js         Local storage implementation
    supabaseData.js       Supabase implementation
    seed.js            Demo data
    stats.js           Streaks, trends, and chart data helpers
    utils.js           Small shared helpers
  store/         Zustand stores (theme, auth, UI, pomodoro)
  pages/         One folder per feature area
  routes/        Router configuration
```

## Design system

Everything visual resolves from the token layer in `src/index.css`. There is
exactly one place to change the look of the app.

**Identity: a dark-first "night console."** Near-black canvas (`#121016`),
elevated panels (`#1B1820`) — never pure black. Light mode inverts into a calm
paper workspace (`#F3F1F6`) and is the secondary mode, not the default.

**One glow.** A single warm orange gradient (`#FFB343 → #FF7A29 → #C1400D`) is
the only accent-glow in the system, and it is rationed to at most three uses:

| Where | Class |
| --- | --- |
| The primary call to action on a screen | `.ember-cta` |
| The active item in the sidebar | `.ember-rail` |
| One hero number per screen | `.ember-num` |
| One panel with a blurred gradient corner | `.ember-panel` |

Everything else is a flat panel. The gradient is never used as generic
decoration, and never on multiple cards at once.

**Type.** Three families, three jobs.

- `Bricolage Grotesque` 600/700 — display headings only (`font-display`)
- `Plus Jakarta Sans` 400/500/600 — all body and UI text (`font-sans`)
- `Space Mono` 400/700 — functional data only: timers, ids, counts, hex,
  code. Never a decorative all-caps label.

**Radius follows hierarchy.** Three distinct silhouettes, no exceptions:
`rounded-3xl` (26px) large panels, `rounded-2xl` (16px) cards,
`rounded-xl`/`rounded-lg`/`rounded-md` (10px) buttons, inputs, chips, nav rows,
`rounded-[7px]` for tiny chips and keycaps.

**Surfaces.** `border border-[color:var(--line)]` hairlines, never thick
borders. Shadows are soft and warm-tinted (`--shadow-card` and friends) — no
flat grey, no hard offset "neobrutalist" drops. The only ambient background
decoration is one soft radial ember glow in the top-right corner
(`body::before`).

**Status colours** (amber, teal, rose) are deliberately low-chroma so nothing
competes with the ember accent. They carry meaning — streak, income, delete —
so they keep their hue, just not their saturation.

### Accent is user-configurable

`--color-primary-500` and friends are rewritten at runtime by `applyTheme()`
in `src/store/useThemeStore.js` from the Settings picker, along with
`--accent-gradient`, `--accent-ink` (text colour that sits *on* the accent,
picked from its luminance) and `--ember-rgb` (tints the corner glow). Ember is
the default and the identity; the other presets are a user choice that never
touches the canvas, panel, or text tokens, so the night-console structure
holds whichever one is active.

### Migration note

The app was previously neobrutalist (2–3px solid borders in the ink colour,
hard un-blurred offset shadows, a dot-grid background, a Space Grotesk / Inter
/ JetBrains Mono type stack, and a `neo` vs `minimal` UI-style toggle). Rather
than rewrite ~150 call sites, the two surviving primitives were rewritten at the
cascade level in section 8 of `src/index.css`: every thick border collapses to a
1px hairline and every ink-coloured border becomes `--line`. The `uiStyle` toggle
was removed — there is one look now.

## Notes on scope

This is a fully functional, single-user app built for personal use. A few
intentionally lightweight choices given that scope:
- The Files page stores metadata locally and uploads real bytes to Supabase
  Storage only when Supabase is configured.
- Rich text in Notes is Markdown (via `marked`), not a WYSIWYG editor.
- Delete confirmations use the browser's native `confirm()` dialog.
- Notifications (event reminders, task-due digest, evening habit nudges) are
  generated by an in-app scheduler that checks every 30s while a tab is
  open — there's no service worker, so nothing fires while the app is fully
  closed. Browser system notifications require granting permission from
  Settings → Notifikasi.
- Library covers uploaded in local mode are resized/compressed and stored as
  inline base64 inside that record (fine for personal use; connect Supabase
  Storage for real file uploads and smaller localStorage footprint).
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
