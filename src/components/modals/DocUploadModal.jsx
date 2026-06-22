import React, { useState } from "react";
import Modal from "./Modal";
import { Btn } from "../ui";
import { FileUp } from "lucide-react";

export default function DocUploadModal({ onClose, onUpload }) {
  const [file, setFile] = useState(null);
  return (
    <Modal title="Statutory Document Upload" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-xs text-slate-500 italic">Upload official acceptance, extension, or rejection documents to the employee's FAITH record.</p>
        <div 
          className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:border-indigo-300 transition-colors cursor-pointer group" 
          onClick={() => setFile({ name: "probation_outcome_v2.pdf" })}
        >
          <div className="inline-flex w-12 h-12 rounded-full bg-white shadow-sm items-center justify-center mb-2 group-hover:bg-indigo-50 transition-colors">
            <FileUp size={20} className={file ? "text-indigo-600" : "text-slate-400"} />
          </div>
          {file ? (
            <div className="text-sm font-bold text-indigo-600 animate-in fade-in duration-300">{file.name}</div>
          ) : (
             <>
                <div className="text-xs font-bold text-slate-900">Click to browse or drag & drop</div>
                <div className="text-[10px] text-slate-400 mt-1">Acceptance / Extension / Rejection (PDF)</div>
             </>
          )}
        </div>
        <Btn className="w-full" disabled={!file} onClick={() => onUpload(file)}>Upload to Master Folder</Btn>
      </div>
    </Modal>
  );
}
