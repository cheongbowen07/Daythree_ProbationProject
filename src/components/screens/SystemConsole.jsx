import { RefreshCw, Clock, AlertTriangle, Play, ShieldCheck, Save } from "lucide-react";
import { Card, Btn, PageHead, Mono } from "../ui";

const PERMISSION_DEFS = [
  { key: "delegation",   label: "Allow review delegation",          desc: "LMs can delegate a monthly review to another manager if unavailable." },
  { key: "hodSignoff",   label: "Require HOD sign-off on outcomes", desc: "HOD must countersign confirmation or non-confirmation letters before dispatch." },
  { key: "autoEscalate", label: "Auto-escalate overdue reviews",    desc: "Escalates to HRBP if a review isn't submitted within 5 days of the due date." },
  { key: "notifyHrbp",   label: "Notify HRBP on every submission",  desc: "HRBP receives a notification on each monthly review submission, not just the final cycle." },
];

export default function SystemConsole({ onScheduler, onAutoAccept, onSla, records, lmPermissions = {}, setLmPermissions }) {
  const actions = [
    {
      code: "A-01", title: "Review cycle scheduler",
      desc: "Daily clock job. Fires Day-31 (Month 1) and Day-61 (Month 2) triggers; chains Months 3–6 on prior acceptance.",
      btn: "Run scheduler", icon: RefreshCw, fn: onScheduler,
      count: records.filter((r) => r.status === "KPI-Review" && r.kpis.length).length,
      countLabel: "armed for Day-31",
    },
    {
      code: "A-02", title: "7-day auto-accept",
      desc: "If a direct report does not acknowledge within 7 days, the system auto-accepts and logs the actor as System.",
      btn: "Run auto-accept", icon: Clock, fn: onAutoAccept,
      count: records.filter((r) => /-DR-Acpt$/.test(r.status)).length,
      countLabel: "open windows",
    },
    {
      code: "A-04", title: "HRBP 5-day SLA check",
      desc: "Flags letter-generation tasks past 5 business days and dispatches the N-07 urgent reminder.",
      btn: "Run SLA check", icon: AlertTriangle, fn: onSla,
      count: records.filter((r) => r.status.includes("Pending-Letter") && (r.slaDays || 0) >= 5 && !r.slaBreached).length,
      countLabel: "due to breach",
    },
  ];

  return (
    <div className="fadeUp">
      <PageHead
        code="System automations"
        title="System Console"
        sub="In production these run automatically (cron + event-driven). Here they're manual so you can watch the invisible automation layer move records and write to the audit log."
      />
      <div className="grid md:grid-cols-3 gap-4">
        {actions.map((a) => (
          <Card key={a.code} className="p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="grid place-items-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600"><a.icon size={20} /></div>
              <Mono className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">{a.code}</Mono>
            </div>
            <div className="font-semibold text-slate-800">{a.title}</div>
            <p className="text-sm text-slate-500 mt-1 mb-3 flex-1">{a.desc}</p>
            <div className="flex items-center justify-between">
              <Mono className="text-xs text-slate-400">{a.count} {a.countLabel}</Mono>
              <Btn size="sm" icon={Play} onClick={a.fn}>{a.btn}</Btn>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Line Manager Permissions ── */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={17} className="text-slate-500" />
          <h2 className="text-base font-semibold text-slate-800">Line Manager Permissions</h2>
          <Mono className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded ml-1">A-15</Mono>
        </div>
        <p className="text-sm text-slate-500 mb-4 -mt-2">These toggles control what line managers can and cannot do. Changes apply immediately across all LM accounts.</p>
        <div className="grid md:grid-cols-2 gap-3">
          {PERMISSION_DEFS.map(({ key, label, desc }) => (
            <Card key={key} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">{label}</div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
                </div>
                <button
                  onClick={() => setLmPermissions(p => ({ ...p, [key]: !p[key] }))}
                  className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${lmPermissions[key] ? "bg-indigo-600" : "bg-slate-200"}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${lmPermissions[key] ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
