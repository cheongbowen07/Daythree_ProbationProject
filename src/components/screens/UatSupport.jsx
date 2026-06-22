import React, { useState } from "react";
import { 
  Users, CheckCircle, HelpCircle, Bug, 
  MessageSquare, Send, Book, Terminal
} from "lucide-react";
import { Card, PageHead, Mono, Tag, Btn } from "../ui";

export default function UatSupport() {
  const [tickets] = useState([
    { id: 'TKT-001', module: 'E-Signature', issue: 'Canvas clear bug on Chrome mobile', status: 'Fix-Verified', priority: 'High' },
    { id: 'TKT-002', module: 'Reporting', issue: 'Export CSV date format inconsistent', status: 'In-Progress', priority: 'Medium' },
    { id: 'TKT-003', module: 'Workflow', issue: '7-Day auto-accept trigger delay', status: 'Under-Review', priority: 'High' },
  ]);

  return (
    <div className="fadeUp">
      <PageHead title="UAT & Go-Live Support" subtitle="Tracking User Acceptance Testing (UAT) progress and training feedback." />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <section className="lg:col-span-2 space-y-6">
           <Card className="p-5">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Bug size={18} className="text-rose-500" /> UAT Defect Tracker</h3>
              <div className="space-y-3">
                 {tickets.map(t => (
                   <div key={t.id} className="flex items-center justify-between p-3 rounded-xl ring-1 ring-slate-100 bg-white">
                      <div>
                         <div className="text-sm font-bold text-slate-900">{t.issue}</div>
                         <div className="flex items-center gap-2 mt-0.5">
                            <Mono className="text-[10px] text-slate-400">{t.id}</Mono>
                            <Tag className="bg-slate-50 text-slate-500">{t.module}</Tag>
                         </div>
                      </div>
                      <Tag className={t.priority === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}>{t.status}</Tag>
                   </div>
                 ))}
              </div>
              <Btn variant="ghost" size="sm" icon={Send} className="w-full mt-4 text-xs font-bold uppercase tracking-wider">Log New UAT Defect</Btn>
           </Card>

           <Card className="p-5">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Book size={18} className="text-indigo-500" /> Training Progress</h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <div className="text-2xl font-black text-indigo-600">85%</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">LM Training Done</div>
                 </div>
                 <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <div className="text-2xl font-black text-emerald-600">92%</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">HRBP Certification</div>
                 </div>
              </div>
           </Card>
        </section>

        <section className="space-y-6">
           <Card className="p-5 bg-indigo-600 text-white">
              <h3 className="font-bold mb-2 flex items-center gap-2 text-sm"><Terminal size={18} /> Implementation Node</h3>
              <p className="text-xs text-indigo-100 leading-relaxed mb-4">Go-live support is active for the current rollout phase (Process V2.0). All system modifications during UAT are logged in the master audit trail.</p>
              <Btn variant="white" className="w-full text-indigo-600 text-[10px] font-black uppercase tracking-widest" size="sm">Download Go-Live Checklist</Btn>
           </Card>

           <Card className="p-5">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Support Escalation</h3>
              <div className="space-y-3">
                 <button className="w-full text-left p-3 rounded-xl ring-1 ring-slate-100 hover:ring-indigo-300 transition-all flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Submit Help Ticket</span>
                    <MessageSquare size={16} className="text-slate-400" />
                 </button>
                 <button className="w-full text-left p-3 rounded-xl ring-1 ring-slate-100 hover:ring-indigo-300 transition-all flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Access Wiki / Guide</span>
                    <HelpCircle size={16} className="text-slate-400" />
                 </button>
              </div>
           </Card>
        </section>
      </div>
    </div>
  );
}
