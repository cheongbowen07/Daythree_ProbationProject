# FAITH — Probation Module

Interactive prototype for the **Probation Process Digitalisation** initiative, built from BRD / FRD / Project Charter v2.1 (May 2026).

All data is simulated in-memory. There is no backend, no authentication, and no persistence — the app resets on page refresh.

## Tech stack

| Package | Purpose |
|---|---|
| React + Vite | UI framework and dev server |
| Tailwind CSS | Utility-first styling |
| Recharts | Analytics charts |
| Lucide React | Icons |
| jsPDF / xlsx | Report exports (PDF / Excel) |

## Getting started

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build to dist/
```

Open `http://127.0.0.1:5173` in your browser.

## Roles (RBAC demo)

Switch roles using the dropdown in the top-right corner. Each role sees a different set of screens.

| Role | Who | Scope |
|---|---|---|
| Line Manager | Marcus Lee | Own team only |
| Direct Report | (any employee) | Own record only |
| Head of Department | — | Own department · read-only |
| HR Business Partner | Niresha | Organisation-wide |
| Senior Leadership | HR Director | Aggregate data, no names |

## Key workflows

- **KPI setting** (S-02 / F-02) — Line Manager sets SMART/discrete targets before the first review cycle. The "Edit Monthly KPI target" action is available from each profile; mid-month edits are locked and must be **submitted to HRBP for approval** (BR-10) — the LM proposes the revised targets and HRBP reviews and applies them.
- **Monthly reviews** (S-03 / F-03) — Line Manager records the DR's actual achievement against each KPI; the **RPM (1–10, to 1 decimal place, ≥6 meets expectations)** is auto-derived from weighted achievement and is never picked manually. The Direct Report then accepts (auto-accepted after 7 days, A-02). A review must be submitted within **5 business days** of its due date or it escalates to HRBP.
- **Outcome & letter generation** (S-07 / F-05) — HRBP generates templated confirmation / non-confirmation / extension letters under a **3-business-day SLA** (A-04).
- **E-signature** (S-10 / F-09) — Direct Report reads and acknowledges the outcome letter as a full-page step.
- **Settings & Doc Config** — HRBP manages document templates and global upload rules; Manager Settings (A-15) surfaces HRBP-managed review permissions and timing rules.
- **Reports & analytics** (S-12) — Exportable PDF / Excel reports, role-scoped.

> Note: the **Compliance Audit Trail** (S-09) and the per-employee **Compliance record** are currently hidden (commented out) and can be re-enabled in `constants/index.js`, `App.jsx`, and `EmployeeProfile.jsx`.

## Probation tracks

| Grade band | Track | Cycles | Duration | Extension |
|---|---|---|---|---|
| E08 and below | New-hire (WF1) | 3 monthly reviews | 90 days | 3 months |
| M09–M12 | New-hire (WF1) | 6 monthly reviews | 180 days | 1 month |
| Any | Acting-role (WF2) | 3 monthly reviews | 90 days | per grade band |

A single grade-differentiated extension (EXT phase) can be granted before a final outcome decision. The lifecycle timeline shows the **whole journey** including the original cycle and the extension, and review records from both phases are kept separately.

## UI notes

- **Lifecycle timeline** — one node per month (instead of separate review/acceptance steps). Colour conveys state: **grey** = not yet reviewed, **amber** = submitted, awaiting DR acceptance, **green** = accepted. Each node shows its scheduled date (Month 1 ≈ start + 31 days, Month 2 ≈ +61, …); the Outcome & letter node shows the actual letter generation date once a letter exists.
- **Pagination** — the LM Dashboard (10 per page) and HRBP Pipeline (12 per page) paginate long lists.
- **Full-page forms** — the KPI editor, monthly review, and DR letter open as focused full-screen pages (no sidebar).

## Project structure

```
src/
  App.jsx                 # Root: state, automations, routing between role screens
  main.jsx                # Vite entry point
  constants/index.js      # Roles, role navigation, tone/label maps, business constants
  data/seed.js            # Seed records & audit-log generators
  utils/
    lifecycle.js          # Stages, cycles, extension length, review ordering
    status.js             # Status labels, ranks, role-pending logic
    kpi.js                # KPI achievement → RPM derivation
    useSort.js            # Sortable-table hook
    export.js · csv.js    # Report export helpers
  components/
    ui/                   # Reusable primitives (Btn, Card, PageHead, Pager, …)
    LifecycleRail.jsx     # Probation timeline
    EmployeeProfile.jsx   # Profile card
    modals/               # Workflow dialogs (KPI, Review, Letter, Initiate, …)
    screens/              # Role-based pages (dashboards, pipeline, case detail, …)
    reports/              # R-01…R-06 analytics + export shell
index.html                # HTML shell
package.json
doc_extracts/             # Source BRD, FRD, and Project Charter documents
```
