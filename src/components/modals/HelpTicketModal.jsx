import React, { useState } from "react";
import Modal from "./Modal";
import { Btn } from "../ui";

export default function HelpTicketModal({ onClose, onSubmit }) {
  const [topic, setTopic] = useState("Technical Issue");
  return (
    <Modal title="Create Support Ticket" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Issue Category</label>
          <select className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg p-2 text-sm outline-none" value={topic} onChange={e => setTopic(e.target.value)}>
            <option>Technical Issue</option>
            <option>Policy Clarification</option>
            <option>Access Request</option>
            <option>Data Correction</option>
          </select>
        </div>
        <textarea className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg h-24 p-3 text-sm" placeholder="Provide details for IT Core support..." />
        <Btn className="w-full" onClick={() => onSubmit(topic)}>Create Ticket</Btn>
      </div>
    </Modal>
  );
}
