import React, { useState } from "react";
import Modal from "./Modal";
import { Btn } from "../ui";

export default function FeedbackModal({ onClose, onSubmit }) {
  const [msg, setMsg] = useState("");
  return (
    <Modal title="System & Policy Feedback" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500 italic">Your feedback helps improve the FAITH workflow. All submissions are reviewed by IT Core and HRBP.</p>
        <textarea 
          className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg h-32 p-3 text-sm outline-none focus:ring-indigo-400 transition-all" 
          placeholder="How can we improve FAITH?" 
          value={msg} 
          onChange={e => setMsg(e.target.value)} 
        />
        <Btn className="w-full" onClick={() => onSubmit(msg)}>Submit Policy Feedback</Btn>
      </div>
    </Modal>
  );
}
