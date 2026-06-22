import { RefreshCw, Clock, AlertTriangle, Play } from "lucide-react";
import { Card, Btn, PageHead, Mono } from "../ui";

export default function SystemConsole({ onScheduler, onAutoAccept, onSla, records }) {
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
    </div>
  );
}
