import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Plus, Trash2, Sliders, Settings,
  Target, ShieldCheck, Save, Info, Upload
} from "lucide-react";
import { Card, PageHead, Tag, Btn } from "../ui";

export default function LMSettings({ permissions = {} }) {
  const [kpiTemplates, setKpiTemplates] = useState([
    { id: 1, title: "Customer Handling", desc: "Response time and satisfaction score from Zendesk", scale: 5 },
    { id: 2, title: "Technical Proficiency", desc: "Pass rates of internal certification tokens", scale: 100 },
    { id: 3, title: "Team Attendance", desc: "Weekly check-in compliance and punctuality", scale: 10 },
  ]);

  const [globalScale, setGlobalScale] = useState(5);
  const [activeTab, setActiveTab] = useState("criteria");
  const [draft, setDraft] = useState(null);
  const [thresholds, setThresholds] = useState({ expected: 80, critical: 40 });

  const openAdd  = () => setDraft({ id: Date.now(), title: "", desc: "", scale: globalScale });
  const openEdit = (t) => setDraft({ ...t });

  const saveDraft = () => {
    if (!draft.title.trim()) return;
    const isExisting = kpiTemplates.some(t => t.id === draft.id);
    setKpiTemplates(prev =>
      isExisting ? prev.map(t => t.id === draft.id ? draft : t) : [...prev, draft]
    );
    setDraft(null);
  };

  const removeTemplate = (id) => setKpiTemplates(prev => prev.filter(t => t.id !== id));
  const clampPct = (val) => Math.min(100, Math.max(0, parseInt(val) || 0));

  return (
    <div className="fadeUp">
      <style>{`
        @keyframes modalShow {
          from { opacity: 0; transform: scale(0.97) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        @keyframes overlayShow {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-modal   { animation: modalShow   0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-overlay { animation: overlayShow 0.2s ease-out forwards; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { opacity: 1; }
      `}</style>

      <PageHead
        code="A-15 · Manager Prefs"
        title="Manager Settings"
        subtitle="Customize your team's KPI criteria and scoring boundaries for probation reviews."
      />

      <div className="grid lg:grid-cols-4 gap-6">
        <aside className="space-y-2">
          {[
            { key: "criteria",    label: "KPI Criteria",        Icon: Target },
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

          {/* ── KPI Criteria ── */}
          {activeTab === "criteria" && (
            <section className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Master KPI Library</h3>
                <Btn size="sm" icon={Plus} onClick={openAdd}>Add Criteria</Btn>
              </div>

              {kpiTemplates.map(template => (
                <Card key={template.id} className="p-4 border-l-4 border-indigo-500">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{template.title}</h4>
                        <Tag className="bg-indigo-50 text-indigo-600 border border-indigo-100">Max: {template.scale}</Tag>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{template.desc || "No description provided."}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => openEdit(template)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors" title="Edit">
                        <Settings size={15} />
                      </button>
                      <button onClick={() => removeTemplate(template.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}

              {kpiTemplates.length === 0 && (
                <div className="py-12 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <Target className="mx-auto text-slate-300 mb-2" size={32} />
                  <p className="text-sm text-slate-500">No KPI templates created yet.</p>
                </div>
              )}
            </section>
          )}

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
                      <Info size={12} /> Applied as the default scale when you add new criteria.
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
                <Target className="absolute -right-4 -bottom-4 text-indigo-800 opacity-50" size={120} />
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

      {draft && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/30 backdrop-blur-sm animate-overlay">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-modal">

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-8 py-7 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-xl tracking-tight">Define Performance Criteria</h3>
                <p className="text-xs text-indigo-100/80 mt-1 uppercase tracking-widest font-semibold italic">Master Library Configuration</p>
              </div>
              <div className="absolute -right-6 -top-6 opacity-10">
                <Target size={140} strokeWidth={1} />
              </div>
            </div>

            <div className="p-8 space-y-7">
              <div className="group">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 group-focus-within:text-indigo-500 transition-colors">
                  Criteria Title
                </label>
                <input
                  autoFocus
                  value={draft.title}
                  onChange={e => setDraft({ ...draft, title: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && saveDraft()}
                  placeholder="e.g. Sales Conversion Rate"
                  className="w-full text-xl font-bold text-slate-800 border-b-2 border-slate-100 focus:border-indigo-500 transition-all bg-transparent pb-3 focus:outline-none placeholder:text-slate-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">
                  Requirement Description
                </label>
                <textarea
                  value={draft.desc}
                  onChange={e => setDraft({ ...draft, desc: e.target.value })}
                  placeholder="Define the metrics, benchmarks, or behaviors required for a passing score..."
                  className="w-full h-32 text-sm text-slate-600 border-2 border-slate-50 rounded-2xl bg-slate-50/50 p-5 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-100 transition-all resize-none outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-6 p-5 bg-indigo-50/40 rounded-2xl border border-indigo-50">
                <div className="flex-1">
                  <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <Sliders size={12} /> Scoring Boundary
                  </label>
                  <p className="text-[11px] text-slate-400 leading-tight">Total points attainable for this specific KPI.</p>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <input
                    type="number" min="1"
                    value={draft.scale}
                    onChange={e => setDraft({ ...draft, scale: parseInt(e.target.value) || 1 })}
                    className="w-24 text-2xl font-black text-indigo-700 bg-white shadow-sm border-2 border-indigo-100 rounded-2xl px-3 py-3 text-center focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 focus:outline-none transition-all"
                  />
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Scale Max</span>
                </div>
              </div>
            </div>

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
              <button
                onClick={() => setDraft(null)}
                className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveDraft}
                disabled={!draft.title.trim()}
                className="group flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-200 transition-all"
              >
                <span>Upload Criteria</span>
                <Upload size={18} className="group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
