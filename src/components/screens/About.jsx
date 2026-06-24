import { AlertTriangle } from "lucide-react";
import { Card, PageHead, Mono } from "../ui";

const COVERAGE = [
  ["S-01 · MyTeamProb", "Line Manager dashboard — own team only (A-08)"],
  ["S-02 / F-02",       "KPI & target setting before cycle 1"],
  ["S-03 / F-03",       "Monthly review submit (RPM 1–5)"],
  ["S-04 / S-05 / F-04","DR self-service + review acceptance"],
  ["S-06",              "HRBP organisation-wide pipeline"],
  ["S-07 / F-05",       "Letter generation (LT-01…06) + legal gate"],
  ["S-08 / A-04",       "5-business-day HRBP SLA"],
  ["S-09 / A-08",       "Append-only audit trail + export"],
  ["S-10 / F-09 / A-10","Internal e-signature (replaces DocuSign)"],
  ["S-12 / A-11",       "Reports R-01…R-05, role-scoped"],
  ["A-01 / A-02",       "Review scheduler + 7-day auto-accept"],
  ["A-05 / A-06",       "Employment status + grade rule engine"],
];

function MetricCard({ label, val, sub }) {
  return (
    <Card className="p-5 text-center bg-white border-slate-100 ring-0 shadow-sm hover:ring-indigo-200 transition-all group">
       <div className="text-3xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{val}</div>
       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</div>
       <div className="text-[9px] text-slate-300 italic mt-0.5">{sub}</div>
    </Card>
  );
}

function ScopeItem({ label, val }) {
  return (
    <div>
      <div className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">{label}</div>
      <div className="text-[11px] text-slate-600 leading-relaxed font-medium">{val}</div>
    </div>
  );
}

export default function About() {
  return (
    <div className="fadeUp space-y-6">
      <PageHead code="Prototype" title="About this prototype" sub="A clickable front-end model of the FAITH Probation module, built from the BRD, FRD, and Project Charter (all v2.1, May 2026)." />

      <div className="grid md:grid-cols-3 gap-4">
        <MetricCard label="System Screens" val="12" sub="Full Modular Lifecycle" />
        <MetricCard label="Interactive Forms" val="12" sub="Statutory & Internal" />
        <MetricCard label="Total Components" val="54+" sub="Atomic UI Library" />
      </div>

      <Card className="p-6">
        <div className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Job Scope Fulfillment</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <ScopeItem label="12 Screens" val="Pipeline, Dashboard, Detail, SLA, Audit, Console, Settings, About, Reports, Notifications, UAT, MyProb" />
          <ScopeItem label="12 Forms" val="Initiate, KPI, Review, Escalate, Terminate, Profile, Sign, Feedback, Ticket, Bulk, Filter, Upload" />
          <ScopeItem label="14 Notifications" val="Day 31/61/91, 7-Day Auto, SLA Warning, E-Sign, WF1/2 Milestones, Legal gate, SAP Sync" />
          <ScopeItem label="11 Automations" val="Scheduler, Auto-Accept, SLA Check, Letter Gen, Audit, Emp-Update, Rewards Notify, HOD Alert" />
          <ScopeItem label="5 Roles" val="LM, DR, HRBP, LEAD (Leadership), ADMIN (System Administrator)" />
          <ScopeItem label="Tech Stack" val="React 18 / Vite / Tailwind CSS / Lucide / Framer Motion" />
        </div>
      </Card>

      <Card className="p-5 mb-5">

        <div className="text-sm font-semibold text-slate-800 mb-2">What it demonstrates</div>
        <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-5">
          <li>Role-based access (switch top-right): LM sees own team, DR sees own record, HRBP is org-wide, Leadership sees aggregates with no names.</li>
          <li>Grade-differentiated cycles — E08 &amp; below run 3 months/3 cycles; M09–M12 run 6 months/6 cycles.</li>
          <li>Both workflows — WF1 new-hire and WF2 acting-role (with acting grade, allowance, and LT-05/06 outcomes).</li>
          <li>The full lifecycle: KPI → monthly reviews → DR acceptance → outcome letter → internal e-signature → automatic employment-status update.</li>
          <li>Extension as a single 3-month loop, early termination, the promotion gate (DEP-09), the 5-day letter SLA, and the append-only audit trail.</li>
          <li>The System Console (HRBP role) exposes the automations (A-01/A-02/A-04) as manual buttons so the invisible layer is visible.</li>
        </ul>
      </Card>

      <Card className="p-5 mb-5">
        <div className="text-sm font-semibold text-slate-800 mb-3">Component coverage</div>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          {COVERAGE.map(([c, d]) => (
            <div key={c} className="flex items-start gap-2 text-sm">
              <Mono className="text-[11px] text-cyan-700 shrink-0 mt-0.5">{c.split(" ")[0]}</Mono>
              <span className="text-slate-600">{d}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 ring-amber-200">
        <div className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2">
          <AlertTriangle size={15} className="text-amber-500" /> What it is not
        </div>
        <p className="text-sm text-slate-600">
          This is a prototype, not the production system. There is no backend, real authentication, notification engine, document store, or persistence — refreshing resets the data. It is a faithful model of the workflow logic and screens to validate behaviour and accelerate the real FAITH build, not a deployable application. Open items from the FRD (OI-05 retention, OI-11 legal sign-off on the e-signature, OI-12 typed vs drawn signature) remain real decisions for the build.
        </p>
      </Card>
    </div>
  );
}
