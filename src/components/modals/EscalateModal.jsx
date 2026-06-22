import { useState } from "react";
import { Send } from "lucide-react";
import { inputCls } from "../../constants";
import { Btn } from "../ui";
import { Modal, Field } from "./Modal";

export default function EscalateModal({ onClose, onSubmit }) {
  const [issue, setIssue] = useState("Incorrect direct report");
  const [desc, setDesc]   = useState("");
  const valid = desc.trim().length >= 20;

  return (
    <Modal title="Report inaccuracy" code="F-06" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Issue type">
          <select value={issue} onChange={(e) => setIssue(e.target.value)} className={inputCls}>
            <option>Incorrect direct report</option>
            <option>Missing direct report</option>
            <option>Wrong grade / probation type</option>
            <option>Other</option>
          </select>
        </Field>
        <Field label="Description (min 20 chars)">
          <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className={inputCls} placeholder="Describe the issue for HRBP…" />
        </Field>
        <div className="flex justify-end gap-2 pt-1">
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn disabled={!valid} icon={Send} onClick={() => onSubmit(issue, desc)}>Send to HRBP</Btn>
        </div>
      </div>
    </Modal>
  );
}
