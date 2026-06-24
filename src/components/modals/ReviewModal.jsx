import { useState } from "react";
import { TODAY, inputCls } from "../../constants";
import { totalCycles } from "../../utils/lifecycle";
import { Btn } from "../ui";
import { Modal, Field } from "./Modal";

export default function ReviewModal({ rec, month, onClose, onSubmit }) {
  const [rpm, setRpm]               = useState(3);
  const [comments, setComments]     = useState("");
  const [kpiSummary, setKpiSummary] = useState("");
  const [actingCtx, setActingCtx]   = useState("");
  const [reviewDate, setReviewDate] = useState(TODAY);
  const [recmd, setRecmd]           = useState("Confirm");
  const cycles = rec.phase === "EXT" ? 3 : totalCycles(rec);
  const valid  = comments.trim().length >= 20;

  return (
    <Modal title={`Month ${month} performance review`} code="S-03 / F-03" onClose={onClose} wide>
      <div className="text-sm text-slate-500 mb-4">
        {rec.name} · {rec.empId} · cycle {month} of {cycles}
        {rec.wf === "WF2" && <span className="ml-2 text-violet-600 font-medium">(Acting role)</span>}
      </div>
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
            <option>Confirm</option>
            <option>Extend</option>
            <option>Non-Confirm</option>
            <option>Continue monitoring</option>
          </select>
        </Field>

        <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3 text-xs text-slate-500">
          On submit, the record moves to <span className="font-medium text-slate-700">DR acceptance</span> with daily reminders (N-04) and a 7-day auto-accept timer (A-02). Draft saves do not advance the workflow (BR-10).
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
        <Btn variant="ghost" onClick={onClose}>Save draft</Btn>
        <Btn disabled={!valid} onClick={() => onSubmit(rpm, comments, { kpiSummary, actingCtx, reviewDate, recmd })}>Submit review</Btn>
      </div>
    </Modal>
  );
}
