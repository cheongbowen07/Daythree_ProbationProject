import { useState, useRef } from "react";
import { AlertTriangle, XCircle, Paperclip, X } from "lucide-react";
import { TODAY, inputCls } from "../../constants";
import { Btn } from "../ui";
import { Modal, Field } from "./Modal";

const REASONS = ["Resignation", "Abandonment", "Mutual Agreement", "Other"];

export default function TerminateModal({ onClose, onSubmit }) {
  const [reason, setReason]         = useState("Resignation");
  const [otherReason, setOtherReason] = useState("");
  const [remarks, setRemarks]       = useState("");
  const [effectiveDate, setEffectiveDate] = useState(TODAY);
  const [evidenceRef, setEvidenceRef] = useState("");
  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);

  const effectiveReason = reason === "Other" ? (otherReason.trim() || "Other") : reason;
  const ready = effectiveDate && (reason !== "Other" || otherReason.trim());

  function handleFiles(e) {
    const picked = Array.from(e.target.files || []);
    setAttachments((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...picked.filter((f) => !existing.has(f.name + f.size))];
    });
    e.target.value = "";
  }
  function removeAttachment(idx) { setAttachments((prev) => prev.filter((_, i) => i !== idx)); }

  return (
    <Modal title="Early termination" code="F-11 · BR-23" onClose={onClose}>
      <div className="rounded-lg bg-rose-50 ring-1 ring-rose-200 p-3 text-sm text-rose-700 mb-3">
        <AlertTriangle size={14} className="inline mr-1" /> BR-23: This action is terminal. Status becomes Prob-Terminated and all pending tasks, reminders, and signing requests are cancelled.
      </div>
      <div className="space-y-3">
        <Field label="Termination reason *">
          <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls}>
            {REASONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </Field>

        {reason === "Other" && (
          <Field label="Specify reason *">
            <input value={otherReason} onChange={(e) => setOtherReason(e.target.value)} className={inputCls} placeholder="Describe the approved early termination category…" />
          </Field>
        )}

        <Field label="Effective date *">
          <input type="date" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} className={inputCls} />
        </Field>

        <Field label="Supporting remarks">
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className={inputCls} placeholder="Additional context or justification…" />
        </Field>

        <Field label="Evidence attachment reference (if applicable)">
          <input value={evidenceRef} onChange={(e) => setEvidenceRef(e.target.value)} className={inputCls} placeholder="e.g. resignation letter ref, HR case number…" />
        </Field>

        <div>
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">Attachments (if applicable)</label>
          <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFiles} />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-sm text-indigo-600 ring-1 ring-dashed ring-indigo-300 bg-indigo-50/50 hover:bg-indigo-50 rounded-lg px-4 py-2.5 w-full justify-center transition"
          >
            <Paperclip size={14} /> Attach files
          </button>
          {attachments.length > 0 && (
            <ul className="mt-2 space-y-1">
              {attachments.map((f, i) => (
                <li key={i} className="flex items-center justify-between text-xs bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-1.5">
                  <span className="text-slate-700 truncate mr-2"><Paperclip size={11} className="inline mr-1 text-slate-400" />{f.name}</span>
                  <span className="text-slate-400 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                  <button onClick={() => removeAttachment(i)} className="ml-2 text-slate-400 hover:text-rose-500 shrink-0"><X size={13} /></button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="danger" icon={XCircle} disabled={!ready} onClick={() => onSubmit(effectiveReason, remarks, effectiveDate, evidenceRef, attachments.map((f) => f.name))}>Terminate probation</Btn>
        </div>
      </div>
    </Modal>
  );
}
