import { useState } from "react";
import { Plus, X } from "lucide-react";
import { TODAY, inputCls } from "../../constants";
import { totalCycles, extensionCycles } from "../../utils/lifecycle";
import {
  editableKpisForCycle, computeRpm, overallAchievementPct,
  kpiAchievementPct, kpiTargetLabel, RPM_MEETS,
} from "../../utils/kpi";
import { Btn, Tag, RpmDots } from "../ui";
import { Modal, Field } from "./Modal";

export default function ReviewModal({ rec, month, onClose, onSubmit, onSaveDraft, page }) {
  const draft = rec.reviewDrafts?.[month] || rec.reviewDrafts?.[String(month)];
  const [tab, setTab]                 = useState("review");
  const [comments, setComments]     = useState(draft?.comments || "");
  const [kpis, setKpis]             = useState(() => draft?.kpis?.length ? draft.kpis : editableKpisForCycle(rec, month));
  const [actingCtx, setActingCtx]   = useState(draft?.actingCtx || "");
  const [reviewDate, setReviewDate] = useState(draft?.reviewDate || TODAY);
  const [recmd, setRecmd]           = useState(draft?.recmd || "Satisfactory");
  const cycles = rec.phase === "EXT" ? extensionCycles(rec) : totalCycles(rec);
  const canEditKpis = month > 1;
  const totalWeight = kpis.reduce((a, k) => a + (Number(k.weight) || 0), 0);

  // RPM is derived from KPI achievement — never chosen by the LM.
  const overallPct = overallAchievementPct(kpis);
  const rpm        = computeRpm(kpis);

  const targetsValid = kpis.length >= 1 && kpis.every((k) => k.name.trim() && Number(k.target) > 0);
  const weightsValid = totalWeight === 100;
  const valid = comments.trim().length >= 20 && targetsValid && (!canEditKpis || weightsValid);

  // Actuals can always be recorded; name/target/unit/weight are only editable for month > 1.
  function updKpi(i, key, val) {
    if (key !== "actual" && !canEditKpis) return;
    setKpis((rows) => rows.map((row, j) => (j === i ? { ...row, [key]: val } : row)));
  }

  function currentDraft() {
    return { comments, kpis, actingCtx, reviewDate, recmd };
  }

  return (
    <Modal title={`Month ${month} performance review`} code="S-03 / F-03" onClose={onClose} xl page={page}>
      <div className="text-sm text-slate-500 mb-4">
        {rec.name} · {rec.empId} · cycle {month} of {cycles}
        {rec.wf === "WF2" && <span className="ml-2 text-violet-600 font-medium">(Acting role)</span>}
        {draft && <span className="ml-2 text-amber-600 font-medium">Draft loaded</span>}
      </div>

      <div className="flex gap-1 mb-4 border-b border-slate-200">
        {[
          ["review", "Review Details"],
          ["kpi", canEditKpis ? "Edit Monthly KPI" : "View Monthly KPI"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === key ? "border-violet-500 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "review" && (
      <div className="space-y-4">

        <div className="grid grid-cols-2 gap-3">
          <Field label="Review period">
            <div className="mt-1 text-sm font-medium text-slate-700 bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2">Month {month} of {cycles}</div>
          </Field>
          <Field label="Review date">
            <input type="date" value={reviewDate} onChange={(e) => setReviewDate(e.target.value)} className={`mt-1 ${inputCls}`} />
          </Field>
        </div>

        {/* KPI rating — auto-calculated from weighted KPI achievement, shown read-only */}
        <Field label="KPI rating (auto-calculated · 1–10)">
          <div className="mt-1 flex items-center justify-between gap-3 rounded-lg ring-1 ring-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <div className="text-2xl font-bold text-slate-800 leading-none">{rpm}<span className="text-base font-medium text-slate-400">/10</span></div>
              <div className={`text-xs font-medium mt-1 ${rpm >= RPM_MEETS ? "text-emerald-600" : "text-rose-600"}`}>
                {rpm >= RPM_MEETS ? "Meets expectations" : "Below threshold"} · {Math.round(overallPct)}% weighted achievement
              </div>
            </div>
            <RpmDots score={rpm} />
          </div>
        </Field>

        {/* KPI achievement entry — record the DR's actual against each discrete target */}
        <Field label="Monthly KPI achievement">
          <div className="mt-1 rounded-lg ring-1 ring-slate-200 bg-slate-50 overflow-hidden divide-y divide-slate-100">
            {kpis.length === 0
              ? <p className="text-xs text-slate-400 px-3 py-2.5">No KPIs set for this cycle.</p>
              : kpis.map((k, i) => {
                  const pct = Math.round(kpiAchievementPct(k));
                  return (
                    <div key={i} className="px-3 py-2.5">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-700">{k.name || "—"}</div>
                          {k.desc && <div className="text-[11px] text-slate-400 mt-0.5">{k.desc}</div>}
                        </div>
                        <Tag className="bg-slate-100 text-slate-500 shrink-0">weight {k.weight}%</Tag>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <input
                          type="number"
                          min="0"
                          value={k.actual}
                          onChange={(e) => updKpi(i, "actual", e.target.value)}
                          className={`w-24 ${inputCls}`}
                          placeholder="Actual"
                        />
                        <span className="text-xs text-slate-400">of <span className="font-medium text-slate-600">{kpiTargetLabel(k)}</span></span>
                        <span className={`ml-auto text-xs font-semibold ${pct >= 60 ? "text-emerald-600" : "text-amber-600"}`}>{pct}%</span>
                      </div>
                    </div>
                  );
                })}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            RPM is derived from these results.{canEditKpis ? " Adjust targets / weights in the “Edit Monthly KPI” tab." : ""}
          </p>
        </Field>

        <Field label="Performance comments (min 20 chars)">
          <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={3} className={`mt-1 ${inputCls}`} placeholder="Overall assessment narrative…" />
        </Field>

        {rec.wf === "WF2" && (
          <Field label={`Acting context · ${rec.acting?.grade || "acting grade"}`}>
            <textarea value={actingCtx} onChange={(e) => setActingCtx(e.target.value)} rows={2} className={`mt-1 ${inputCls}`} placeholder="Assess performance in context of the acting role and responsibilities…" />
          </Field>
        )}

        <Field label="Recommendation">
          <select value={recmd} onChange={(e) => setRecmd(e.target.value)} className={`mt-1 ${inputCls}`}>
            <option>Satisfactory</option>
            <option>Needs improvement</option>
            <option>Unsatisfactory</option>
            <option>Continue monitoring</option>
          </select>
        </Field>

        <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3 text-xs text-slate-500">
          On submit, the record moves to <span className="font-medium text-slate-700">DR acceptance</span> with daily reminders (N-04) and a 7-day auto-accept timer (A-02). Draft saves do not advance the workflow (BR-10).
        </div>
      </div>
      )}

      {tab === "kpi" && (
      <div className="space-y-4">
        <Field label={canEditKpis ? `Month ${month} KPI targets` : "Current KPI targets"}>
          <div className="mt-1 rounded-lg ring-1 ring-slate-200 bg-slate-50 p-3">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-xs text-slate-500">
                {canEditKpis
                  ? "Set a discrete, measurable target for each KPI (SMART). The direct report will be notified if these change."
                  : "Month 1 uses the original KPI set submitted at setup."}
              </p>
              <Tag className={totalWeight === 100 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}>{totalWeight}%</Tag>
            </div>
            <div className="grid grid-cols-12 gap-2 mb-1 px-0.5">
              <span className="col-span-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">KPI name</span>
              <span className="col-span-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Description</span>
              <span className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target</span>
              <span className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Unit</span>
              <span className="col-span-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Wt%</span>
            </div>
            <div className="space-y-2">
              {kpis.map((k, i) => (
                <div key={i} className="grid grid-cols-12 gap-2">
                  <input value={k.name} onChange={(e) => updKpi(i, "name", e.target.value)} readOnly={!canEditKpis} className={`col-span-3 ${inputCls} ${!canEditKpis ? "opacity-70 cursor-not-allowed" : ""}`} />
                  <input value={k.desc || ""} onChange={(e) => updKpi(i, "desc", e.target.value)} readOnly={!canEditKpis} className={`col-span-3 ${inputCls} ${!canEditKpis ? "opacity-70 cursor-not-allowed" : ""}`} />
                  <input type="number" min="0" value={k.target} onChange={(e) => updKpi(i, "target", e.target.value)} readOnly={!canEditKpis} className={`col-span-2 ${inputCls} ${!canEditKpis ? "opacity-70 cursor-not-allowed" : ""}`} />
                  <input value={k.unit || ""} onChange={(e) => updKpi(i, "unit", e.target.value)} readOnly={!canEditKpis} placeholder="e.g. calls" className={`col-span-2 ${inputCls} ${!canEditKpis ? "opacity-70 cursor-not-allowed" : ""}`} />
                  <input type="number" value={k.weight} onChange={(e) => updKpi(i, "weight", e.target.value)} readOnly={!canEditKpis} className={`col-span-1 ${inputCls} ${!canEditKpis ? "opacity-70 cursor-not-allowed" : ""}`} />
                  <button type="button" onClick={() => canEditKpis && setKpis((rows) => rows.filter((_, j) => j !== i))} disabled={!canEditKpis || kpis.length === 1} className="col-span-1 grid place-items-center h-9 text-slate-400 hover:text-rose-500 disabled:opacity-30">
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
            {canEditKpis && (
              <Btn
                variant="ghost"
                size="sm"
                icon={Plus}
                disabled={kpis.length >= 10}
                onClick={() => setKpis((rows) => [...rows, { name: "", desc: "", target: 0, unit: "", actual: 0, weight: 0 }])}
                className="mt-3"
              >
                Add KPI
              </Btn>
            )}
          </div>
        </Field>
      </div>
      )}

      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
        <Btn variant="ghost" onClick={() => onSaveDraft?.(currentDraft())}>Save draft</Btn>
        <Btn disabled={!valid} onClick={() => onSubmit(rpm, comments, { kpis, actingCtx, reviewDate, recmd })}>Submit review</Btn>
      </div>
    </Modal>
  );
}
