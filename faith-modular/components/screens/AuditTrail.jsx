import React from "react";
import { ShieldCheck, History, Eye, Search, Filter, Download } from "lucide-react";
import { Card, PageHead, Mono, Tag, Btn } from "../ui";

export default function AuditTrail({ audit = [] }) {
  return (
    <div className="fadeUp">
      <PageHead title="System Audit logs" subtitle="Immutable event tracking for compliance and legal verification (A-09)" />

      <Card>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input className="pl-9 pr-4 py-2 bg-slate-50 ring-1 ring-slate-200 rounded-xl text-sm outline-none focus:ring-indigo-500 w-64" placeholder="Filter by event or ID..." />
           </div>
           <Btn variant="ghost" icon={Download}>Export CSV</Btn>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">Context</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Actor</th>
                <th className="px-6 py-4">Identity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {audit.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-sm italic">Loading audit trail...</td></tr>
              ) : audit.map(ev => (
                <tr key={ev.id} className="text-sm hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap"><Mono className="text-xs text-slate-500 font-medium">{ev.ts}</Mono></td>
                  <td className="px-6 py-4 font-semibold text-slate-700">{ev.ref}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${ev.event.includes('SIGNED') ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{ev.event}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 italic">{ev.actor}</td>
                  <td className="px-6 py-4"><Mono className="text-[10px] text-slate-400">{ev.ip}</Mono></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-4 items-center">
         <ShieldCheck className="text-indigo-500 shrink-0" size={24} />
         <p className="text-xs text-indigo-700 leading-relaxed font-medium">Internal Audit controls are active. All data transitions between probation phases (KPI → REVIEW → ACCEPT → LETTER → SIGNED) are cryptographically timestamped and logged. Removal or modification of historical records is prohibited by system policy DEP-09.</p>
      </div>
    </div>
  );
}
