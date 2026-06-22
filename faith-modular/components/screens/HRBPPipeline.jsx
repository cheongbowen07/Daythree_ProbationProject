import React, { useState, useMemo } from "react";
import { Search, Filter, ArrowUpRight, FileText, MoreVertical, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card, Btn, PageHead, Mono, StatusBadge, Tag, Row } from "../ui";
import { isActiveProbation, filterRecords } from "../../constants";

export default function HRBPPipeline({ records, onSelectRecord, onInitiate }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState("all");

  const filtered = useMemo(() => {
    let res = filterRecords(records, q);
    if (tab === "action") res = res.filter(r => ["Pending-Letter", "Pending-Letter(Acting)", "Ext-Pending-Letter"].includes(r.status));
    if (tab === "active") res = res.filter(r => isActiveProbation(r.status));
    if (tab === "completed") res = res.filter(r => r.status === "Confirmed" || r.status === "Ended");
    return res;
  }, [records, q, tab]);

  const stats = useMemo(() => ({
    total: records.length,
    active: records.filter(r => isActiveProbation(r.status)).length,
    pending: records.filter(r => ["Pending-Letter", "Pending-Letter(Acting)", "Ext-Pending-Letter"].includes(r.status)).length
  }), [records]);

  return (
    <div className="fadeUp">
      <PageHead title="HRBP Management" subtitle="System-wide probation oversight and letter generation (S-07/S-10)" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Records" val={stats.total} icon={FileText} color="text-slate-600" bg="bg-slate-50" />
        <StatCard label="Active Workflows" val={stats.active} icon={Clock} color="text-indigo-600" bg="bg-indigo-50" />
        <StatCard label="Pending Letters" val={stats.pending} icon={AlertCircle} color="text-amber-600" bg="bg-amber-50" />
      </div>

      <Card className="mb-6">
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {[["all", "All Records"], ["active", "Active"], ["action", "Needs Letter"], ["completed", "Completed"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)} className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition ${tab === id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>{label}</button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input className="pl-9 pr-4 py-2 bg-slate-50 ring-1 ring-slate-200 rounded-xl text-sm outline-none focus:ring-indigo-500 w-64" placeholder="Search name or ID..." value={q} onChange={e => setQ(e.target.value)} />
            </div>
            <Btn icon={ArrowUpRight} onClick={onInitiate}>Initiate Case</Btn>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Manager</th>
                <th className="px-6 py-4 text-center">Day</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(r => (
                <tr key={r.id} className="group hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => onSelectRecord(r)}>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900 text-sm">{r.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Mono className="text-[10px] text-slate-400">{r.empId}</Mono>
                      <span className="w-1 h-1 rounded-full bg-slate-200" />
                      <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tight">{r.grade}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{r.lm}</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Mono className="text-xs text-slate-500">{r.day}</Mono>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={r.status} sm />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-300 group-hover:text-slate-500 transition-colors"><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm italic">No records found matching filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, val, icon: Icon, color, bg }) {
  return (
    <div className={`p-4 rounded-2xl ring-1 ring-slate-100 ${bg} flex items-center gap-4`}>
       <div className={`w-10 h-10 rounded-xl grid place-items-center bg-white shadow-sm ring-1 ring-slate-100 ${color}`}><Icon size={18} /></div>
       <div>
         <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
         <div className="text-xl font-black text-slate-900 leading-none mt-0.5">{val}</div>
       </div>
    </div>
  );
}
