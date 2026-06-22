import { useState } from "react";
import { Plus, X } from "lucide-react";
import { inputCls } from "../../constants";
import { Btn } from "../ui";
import { Modal } from "./Modal";

export default function KpiModal({ rec, onClose, onSave }) {
  const [kpis, setKpis] = useState(rec.kpis.length ? rec.kpis : [{ name: "", target: "", weight: 100 }]);
  const total = kpis.reduce((a, k) => a + (Number(k.weight) || 0), 0);
  const valid = kpis.length >= 1 && kpis.every((k) => k.name.trim()) && total === 100;

  function upd(i, key, val) {
    setKpis((k) => k.map((row, j) => (j === i ? { ...row, [key]: val } : row)));
  }

  return (
    <Modal title="Set KPIs & targets" code="S-02 / F-02" onClose={onClose} wide>
      <p className="text-sm text-slate-500 mb-4">Minimum one KPI, maximum ten. Weights must total 100%. KPIs are visible to the direct report.</p>
      <div className="space-y-2.5">
        {kpis.map((k, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-start">
            <input value={k.name}   onChange={(e) => upd(i, "name",   e.target.value)} placeholder="KPI name" className={`col-span-5 ${inputCls}`} />
            <input value={k.target} onChange={(e) => upd(i, "target", e.target.value)} placeholder="Target"   className={`col-span-4 ${inputCls}`} />
            <input type="number" value={k.weight} onChange={(e) => upd(i, "weight", e.target.value)} className={`col-span-2 ${inputCls}`} />
            <button onClick={() => setKpis((x) => x.filter((_, j) => j !== i))} disabled={kpis.length === 1} className="col-span-1 grid place-items-center h-9 text-slate-400 hover:text-rose-500 disabled:opacity-30">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3">
        <Btn variant="ghost" size="sm" icon={Plus} disabled={kpis.length >= 10} onClick={() => setKpis((k) => [...k, { name: "", target: "", weight: 0 }])}>Add KPI</Btn>
        <span className={`text-sm font-medium ${total === 100 ? "text-emerald-600" : "text-rose-600"}`}>Total weight: {total}%</span>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn disabled={!valid} onClick={() => onSave(kpis)}>Save KPIs</Btn>
      </div>
    </Modal>
  );
}
