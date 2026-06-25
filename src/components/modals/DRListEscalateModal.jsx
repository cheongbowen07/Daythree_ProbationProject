import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal, Field } from "./Modal";
import { Btn } from "../ui";

const ISSUE_TYPES = [
  { value: "wrong-assign",  label: "Wrongly assigned to me",      desc: "This employee does not report to me." },
  { value: "missing-dr",    label: "Missing from my list",        desc: "Someone who reports to me is not showing up." },
  { value: "wrong-details", label: "Incorrect employee details",  desc: "Name, grade, or ID is wrong on a record." },
  { value: "other",         label: "Other",                       desc: "Describe the issue below." },
];

export default function DRListEscalateModal({ onClose, onSubmit, lmName = "" }) {
  const [issueType, setIssueType] = useState("");
  const [empRef, setEmpRef]       = useState("");
  const [desc, setDesc]           = useState("");

  const valid = issueType && desc.trim().length >= 20;

  return (
    <Modal title="Report DR list inaccuracy" code="F-06b · FR-13" onClose={onClose}>
      <div className="space-y-4">
        <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 ring-1 ring-amber-200 px-3 py-2.5 text-sm text-amber-800">
          <AlertTriangle size={15} className="shrink-0 mt-0.5" />
          <p>This report will be escalated to HRBP immediately via N-11. HRBP will investigate and correct the record in FAITH.</p>
        </div>
        {lmName && (
          <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
            <span className="text-slate-400">Reported by</span>
            <span className="font-medium text-slate-700">{lmName}</span>
          </div>
        )}

        <Field label="Issue type">
          <div className="space-y-2 mt-1">
            {ISSUE_TYPES.map((t) => (
              <label key={t.value} className={`flex items-start gap-3 p-3 rounded-lg ring-1 cursor-pointer transition ${issueType === t.value ? "ring-indigo-400 bg-indigo-50" : "ring-slate-200 hover:bg-slate-50"}`}>
                <input type="radio" name="issueType" value={t.value} checked={issueType === t.value} onChange={() => setIssueType(t.value)} className="mt-0.5 accent-indigo-600" />
                <div>
                  <div className="text-sm font-medium text-slate-800">{t.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </Field>

        <Field label="Employee name or ID (if applicable)">
          <input
            value={empRef}
            onChange={(e) => setEmpRef(e.target.value)}
            placeholder="e.g. Ahmad Faris · EMP-1234"
            className="w-full mt-1 bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-indigo-400"
          />
        </Field>

        <Field label="Description *">
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            placeholder="Describe the inaccuracy in detail… (min 20 characters)"
            className="w-full mt-1 bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-indigo-400 resize-none"
          />
          <div className={`text-xs mt-1 text-right ${desc.trim().length >= 20 ? "text-emerald-600" : "text-slate-400"}`}>{desc.trim().length}/20 min</div>
        </Field>

        <div className="flex gap-2 pt-1">
          <Btn disabled={!valid} onClick={() => valid && onSubmit(issueType, empRef, desc)} className="flex-1">
            Submit to HRBP
          </Btn>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </Modal>
  );
}
