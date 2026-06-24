import { useState } from "react";
import { User } from "lucide-react";
import { Modal, Field } from "./Modal";
import { Btn, Tag, Mono } from "../ui";

export default function ReassignLMModal({ rec, lmOptions, onClose, onSave }) {
  const [newLm, setNewLm]   = useState(rec.lm);
  const [reason, setReason] = useState("");

  const changed = newLm !== rec.lm;
  const valid   = changed && reason.trim().length > 3;

  return (
    <Modal title="Reassign Line Manager" code="F-13 · FR-13" onClose={onClose}>
      <div className="space-y-4">

        {/* Current assignment */}
        <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 px-4 py-3 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current assignment</div>
          <div className="flex items-center gap-3 mt-1">
            <div className="grid place-items-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0">
              {rec.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-800">{rec.name}</div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Mono>{rec.empId}</Mono>
                <Tag className="bg-slate-100 text-slate-600">{rec.grade}</Tag>
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">Reports to</div>
              <div className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <User size={12} className="text-slate-400" />{rec.lm}
              </div>
            </div>
          </div>
        </div>

        <Field label="Reassign to">
          <div className="space-y-2 mt-1">
            {lmOptions.map((lm) => (
              <label
                key={lm}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ring-1 cursor-pointer transition ${
                  newLm === lm
                    ? "ring-indigo-400 bg-indigo-50"
                    : "ring-slate-200 hover:bg-slate-50"
                } ${lm === rec.lm ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <input
                  type="radio"
                  name="newLm"
                  value={lm}
                  checked={newLm === lm}
                  disabled={lm === rec.lm}
                  onChange={() => setNewLm(lm)}
                  className="accent-indigo-600"
                />
                <div className="grid place-items-center w-7 h-7 rounded-full bg-slate-200 text-slate-600 text-xs font-bold shrink-0">
                  {lm.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                </div>
                <div className="flex-1 text-sm text-slate-800 font-medium">{lm}</div>
                {lm === rec.lm && <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Current</span>}
              </label>
            ))}
          </div>
        </Field>

        <Field label="Reason for reassignment *">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. LM went on extended leave, team restructure, error correction…"
            className="w-full mt-1 bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-indigo-400 resize-none"
          />
        </Field>

        <div className="flex gap-2 pt-1">
          <Btn disabled={!valid} onClick={() => valid && onSave(newLm, reason)} className="flex-1">
            Confirm reassignment
          </Btn>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        </div>
      </div>
    </Modal>
  );
}
