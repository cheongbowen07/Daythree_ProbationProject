import React, { useState, useMemo } from "react";
import { Search, Filter, ArrowUpRight, CheckCircle2, AlertCircle, Clock, MoreVertical, ShieldCheck, Mail, Users } from "lucide-react";
import { Card, Btn, PageHead, Mono, StatusBadge, Tag, Row } from "../ui";
import { filterRecords, isActiveProbation } from "../../constants";

export default function LMDashboard({ records, onSelectRecord, onInitiate }) {
  const [q, setQ] = useState("");
  const myTeam = records.filter(r => r.lm === "Current User" || r.lm === "B. Wen"); // Simulation

  const filtered = useMemo(() => filterRecords(myTeam, q), [myTeam, q]);
  const activeCount = myTeam.filter(r => isActiveProbation(r.status)).length;
  const actionCount = myTeam.filter(r => r.status.includes("-Review") || r.status.includes("KPI")).length;

  return (
    <div className="fadeUp">
      <div className="flex justify-between items-start mb-6">
        <div>
           <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Manager Dashboard</h1>
           <p className="text-sm text-slate-500 mt-1">Hello, manage your team's probation cycles and performance reviews.</p>
        </div>
        <Btn variant="soft" icon={Mail} onClick={() => alert("Daily digest will be sent to your outlook.")}>Notification Settings</Btn>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
         <StatsBox label="Direct Reports" val={myTeam.length} icon={Users} color="text-slate-600" />
         <StatsBox label="Active Cases" val={activeCount} icon={Clock} color="text-indigo-600" />
         <StatsBox label="Tasks Due" val={actionCount} icon={AlertCircle} color="text-rose-600" />
         <StatsBox label="Confirmed" val={myTeam.filter(r => r.status === 'Confirmed').length} icon={CheckCircle2} color="text-emerald-600" />
      </div>

      <Card>
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 items-center justify-between">
           <h3 className="font-bold text-slate-800">My Team</h3>
           <div className="flex gap-2">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                 <input className="pl-9 pr-4 py-2 bg-slate-50 ring-1 ring-slate-200 rounded-xl text-sm outline-none w-56" placeholder="Find reportee..." value={q} onChange={e => setQ(e.target.value)} />
              </div>
              <Btn icon={ArrowUpRight} size="sm" onClick={onInitiate}>Add DR</Btn>
           </div>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead>
                 <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-6 py-4">Next Review</th>
                    <th className="px-6 py-4">SLA Status</th>
                    <th className="px-6 py-4">Current Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                 {filtered.map(r => (
                   <tr key={r.id} className="group hover:bg-slate-50/80 transition-colors cursor-pointer" onClick={() => onSelectRecord(r)}>
                      <td className="px-6 py-4">
                         <div className="font-semibold text-slate-900">{r.name}</div>
                         <Mono className="text-[10px] text-slate-400">{r.empId}</Mono>
                      </td>
                      <td className="px-6 py-4">
                         <div className="font-medium text-slate-600">{r.status.split('-')[0]}</div>
                         <div className="text-[10px] text-slate-400 uppercase">Target: 2026-06-30</div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-1.5 font-bold text-emerald-600 text-[10px] uppercase">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> On Track
                         </div>
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
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-400 italic">No reports found under your management.</td>
                   </tr>
                 )}
              </tbody>
           </table>
        </div>
      </Card>
    </div>
  );
}

function StatsBox({ label, val, icon: Icon, color }) {
  return (
    <Card className="p-4 flex items-center gap-3">
       <div className={`w-10 h-10 rounded-xl grid place-items-center bg-slate-50 ${color}`}><Icon size={20} /></div>
       <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{label}</div>
          <div className="text-xl font-black text-slate-900">{val}</div>
       </div>
    </Card>
  );
}
