import { useState } from "react";
import { AlertTriangle, XCircle } from "lucide-react";
import { inputCls } from "../../constants";
import { Btn } from "../ui";
import { Modal, Field } from "./Modal";

export default function TerminateModal({ onClose, onSubmit }) {
  const [reason, setReason]   = useState("Resignation");
  const [remarks, setRemarks] = useState("");

  return (
    <Modal title="Early termination" code="F-11" onClose={onClose}>
      <div className="rounded-lg bg-rose-50 ring-1 ring-rose-200 p-3 text-sm text-rose-700 mb-3">
        <AlertTriangle size={14} className="inline mr-1" /> This is terminal. The status becomes Prob-Terminated and all pending tasks and reminders are cancelled.
      </div>
      <div className="space-y-3">
        <Field label="Reason">
          <select value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls}>
            <option>Resignation</option>
            <option>Abandonment</option>
            <option>Mutual Agreement</option>
          </select>
        </Field>
        <Field label="Supporting remarks (optional)">
          <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className={inputCls} />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn variant="danger" icon={XCircle} onClick={() => onSubmit(reason, remarks)}>Terminate probation</Btn>
        </div>
      </div>
    </Modal>
  );
}
