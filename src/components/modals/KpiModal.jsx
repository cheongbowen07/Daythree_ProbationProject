import { useState } from "react";
import { Plus, X, Lock } from "lucide-react";
import { inputCls } from "../../constants";
import { Btn, Mono, Tag } from "../ui";
import { Modal } from "./Modal";

export default function KpiModal({ rec, onClose, onSave }) {
  const locked = !!rec.kpisLocked;
  const [kpis, setKpis] = useState(rec.kpis.length ? rec.kpis : [{ name: "", desc: "", target: "", weight: 100 }]);
  const total = kpis.reduce((a, k) => a + (Number(k.weight) || 0), 0);
  const valid = !locked && kpis.length >= 1 && kpis.every((k) => k.name.trim()) && total === 100;

  function upd(i, key, val) {
    if (locked) return;
    setKpis((k) => k.map((row, j) => (j === i ? { ...row, [key]: val } : row)));
  }

  return (
    <Modal title="Set KPIs & targets" code="S-02 / F-02" onClose={onClose} wide>

      {/* Employee context header */}
      <div className="flex items-center gap-3 rounded-lg bg-slate-50 ring-1 ring-slate-200 px-4 py-2.5 mb-4">
        <div className="grid place-items-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold shrink-0">
          {rec.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-800">{rec.name}</div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Mono>{rec.empId}</Mono>
            <Tag className="bg-slate-100 text-slate-600">{rec.grade}</Tag>
          </div>
        </div>
        <div className="ml-auto text-right text-xs text-slate-400">
          <div>Min 1 · Max 10 KPIs</div>
          <div>Weights must total 100%</div>
        </div>
      </div>

      {/* Lock banner */}
      {locked && (
        <div className="flex items-center gap-2 rounded-lg bg-amber-50 ring-1 ring-amber-200 px-3 py-2.5 mb-4 text-amber-800 text-sm">
          <Lock size={14} className="shrink-0" />
          KPIs are locked after submission. HRBP unlock approval required to edit (BR-10).
        </div>
      )}

      {/* Column headers */}
      <div className="grid grid-cols-12 gap-2 mb-1 px-0.5">
        <span className="col-span-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">KPI name *</span>
        <span className="col-span-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Description</span>
        <span className="col-span-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Target</span>
        <span className="col-span-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Weight %</span>
      </div>

      <div className="space-y-2">
        {kpis.map((k, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-start">
            <input value={k.name}      onChange={(e) => upd(i, "name",   e.target.value)} placeholder="KPI name"        readOnly={locked} className={`col-span-3 ${inputCls} ${locked ? "opacity-60 cursor-not-allowed" : ""}`} />
            <input value={k.desc || ""} onChange={(e) => upd(i, "desc",   e.target.value)} placeholder="Description"     readOnly={locked} className={`col-span-3 ${inputCls} ${locked ? "opacity-60 cursor-not-allowed" : ""}`} />
            <input value={k.target}    onChange={(e) => upd(i, "target", e.target.value)} placeholder="Target / metric"  readOnly={locked} className={`col-span-3 ${inputCls} ${locked ? "opacity-60 cursor-not-allowed" : ""}`} />
            <input type="number" value={k.weight} onChange={(e) => upd(i, "weight", e.target.value)} readOnly={locked} className={`col-span-2 ${inputCls} ${locked ? "opacity-60 cursor-not-allowed" : ""}`} />
            <button onClick={() => !locked && setKpis((x) => x.filter((_, j) => j !== i))} disabled={kpis.length === 1 || locked} className="col-span-1 grid place-items-center h-9 text-slate-400 hover:text-rose-500 disabled:opacity-30">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mt-3">
        <Btn variant="ghost" size="sm" icon={Plus} disabled={kpis.length >= 10 || locked} onClick={() => setKpis((k) => [...k, { name: "", desc: "", target: "", weight: 0 }])}>Add KPI</Btn>
        <span className={`text-sm font-medium ${total === 100 ? "text-emerald-600" : "text-rose-600"}`}>Total weight: {total}%</span>
      </div>

      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
        <Btn variant="ghost" onClick={onClose}>{locked ? "Close" : "Save draft"}</Btn>
        {!locked && <Btn disabled={!valid} onClick={() => onSave(kpis)}>Submit KPIs</Btn>}
      </div>
    </Modal>
  );
}
