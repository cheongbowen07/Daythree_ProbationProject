import { useState } from "react";
import { TODAY, inputCls } from "../../constants";
import { Btn } from "../ui";
import { Modal, Field } from "./Modal";

export default function EarlyConfModal({ rec, onClose, onSubmit }) {
  const [justification, setJustification] = useState("");
  const [effectiveDate, setEffectiveDate] = useState(TODAY);

  const justLen = justification.trim().length;
  const valid   = justLen >= 50 && effectiveDate;

  return (
    <Modal title="Early confirmation recommendation" code="F-07 · BR-16 · LT-04" onClose={onClose}>
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3 text-sm">
          <div className="font-medium text-slate-800 mb-1">{rec.name} · {rec.empId}</div>
          <div className="text-xs text-slate-500">Grade {rec.grade} · M09–M12 eligible · Cycle {rec.currentCycle} of {rec.gradeBand === "M09_M12" ? 6 : 3}</div>
        </div>

        <Field label="Justification * (min 50 characters)">
          <textarea
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={4}
            placeholder="Provide justification for early confirmation — performance evidence, business need, or exceptional circumstances…"
            className={`mt-1 w-full bg-slate-50 ring-1 rounded-lg px-3 py-2 text-sm outline-none resize-none focus:ring-indigo-400 ${justLen > 0 && justLen < 50 ? "ring-amber-300" : "ring-slate-200"}`}
          />
          <div className={`text-xs mt-1 text-right ${justLen >= 50 ? "text-emerald-600" : "text-slate-400"}`}>{justLen}/50 min</div>
        </Field>

        <Field label="Effective date">
          <input
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
            className={`mt-1 ${inputCls}`}
          />
          <p className="text-xs text-slate-400 mt-1">Must be before the normal 6-month completion date.</p>
        </Field>

        <div className="rounded-lg bg-amber-50 ring-1 ring-amber-200 p-3 text-sm text-amber-800">
          This recommendation will be sent to HRBP for approval. The Line Manager cannot confirm the employee or generate LT-04 directly.
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn disabled={!valid} onClick={() => onSubmit(rec.id, justification, effectiveDate)}>
            Submit recommendation to HRBP
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
