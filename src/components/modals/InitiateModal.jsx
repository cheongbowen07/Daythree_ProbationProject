import { useState } from "react";
import { TODAY } from "../../constants";
import { inputCls } from "../../constants";
import { Btn } from "../ui";
import { Modal, Field } from "./Modal";

export default function InitiateModal({ onClose, onAdd, defaultWf = "WF1" }) {
  const [name, setName]             = useState("");
  const [empId, setEmpId]           = useState("");
  const [grade, setGrade]           = useState("E08");
  const [wf, setWf]                 = useState(defaultWf);
  const [actingGrade, setActingGrade] = useState("M09");
  const [hodApproved, setHodApproved] = useState(false);

  const gradeBand = ["M09", "M10", "M11", "M12"].includes(grade) ? "M09_M12" : "E08_below";
  const ready = name.trim() && empId.trim() && (wf !== "WF2" || hodApproved);

  function submit() {
    const rec = { name, empId, grade, gradeBand, wf, joined: TODAY };
    if (wf === "WF2") rec.acting = { grade: actingGrade, allowance: "RM 1,500 / mo", start: TODAY, hodApproval: "Approved", hod: "HOD", approvedAt: TODAY };
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
            <input value={empId} onChange={(e) => setEmpId(e.target.value)} className={inputCls} placeholder="EMP-XXXX" />
          </Field>
          <Field label="Grade">
            <select value={grade} onChange={(e) => setGrade(e.target.value)} className={inputCls}>
              {["E06", "E07", "E08", "M09", "M10", "M11", "M12"].map((g) => <option key={g}>{g}</option>)}
            </select>
          </Field>
        </div>
        {wf === "WF2" && (
          <div className="space-y-3">
            <Field label="Acting grade">
              <select value={actingGrade} onChange={(e) => setActingGrade(e.target.value)} className={inputCls}>
                {["M09", "M10", "M11", "M12"].map((g) => <option key={g}>{g}</option>)}
              </select>
            </Field>
            <label className="flex items-start gap-2.5 rounded-lg bg-violet-50 ring-1 ring-violet-200 p-3 cursor-pointer">
              <input type="checkbox" checked={hodApproved} onChange={(e) => setHodApproved(e.target.checked)} className="mt-0.5" />
              <span className="text-sm text-violet-800">HOD approval received for acting placement (N-13). F-10 cannot activate without this approval.</span>
            </label>
          </div>
        )}
        <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3 text-xs text-slate-500">
          A-06 derives the cycle: <span className="font-medium text-slate-700">{gradeBand === "M09_M12" ? "6 months / 6 review cycles" : "3 months / 3 review cycles"}</span>. Duration and review count are read-only system outputs.
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn disabled={!ready} onClick={submit}>Initiate</Btn>
        </div>
      </div>
    </Modal>
  );
}
