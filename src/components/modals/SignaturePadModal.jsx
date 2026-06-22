import React, { useState } from "react";
import Modal from "./Modal";
import { Btn } from "../ui";

export default function SignaturePadModal({ onClose, onConfirm }) {
  const [signed, setSigned] = useState(false);
  return (
    <Modal title="S-10: Electronic Signature Pad" onClose={onClose}>
      <div className="border-2 border-dashed border-slate-200 rounded-xl h-48 mb-4 bg-slate-50 flex items-center justify-center cursor-crosshair group hover:border-indigo-300 transition-all" onClick={() => setSigned(true)}>
        {signed ? <div className="text-4xl font-serif italic text-slate-800 animate-in fade-in zoom-in duration-300">B. Wen Signature</div> : <span className="text-slate-400 text-sm italic group-hover:text-indigo-500">Click to draw signature...</span>}
      </div>
      <p className="text-[10px] text-slate-400 mb-4 text-center italic">By signing, you acknowledge and accept the probation outcome terms as per policy DEP-09.</p>
      <Btn className="w-full" disabled={!signed} onClick={() => onConfirm('data:image/svg+xml;...')}>Acknowledge & Sign Natives</Btn>
    </Modal>
  );
}
