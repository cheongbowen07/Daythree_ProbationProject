import { RefreshCw, Clock, AlertTriangle, ShieldCheck, Activity, CalendarX } from "lucide-react";
import { Card, PageHead, Mono } from "../ui";

const PERMISSION_DEFS = [
  { key: "delegation",   label: "Allow review delegation",          desc: "LMs can delegate a monthly review to another manager if unavailable." },
  { key: "hodSignoff",   label: "Require HOD sign-off on outcomes", desc: "HOD must countersign confirmation or non-confirmation letters before dispatch." },
  { key: "autoEscalate", label: "Auto-escalate overdue reviews",    desc: "Escalates to HRBP if a review isn't submitted within 5 days of the due date." },
  { key: "notifyHrbp",   label: "Notify HRBP on every submission",  desc: "HRBP receives a notification on each monthly review submission, not just the final cycle." },
];

function Toggle({ on, onChange }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 ${on ? "bg-indigo-600" : "bg-slate-200"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${on ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

function NumberInput({ value, onChange, min = 1, max = 999 }) {
  return (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Math.max(min, Math.min(max, Number(e.target.value))))}
      className="w-20 text-sm rounded-lg ring-1 ring-slate-200 px-2 py-1 outline-none focus:ring-indigo-400 text-center"
    />
  );
}

const AUTOMATION_DEFS = [
  {
    key: "scheduler",
    code: "A-01",
    icon: RefreshCw,
    title: "Review cycle scheduler",
    desc: "Fires the Day-31 trigger to advance KPI-reviewed records into Month 1 review. Chains subsequent months on prior acceptance.",
    fields: [
      { label: "Trigger day", field: "triggerDay", unit: "days", min: 1, max: 180 },
      { label: "Check every",  field: "intervalSecs", unit: "sec", min: 5, max: 3600 },
    ],
  },
  {
    key: "autoAccept",
    code: "A-02",
    icon: Clock,
    title: "Auto-accept timer",
    desc: "If a direct report does not acknowledge a review within the configured window, System auto-accepts and logs the actor.",
    fields: [
      { label: "Accept after", field: "days", unit: "days", min: 1, max: 30 },
      { label: "Check every",  field: "intervalSecs", unit: "sec", min: 5, max: 3600 },
    ],
  },
  {
    key: "slaCheck",
    code: "A-04",
    icon: AlertTriangle,
    title: "Letter SLA monitor",
    desc: "Monitors letter-generation tasks and fires N-07 urgent reminder when the SLA window is exceeded.",
    fields: [
      { label: "SLA window", field: "slaDays", unit: "days", min: 1, max: 30 },
      { label: "Check every", field: "intervalSecs", unit: "sec", min: 5, max: 3600 },
    ],
  },
  {
    key: "dayCheck",
    code: "A-06",
    icon: CalendarX,
    title: "Day 91 breach monitor",
    desc: "Fires an urgent N-07 escalation to HRBP when an E08-and-below record exceeds the configured day threshold without a completed outcome.",
    fields: [
      { label: "Day threshold", field: "dayThreshold", unit: "days", min: 1, max: 365 },
      { label: "Check every",  field: "intervalSecs",  unit: "sec",  min: 5, max: 3600 },
    ],
  },
];

function AutomationCard({ def, config, onPatch, records, readOnly }) {
  const counts = {
    scheduler:  records.filter((r) => r.status === "KPI-Review" && r.kpis.length).length,
    autoAccept: records.filter((r) => /-DR-Acpt$/.test(r.status)).length,
    slaCheck:   records.filter((r) => r.status.includes("Pending-Letter") && (r.slaDays || 0) >= config.slaDays && !r.slaBreached).length,
    dayCheck:   records.filter((r) => r.gradeBand === "E08_below" && r.day >= config.dayThreshold && !r.day91Breached && !r.status.startsWith("Complete-")).length,
  };
  const count = counts[def.key];

  return (
    <Card className="p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`grid place-items-center w-10 h-10 rounded-lg shrink-0 ${config.enabled ? "bg-indigo-50 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
            <def.icon size={19} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 text-sm">{def.title}</span>
              <Mono className="text-[10px] text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">{def.code}</Mono>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{def.desc}</p>
          </div>
        </div>
        {readOnly
          ? <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded uppercase tracking-wide">Managed by Admin</span>
          : <Toggle on={config.enabled} onChange={(v) => onPatch(def.key, "enabled", v)} />}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {def.fields.map(({ label, field, unit }) => (
          <div key={field} className={`transition ${config.enabled ? "" : "opacity-40"}`}>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">{label}</div>
            <div className="flex items-center gap-1.5">
              {readOnly
                ? <span className="text-sm font-semibold text-slate-700 w-20 text-center ring-1 ring-slate-200 rounded-lg px-2 py-1 bg-slate-50">{config[field]}</span>
                : <NumberInput value={config[field]} onChange={(v) => onPatch(def.key, field, v)} min={1} max={9999} />}
              <span className="text-xs text-slate-400">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${config.enabled ? "bg-emerald-400 animate-pulse" : "bg-slate-300"}`} />
          <span className="text-xs text-slate-500">{config.enabled ? "Running" : "Stopped"}</span>
          {config.lastRun && <span className="text-xs text-slate-400">· last ran {config.lastRun}</span>}
        </div>
        <Mono className="text-[11px] text-slate-400">{count} record{count !== 1 ? "s" : ""} in scope</Mono>
      </div>
    </Card>
  );
}

export default function SystemConsole({ records, lmPermissions = {}, setLmPermissions, automations, onPatchAutomation }) {
  const isAdmin   = !!onPatchAutomation;
  const showAutos = !!automations;

  return (
    <div className="fadeUp">
      <PageHead
        code={isAdmin ? "A-01 · A-02 · A-04 · A-06" : showAutos ? "A-01 · A-02 · A-04 · A-06 · A-15" : "A-15"}
        title="System Console"
        sub={isAdmin
          ? "Configure and enable background automations. When enabled, each job runs on its configured interval — no manual trigger needed."
          : showAutos
          ? "View automation settings (read-only — managed by System Administrator) and manage line manager permissions."
          : "Manage line manager permissions. Changes apply immediately across all LM accounts."}
      />

      {showAutos && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <Activity size={17} className="text-slate-500" />
            <h2 className="text-base font-semibold text-slate-800">Background Automations</h2>
            {!isAdmin && <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase tracking-wide ml-1">View only</span>}
          </div>
          {!isAdmin && <p className="text-xs text-slate-400 mb-4">Settings are managed by the System Administrator. Contact IT Core to request changes.</p>}
          <div className="grid md:grid-cols-3 gap-4">
            {AUTOMATION_DEFS.map((def) => (
              <AutomationCard
                key={def.key}
                def={def}
                config={automations[def.key]}
                onPatch={onPatchAutomation}
                records={records}
                readOnly={!isAdmin}
              />
            ))}
          </div>
          {isAdmin && <p className="text-xs text-slate-400 mt-3">
            In production these run as server-side cron jobs. The interval here controls how often the check fires in this prototype — set low (e.g. 10s) to observe automation in real time.
          </p>}
        </div>
      )}

      <div>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={17} className="text-slate-500" />
          <h2 className="text-base font-semibold text-slate-800">Line Manager Permissions</h2>
          <Mono className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded ml-1">A-15</Mono>
        </div>
        <p className="text-sm text-slate-500 mb-4 -mt-2">These toggles control what line managers can and cannot do across all LM accounts.</p>
        <div className="grid md:grid-cols-2 gap-3">
          {PERMISSION_DEFS.map(({ key, label, desc }) => (
            <Card key={key} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-800">{label}</div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</p>
                </div>
                <Toggle on={lmPermissions[key]} onChange={(v) => setLmPermissions(p => ({ ...p, [key]: v }))} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
