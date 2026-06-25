import { useState } from "react";
import { Plus, X } from "lucide-react";
import { TODAY, inputCls } from "../../constants";
import { totalCycles } from "../../utils/lifecycle";
import { editableKpisForCycle } from "../../utils/kpi";
import { Btn, Tag } from "../ui";
import { Modal, Field } from "./Modal";

export default function ReviewModal({ rec, month, onClose, onSubmit, onSaveDraft }) {
  const draft = rec.reviewDrafts?.[month] || rec.reviewDrafts?.[String(month)];
  const [tab, setTab]                 = useState("review");
  const [rpm, setRpm]               = useState(draft?.rpm || 3);
  const [comments, setComments]     = useState(draft?.comments || "");
  const [kpiSummary, setKpiSummary] = useState(draft?.kpiSummary || "");
  const [kpis, setKpis]             = useState(() => draft?.kpis?.length ? draft.kpis : editableKpisForCycle(rec, month));
  const [actingCtx, setActingCtx]   = useState(draft?.actingCtx || "");
  const [reviewDate, setReviewDate] = useState(draft?.reviewDate || TODAY);
  const [recmd, setRecmd]           = useState(draft?.recmd || "Satisfactory");
  const cycles = rec.phase === "EXT" ? 3 : totalCycles(rec);
  const canEditKpis = month > 1;
  const totalWeight = kpis.reduce((a, k) => a + (Number(k.weight) || 0), 0);
  const kpisValid = kpis.length >= 1 && kpis.every((k) => k.name.trim()) && totalWeight === 100;
  const valid  = comments.trim().length >= 20 && (!canEditKpis || kpisValid);

  function updKpi(i, key, val) {
    if (!canEditKpis) return;
    setKpis((rows) => rows.map((row, j) => (j === i ? { ...row, [key]: val } : row)));
  }

  function currentDraft() {
    return {
      rpm,
      comments,
      kpiSummary,
      kpis,
      actingCtx,
      reviewDate,
      recmd,
    };
  }

  return (
    <Modal title={`Month ${month} performance review`} code="S-03 / F-03" onClose={onClose} wide>
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

        <Field label="RPM rating (1–5 · ≥3 meets expectations)">
          <div className="flex gap-2 mt-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRpm(n)} className={`w-11 h-11 rounded-lg font-semibold text-sm ring-1 transition ${rpm === n ? "text-white ring-transparent" : "ring-slate-200 text-slate-500 hover:bg-slate-50"}`} style={rpm === n ? { background: n >= 3 ? "#2BAF70" : "#D62828" } : {}}>
                {n}
              </button>
            ))}
          </div>
        </Field>

        <Field label="KPI achievement summary">
          <textarea value={kpiSummary} onChange={(e) => setKpiSummary(e.target.value)} rows={2} className={`mt-1 ${inputCls}`} placeholder="Summarise performance against each KPI target…" />
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
                  ? "Update this month's KPI targets before submitting the review. The direct report will be notified if these KPIs change."
                  : "Month 1 uses the original KPI set submitted at setup."}
              </p>
              <Tag className={totalWeight === 100 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}>{totalWeight}%</Tag>
            </div>
            <div className="grid grid-cols-12 gap-2 mb-1 px-0.5">
              <span className="col-span-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">KPI name</span>
              <span className="col-span-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Description</span>
              <span className="col-span-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target</span>
              <span className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Weight</span>
            </div>
            <div className="space-y-2">
              {kpis.map((k, i) => (
                <div key={i} className="grid grid-cols-12 gap-2">
                  <input value={k.name} onChange={(e) => updKpi(i, "name", e.target.value)} readOnly={!canEditKpis} className={`col-span-3 ${inputCls} ${!canEditKpis ? "opacity-70 cursor-not-allowed" : ""}`} />
                  <input value={k.desc || ""} onChange={(e) => updKpi(i, "desc", e.target.value)} readOnly={!canEditKpis} className={`col-span-3 ${inputCls} ${!canEditKpis ? "opacity-70 cursor-not-allowed" : ""}`} />
                  <input value={k.target || ""} onChange={(e) => updKpi(i, "target", e.target.value)} readOnly={!canEditKpis} className={`col-span-3 ${inputCls} ${!canEditKpis ? "opacity-70 cursor-not-allowed" : ""}`} />
                  <input type="number" value={k.weight} onChange={(e) => updKpi(i, "weight", e.target.value)} readOnly={!canEditKpis} className={`col-span-2 ${inputCls} ${!canEditKpis ? "opacity-70 cursor-not-allowed" : ""}`} />
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
                onClick={() => setKpis((rows) => [...rows, { name: "", desc: "", target: "", weight: 0 }])}
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
        <Btn disabled={!valid} onClick={() => onSubmit(rpm, comments, { kpiSummary, kpis: canEditKpis ? kpis : null, actingCtx, reviewDate, recmd })}>Submit review</Btn>
      </div>
    </Modal>
  );
}
