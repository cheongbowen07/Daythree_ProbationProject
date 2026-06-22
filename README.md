# FAITH — Probation Module

Interactive prototype for the **Probation Process Digitalisation** initiative, built from BRD / FRD / Project Charter v2.1 (May 2026).

All data is simulated in-memory. There is no backend, no authentication, and no persistence — the app resets on page refresh.

## Tech stack

| Package | Purpose |
|---|---|
| React + Vite | UI framework and dev server |
| Tailwind CSS (CDN) | Utility-first styling |
| Recharts | Analytics charts |
| Lucide React | Icons |

## Getting started

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173` in your browser.

## Roles (RBAC demo)

Switch roles using the dropdown in the top-right corner. Each role sees a different set of screens.

| Role | Who | Scope |
|---|---|---|
| Line Manager | Marcus Lee | Own team only |
| Direct Report | (any employee) | Own record only |
| HR Business Partner | Niresha | Organisation-wide |
| Senior Leadership | HR Director | Aggregate data, no names |

## Key workflows

- **KPI setting** (S-02 / F-02) — Line Manager sets targets before the first review cycle
- **Monthly reviews** (S-03 / F-03) — RPM 1–5 score submitted by Line Manager, then accepted by Direct Report (auto-accepted after 7 days)
- **Outcome & letter generation** (S-07 / F-05) — HRBP generates templated confirmation / non-confirmation / extension letters
- **E-signature** (S-10 / F-09) — Direct Report signs the outcome letter (typed or drawn)
- **Settings & Doc Config** (S-11 / F-12) — HRBP manages document templates (Acceptance, Extension, Rejection) and global upload rules.
- **SLA tracker** (S-08) — HRBP monitors the 5-day letter generation SLA
- **Audit trail** (S-09) — Full event log across all workflow steps
- **Reports & analytics** (S-12) — Exportable CSV reports, role-scoped

## Probation tracks

| Grade band | Track | Cycles | Duration |
|---|---|---|---|
| E08 and below | New-hire (WF1) | 3 monthly reviews | 90 days |
| M09–M12 | New-hire (WF1) | 6 monthly reviews | 180 days |
| Any | Acting-role (WF2) | 3 monthly reviews | 90 days |

A single 3-month extension cycle (EXT phase) can be granted before a final outcome decision.

## Project structure

```
faith-modular/        # Modularized application (Recommended)
  App.jsx             # New root with modular architecture
  constants.js        # Business logic constants & role navigation
  data.js             # Seed data & audit generators
  components/
    ui/               # Reusable UI primitives (Btn, Card, PageHead)
    modals/           # Interactive workflow dialogs
    screens/          # Role-based page components
faith-probation.jsx   # Legacy monolithic prototype (Reference only)
src/main.jsx          # Vite entry point
index.html            # HTML shell with Tailwind CDN
package.json
doc_extracts/         # Source BRD, FRD, and Project Charter documents
```
