import React from "react";
import Modal from "./Modal";
import { Btn } from "../ui";

export default function FilterModal({ onClose, onApply }) {
  return (
    <Modal title="Advanced Pipeline Filter" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status Category</label>
          <select className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg p-2 text-sm outline-none">
            <option>All Ongoing</option>
            <option>KPI Pending</option>
            <option>Mth 1-3 Review</option>
            <option>Pending Signature</option>
            <option>Extension Ongoing</option>
            <option>SLA Breached Only</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Department Scope</label>
          <select className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg p-2 text-sm outline-none">
            <option>All Departments</option>
            <option>HR & Admin</option>
            <option>Operations</option>
            <option>IT Support</option>
          </select>
        </div>
        <Btn className="w-full" onClick={onApply}>Apply Advanced Filter</Btn>
      </div>
    </Modal>
  );
}
