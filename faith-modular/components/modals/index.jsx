import React, { useState } from "react";
import { X, Plus, Trash2, Info, AlertTriangle, AlertCircle } from "lucide-react";
import { Card, Btn, PageHead, Mono } from "../ui";

export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition"><X size={18} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function InitiateModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", empId: "EMP-", grade: "E08", joined: "2026-06-22", wf: "WF1" });
  return (
    <Modal title="Initiate Probation" onClose={onClose}>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Employee Name</label>
          <input autoFocus className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-indigo-500" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Employee ID</label>
            <input className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm outline-none" value={form.empId} onChange={e => setForm({...form, empId: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Grade</label>
            <select className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm outline-none" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}>
              <option>E06</option><option>E07</option><option>E08</option><option>M09</option><option>M10</option><option>M11</option><option>M12</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Workflow Type</label>
          <div className="flex gap-2">
            <button onClick={() => setForm({...form, wf: "WF1"})} className={`flex-1 py-2 rounded-lg text-xs font-medium border ${form.wf === 'WF1' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600'}`}>WF1: New Hire</button>
            <button onClick={() => setForm({...form, wf: "WF2"})} className={`flex-1 py-2 rounded-lg text-xs font-medium border ${form.wf === 'WF2' ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-white border-slate-200 text-slate-600'}`}>WF2: Acting</button>
          </div>
        </div>
        <Btn className="w-full mt-2" onClick={() => onAdd(form)}>Create Probation Case</Btn>
      </div>
    </Modal>
  );
}

export function KpiModal({ rec, onClose, onSave }) {
  const [kpis, setKpis] = useState(rec.kpis.length ? rec.kpis : [{ name: "", target: "", weight: 34 }, { name: "", target: "", weight: 33 }, { name: "", target: "", weight: 33 }]);
  const total = kpis.reduce((acc, k) => acc + (Number(k.weight) || 0), 0);
  return (
    <Modal title={`KPI Setup: ${rec.name}`} onClose={onClose}>
      <div className="space-y-4">
        {kpis.map((k, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
            <div className="flex gap-2">
              <input className="flex-1 bg-white ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="KPI Objective" value={k.name} onChange={e => { const n = [...kpis]; n[i].name = e.target.value; setKpis(n); }} />
              <input type="number" className="w-20 bg-white ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm outline-none" placeholder="%" value={k.weight} onChange={e => { const n = [...kpis]; n[i].weight = e.target.value; setKpis(n); }} />
            </div>
            <textarea className="w-full bg-white ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm outline-none h-16" placeholder="Success measure/Target" value={k.target} onChange={e => { const n = [...kpis]; n[i].target = e.target.value; setKpis(n); }} />
          </div>
        ))}
        <div className="flex items-center justify-between px-2">
          <div className={`text-xs font-bold ${total === 100 ? 'text-emerald-600' : 'text-rose-500'}`}>Total Weighting: {total}%</div>
          <Btn size="sm" variant="ghost" icon={Plus} onClick={() => setKpis([...kpis, { name: "", target: "", weight: 0 }])}>Add Item</Btn>
        </div>
        <Btn className="w-full" disabled={total !== 100} onClick={() => onSave(kpis)}>Save & Publish KPIs</Btn>
      </div>
    </Modal>
  );
}

export function ReviewModal({ rec, month, onClose, onSubmit }) {
  const [rpm, setRpm] = useState(3);
  const [comment, setComment] = useState("");
  return (
    <Modal title={`Month ${month} Review Outcome`} onClose={onClose}>
      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-3">Overall Assessment (RPM Score)</label>
          <div className="flex gap-3">
             {[1,2,3,4,5].map(v => (
               <button key={v} onClick={() => setRpm(v)} className={`flex-1 h-12 rounded-xl text-lg font-bold transition ${rpm === v ? 'bg-indigo-600 text-white shadow-lg scale-105' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>{v}</button>
             ))}
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-bold uppercase tracking-wider">
            <span className="text-rose-500">Unsatisfactory</span>
            <span className="text-emerald-500">Exceptional</span>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Qualitative Feedback</label>
          <textarea className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-3 text-sm outline-none h-32" placeholder="Summary of performance this month..." value={comment} onChange={e => setComment(e.target.value)} />
        </div>
        <Btn className="w-full" onClick={() => onSubmit(rpm, comment)}>Submit to Employee</Btn>
      </div>
    </Modal>
  );
}

export function EscalateModal({ onClose, onSubmit }) {
  const [issue, setIssue] = useState("Inaccurate cycle trigger");
  const [desc, setDesc] = useState("");
  return (
    <Modal title="Report Issue / Escalate (F-06)" onClose={onClose}>
      <div className="space-y-4">
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Issue Type</label>
        <select className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm outline-none" value={issue} onChange={e => setIssue(e.target.value)}>
          <option>Inaccurate cycle trigger</option>
          <option>Incorrect Manager mapped</option>
          <option>Employee left the organisation</option>
          <option>KPI dispute</option>
          <option>Other / General Inquiry</option>
        </select>
        <textarea className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm outline-none h-24" placeholder="Additional details for HRBP..." value={desc} onChange={e => setDesc(e.target.value)} />
        <Btn variant="danger" className="w-full" onClick={() => onSubmit(issue, desc)}>Send Escalation</Btn>
      </div>
    </Modal>
  );
}

export function TerminateModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("Resignation");
  const [remarks, setRemarks] = useState("");
  return (
    <Modal title="End Probation Workflow Early (F-11)" onClose={onClose}>
      <div className="space-y-4">
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-3">
          <AlertTriangle className="text-rose-500 shrink-0" size={20} />
          <p className="text-xs text-rose-700 leading-relaxed">This will immediately terminate the probation workflow in FAITH. This record will move to 'Ended' status and all pending tasks will be cancelled.</p>
        </div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Termination Reason</label>
        <select className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm outline-none" value={reason} onChange={e => setReason(e.target.value)}>
          <option>Resignation</option>
          <option>Early Confirmation (Final)</option>
          <option>Administrative Error</option>
          <option>Performance Termination</option>
          <option>Misconduct</option>
        </select>
        <textarea className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm outline-none h-24" placeholder="Optional remarks..." value={remarks} onChange={e => setRemarks(e.target.value)} />
        <Btn variant="danger" className="w-full" onClick={() => onSubmit(reason, remarks)}>Confirm Termination</Btn>
      </div>
    </Modal>
  );
}
