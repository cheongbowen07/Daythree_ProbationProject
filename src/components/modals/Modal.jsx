import { X, ChevronLeft } from "lucide-react";
import { createPortal } from "react-dom";
import { Mono } from "../ui";

export function Modal({ title, code, onClose, children, wide, xl, page }) {
  const maxW = xl ? "max-w-6xl" : wide ? "max-w-2xl" : "max-w-lg";

  // Page mode: take over the whole viewport as a focused, sidebar-free page
  // (rendered to <body> so it sits above the app shell — header + nav). Lets a
  // modal be promoted to a real full-screen page without the surrounding chrome.
  if (page) {
    return createPortal(
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "var(--paper)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 fadeUp">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-3">
            <ChevronLeft size={15} /> Back
          </button>
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-[22px] font-semibold tracking-tight text-[#4D4D4D]">{title}</h1>
            {/* reference code hidden — {code} */}
          </div>
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-5 sm:p-6">
            {children}
          </div>
        </div>
      </div>,
      document.body
    );
  }

  const modal = (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{ background: "rgba(15,23,42,.45)" }}
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxW} max-h-[88vh] overflow-y-auto fadeUp`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{title}</span>
            {/* reference code hidden — {code} */}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs font-medium text-slate-500 mb-1">{label}</div>
      {children}
    </label>
  );
}
