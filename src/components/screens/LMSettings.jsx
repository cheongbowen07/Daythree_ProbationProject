import { ShieldCheck, Clock, Info, Mail } from "lucide-react";
import { Card, PageHead } from "../ui";

const PERMS = [
  { key: "delegation",   label: "Allow review delegation",          desc: "Line managers can delegate a monthly review to another manager if unavailable." },
  { key: "hodSignoff",   label: "Require HOD sign-off on outcomes", desc: "Head of Department must countersign confirmation or non-confirmation letters before dispatch." },
  { key: "autoEscalate", label: "Auto-escalate overdue reviews",    desc: "If a review is not submitted within 5 days of the due date, the system escalates to HRBP automatically." },
  { key: "notifyHrbp",   label: "Notify HRBP on every submission",  desc: "HRBP receives a notification each time a monthly review is submitted, not just at the final cycle." },
];

const TIMING = [
  { label: "Probation cycles",     value: "E08 & below · 3 · M09–M12 · 6" },
  { label: "Monthly review SLA",   value: "5 business days from due date" },
  { label: "DR acceptance",        value: "7-day auto-accept (A-02)" },
  { label: "Letter generation",    value: "3 business-day SLA (A-04)" },
  { label: "Extension length",     value: "M09+ · 1 month · E08 · 3 months" },
];

export default function LMSettings({ permissions = {} }) {
  return (
    <div className="fadeUp">
      <PageHead
        code="A-15 · Manager Prefs"
        title="Manager Settings"
        sub="HRBP-managed permissions and timing rules for probation reviews."
      />

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {/* Review permissions */}
        <section className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Review Permissions</h3>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
              <ShieldCheck size={12} /> Managed by HRBP
            </span>
          </div>

          <p className="text-xs text-slate-400 -mt-1">These settings are configured by your HR Business Partner in the System Console. Contact HRBP to request changes.</p>

          {PERMS.map(({ key, label, desc }) => (
            <Card key={key} className="p-4 opacity-90">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-700">{label}</div>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{desc}</p>
                </div>
                <div className={`relative shrink-0 w-11 h-6 rounded-full cursor-not-allowed ${permissions[key] ? "bg-indigo-400" : "bg-slate-200"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${permissions[key] ? "translate-x-5" : "translate-x-0"}`} />
                </div>
              </div>
            </Card>
          ))}
        </section>

        {/* Reference column */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={15} className="text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-800">Probation timing &amp; SLAs</h3>
            </div>
            <dl className="space-y-2.5">
              {TIMING.map((t) => (
                <div key={t.label} className="flex justify-between gap-3 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <dt className="text-xs text-slate-400 shrink-0">{t.label}</dt>
                  <dd className="text-xs font-medium text-slate-700 text-right">{t.value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Info size={15} className="text-slate-400" />
              <h3 className="text-sm font-bold text-slate-800">Need a change?</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              These permissions are owned by your HR Business Partner and configured in the System Console (A-15). To request a change — for example enabling review delegation while you are on leave — contact your HRBP.
            </p>
            <a
              href="mailto:hrbp@faith.my?subject=Manager%20Settings%20change%20request"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 ring-1 ring-indigo-200 px-2.5 py-1.5 rounded-lg transition"
            >
              <Mail size={13} /> Contact HRBP
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
