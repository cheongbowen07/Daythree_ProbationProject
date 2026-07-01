import { ShieldCheck } from "lucide-react";
import { Card, PageHead } from "../ui";

const PERMS = [
  { key: "delegation",   label: "Allow review delegation",       desc: "Line managers can delegate a monthly review to another manager if unavailable." },
  { key: "autoEscalate", label: "Auto-escalate overdue reviews", desc: "If a review is not submitted within 5 days of the due date, the system escalates to HRBP automatically." },
];

export default function LMSettings({ permissions = {} }) {
  return (
    <div className="fadeUp">
      <PageHead
        code="A-15 · Manager Prefs"
        title="Manager Settings"
        sub="HRBP-managed permissions and timing rules for probation reviews."
      />

      <div className="items-start">
        {/* Review permissions */}
        <section className="space-y-4">
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
      </div>
    </div>
  );
}
