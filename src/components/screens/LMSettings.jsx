import { useState } from "react";
import {
  Sliders, ShieldCheck, Save, Info
} from "lucide-react";
import { Card, PageHead, Btn } from "../ui";

export default function LMSettings({ permissions = {} }) {
  const [globalScale, setGlobalScale] = useState(5);
  const [activeTab, setActiveTab] = useState("boundaries");
  const [thresholds, setThresholds] = useState({ expected: 80, critical: 40 });

  const clampPct = (val) => Math.min(100, Math.max(0, parseInt(val) || 0));

  return (
    <div className="fadeUp">
      <style>{`
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 1; }
      `}</style>

      <PageHead
        code="A-15 · Manager Prefs"
        title="Manager Settings"
        subtitle="Review scoring boundaries and HRBP-managed permissions for probation reviews."
      />

      <div className="grid lg:grid-cols-4 gap-6">
        <aside className="space-y-2">
          {[
            { key: "boundaries",  label: "Score Boundaries",    Icon: Sliders },
            { key: "permissions", label: "Review Permissions",  Icon: ShieldCheck },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === key ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white text-slate-500 hover:bg-slate-50 ring-1 ring-slate-100"}`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </aside>

        <main className="lg:col-span-3 space-y-6">
          {/* ── Score Boundaries ── */}
          {activeTab === "boundaries" && (
            <section className="space-y-6">
              <Card className="p-6">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <Sliders size={18} className="text-indigo-500" /> Scoring Boundaries
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Default Scoring Scale</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        value={globalScale}
                        onChange={e => setGlobalScale(parseInt(e.target.value) || 1)}
                        className="w-24 text-xl font-bold text-indigo-700 border-2 border-indigo-100 rounded-xl px-3 py-2 text-center focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-400 focus:outline-none transition-all"
                      />
                      <span className="text-sm text-slate-400">max points</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2.5 italic flex items-center gap-1.5">
                      <Info size={12} /> Applied as the default scale for monthly review scoring.
                    </p>
                  </div>

                  <div className="pt-5 border-t border-slate-100">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-4">Passing Thresholds</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 space-y-3">
                        <div className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Expected Threshold</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number" min="0" max="100"
                            value={thresholds.expected}
                            onChange={e => setThresholds(p => ({ ...p, expected: clampPct(e.target.value) }))}
                            className="w-20 text-2xl font-black text-emerald-700 bg-white border-2 border-emerald-100 rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-400 focus:outline-none transition-all"
                          />
                          <span className="text-xl font-black text-emerald-400">%</span>
                        </div>
                        <p className="text-[10px] text-emerald-600/70 leading-tight">Minimum score to meet expectations.</p>
                      </div>

                      <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 space-y-3">
                        <div className="text-[10px] font-black text-rose-600 uppercase tracking-wider">Crit. Warning</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-black text-rose-300">&lt;</span>
                          <input
                            type="number" min="0" max="100"
                            value={thresholds.critical}
                            onChange={e => setThresholds(p => ({ ...p, critical: clampPct(e.target.value) }))}
                            className="w-20 text-2xl font-black text-rose-700 bg-white border-2 border-rose-100 rounded-lg px-2 py-1 text-center focus:ring-2 focus:ring-rose-400/30 focus:border-rose-400 focus:outline-none transition-all"
                          />
                          <span className="text-xl font-black text-rose-400">%</span>
                        </div>
                        <p className="text-[10px] text-rose-600/70 leading-tight">Triggers a mandatory PIP review.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="bg-indigo-900 text-white rounded-2xl p-6 relative overflow-hidden">
                <h4 className="font-bold text-lg mb-2 relative z-10">Boundaries Enforced</h4>
                <p className="text-xs text-indigo-200 leading-relaxed mb-4 relative z-10">
                  Score boundaries help the system automatically determine if an agent meets expectations (≥ {thresholds.expected}%) or requires a mandatory Performance Improvement Plan (&lt; {thresholds.critical}%).
                </p>
                <Btn variant="white" className="text-indigo-900 w-full relative z-10" icon={Save}>Apply Global Boundaries</Btn>
              </div>
            </section>
          )}

          {/* ── Review Permissions (read-only for LM) ── */}
          {activeTab === "permissions" && (
            <section className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Review Permissions</h3>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  <ShieldCheck size={12} /> Managed by HRBP
                </span>
              </div>

              <p className="text-xs text-slate-400 -mt-1">These settings are configured by your HR Business Partner in the System Console. Contact HRBP to request changes.</p>

              {[
                { key: "delegation",   label: "Allow review delegation",          desc: "Line managers can delegate a monthly review to another manager if unavailable." },
                { key: "hodSignoff",   label: "Require HOD sign-off on outcomes", desc: "Head of Department must countersign confirmation or non-confirmation letters before dispatch." },
                { key: "autoEscalate", label: "Auto-escalate overdue reviews",    desc: "If a review is not submitted within 5 days of the due date, the system escalates to HRBP automatically." },
                { key: "notifyHrbp",   label: "Notify HRBP on every submission",  desc: "HRBP receives a notification each time a monthly review is submitted, not just at the final cycle." },
              ].map(({ key, label, desc }) => (
                <Card key={key} className="p-4 opacity-80">
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
          )}

        </main>
      </div>
    </div>
  );
}
