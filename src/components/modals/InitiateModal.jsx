import { useState } from "react";
import { TODAY } from "../../constants";
import { inputCls } from "../../constants";
import { Btn } from "../ui";
import { Modal, Field } from "./Modal";

export default function InitiateModal({ onClose, onAdd, defaultWf = "WF1", existingRecords = [] }) {
  const [name, setName]               = useState("");
  const [empId, setEmpId]             = useState("");
  const [grade, setGrade]             = useState("E08");
  const [startDate, setStartDate]     = useState(TODAY);
  const [notes, setNotes]             = useState("");
  const [lmConfirmed, setLmConfirmed] = useState(false);
  const [wf, setWf]                   = useState(defaultWf);
  const [actingGrade, setActingGrade]     = useState("M09");
  const [actingDuration, setActingDuration] = useState("3");
  const [approvalRef, setApprovalRef]     = useState("");
  const [hodApproved, setHodApproved]     = useState(false);

  const gradeBand = ["M09", "M10", "M11", "M12"].includes(grade) ? "M09_M12" : "E08_below";

  // BR-20: acting allowance derived from acting grade
  const ACTING_ALLOWANCE = { M09: "RM 800 / mo", M10: "RM 1,000 / mo", M11: "RM 1,200 / mo", M12: "RM 1,500 / mo" };

  // Validations
  const maxDate = new Date(); maxDate.setDate(maxDate.getDate() + 7);
  const startDateObj = new Date(startDate);
  const startDateInvalid = startDate && startDateObj > maxDate;
  const dupEmpId = empId.trim() && existingRecords.some((r) => r.empId === empId.trim());
  const ready = name.trim() && empId.trim() && !dupEmpId && startDate && !startDateInvalid && lmConfirmed && (wf !== "WF2" || hodApproved);

  function submit() {
    const rec = { name, empId, grade, gradeBand, wf, joined: startDate, notes };
    if (wf === "WF2") rec.acting = { grade: actingGrade, allowance: ACTING_ALLOWANCE[actingGrade] || "RM 1,500 / mo", duration: `${actingDuration} months`, approvalRef, start: startDate, hodApproval: "Approved", hod: "HOD", approvedAt: TODAY };
    onAdd(rec);
  }

  return (
    <Modal title="Initiate probation" code="F-01 / F-10" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex gap-2">
          {[["WF1", "New-hire (F-01)"], ["WF2", "Acting-role (F-10)"]].map(([v, l]) => (
            <button key={v} onClick={() => setWf(v)} className={`flex-1 text-sm px-3 py-2 rounded-lg ring-1 font-medium ${wf === v ? "ring-cyan-500 bg-cyan-50 text-cyan-700" : "ring-slate-200 text-slate-600"}`}>{l}</button>
          ))}
        </div>

        <Field label="Employee name">
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Full name" />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Employee ID">
            <input value={empId} onChange={(e) => setEmpId(e.target.value)} className={`${inputCls} ${dupEmpId ? "ring-rose-400" : ""}`} placeholder="EMP-XXXX" />
            {dupEmpId && <p className="text-xs text-rose-600 mt-1">Active probation already exists for this ID.</p>}
          </Field>
          <Field label="Grade">
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className={inputCls}>
              {["E06", "E07", "E08", "M09", "M10", "M11", "M12"].map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Start date">
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={`${inputCls} ${startDateInvalid ? "ring-rose-400" : ""}`} />
          {startDateInvalid && <p className="text-xs text-rose-600 mt-1">Start date cannot be more than 7 days in the future.</p>}
        </Field>

        <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3 text-xs text-slate-500">
          A-07 derives the cycle: <span className="font-medium text-slate-700">{gradeBand === "M09_M12" ? "6 months / 6 review cycles" : "3 months / 3 review cycles"}</span>. Duration and review count are read-only system outputs.
        </div>

        {wf === "WF2" && (
          <div className="space-y-3 rounded-lg bg-violet-50/40 ring-1 ring-violet-100 p-3">
            <div className="text-[10px] font-bold text-violet-600 uppercase tracking-wider mb-1">Acting-role details (F-10 · BR-19 · BR-20)</div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Acting grade">
                <select value={actingGrade} onChange={(e) => setActingGrade(e.target.value)} className={inputCls}>
                  {["M09", "M10", "M11", "M12"].map((g) => <option key={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Acting duration (months)">
                <select value={actingDuration} onChange={(e) => setActingDuration(e.target.value)} className={inputCls}>
                  {["1","2","3","4","5","6"].map((m) => <option key={m}>{m}</option>)}
                </select>
              </Field>
            </div>
            <div className="rounded-lg bg-white ring-1 ring-violet-100 px-3 py-2 text-xs text-slate-600 flex items-center justify-between">
              <span className="text-slate-400">Acting allowance (BR-20, system-derived)</span>
              <span className="font-semibold text-violet-700">{ACTING_ALLOWANCE[actingGrade]}</span>
            </div>
            <Field label="Approval reference (HOD / HR)">
              <input value={approvalRef} onChange={(e) => setApprovalRef(e.target.value)} className={inputCls} placeholder="e.g. HOD email ref, HR case number…" />
            </Field>
            <label className="flex items-start gap-2.5 rounded-lg bg-violet-50 ring-1 ring-violet-200 p-3 cursor-pointer">
              <input type="checkbox" checked={hodApproved} onChange={(e) => setHodApproved(e.target.checked)} className="mt-0.5" />
              <span className="text-sm text-violet-800">HOD approval received for acting placement (N-13). F-10 cannot activate without this approval.</span>
            </label>
          </div>
        )}

        <Field label="Notes (optional)">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputCls} placeholder="Any remarks or context for this probation initiation…" />
        </Field>

        <label className="flex items-start gap-2.5 rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3 cursor-pointer">
          <input type="checkbox" checked={lmConfirmed} onChange={(e) => setLmConfirmed(e.target.checked)} className="mt-0.5" />
          <span className="text-sm text-slate-700">I confirm the above details are correct and authorise initiation of this probation record (LM confirmation).</span>
        </label>

        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn disabled={!ready} onClick={submit}>Initiate</Btn>
        </div>
      </div>
    </Modal>
  );
}
