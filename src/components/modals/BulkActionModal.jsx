import React from "react";
import Modal from "./Modal";
import { Btn } from "../ui";

export default function BulkActionModal({ selCount, onClose, onConfirm }) {
  return (
    <Modal title={`Bulk Transition: ${selCount} Records`} onClose={onClose}>
      <div className="space-y-4">
        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
           <p className="text-xs text-indigo-700 leading-relaxed font-medium">You are about to transition {selCount} records to the next cycle phase. This action will trigger notifications (N-01/02) to all respective Line Managers.</p>
        </div>
        <p className="text-[10px] text-slate-400 italic">This master override bypasses the individual 7-day auto-accept timer. This action will be logged in the Master Audit (S-09).</p>
        <Btn className="w-full" onClick={onConfirm}>Confirm Bulk Move</Btn>
      </div>
    </Modal>
  );
}
