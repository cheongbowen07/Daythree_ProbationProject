import { X } from "lucide-react";
import { Mono } from "../ui";

export function Modal({ title, code, onClose, children, wide }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{ background: "rgba(15,23,42,.45)" }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[88vh] overflow-y-auto fadeUp`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{title}</span>
            {code && <Mono className="text-[10px] text-slate-400">{code}</Mono>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
      {children}
    </label>
  );
}
