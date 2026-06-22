import React, { useState } from "react";
import { ChevronRight, FileSignature, CheckCircle2, Lock, History, ClipboardList, Info } from "lucide-react";
import { Card, Btn, PageHead, Mono, StatusBadge, Tag, RpmDots, Row } from "../ui";
import { 
  monthFromStatus, isActiveProbation, daysCap, GRADIENT, HRBP_SELF 
} from "../../constants";

export default function DRHome({ rec, onAccept, onBack }) {
  if (!rec) return <div className="text-center py-20 text-slate-400">Loading profile...</div>;
  const n = monthFromStatus(rec.status);
  const mthReview = rec.reviews.find(r => r.cycle === n);
  const needsAccept = /-Acceptance$/.test(rec.status);
  const needsSign = /-Letter$/.test(rec.status);
  
  return (
    <div className="fadeUp">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Assalamu Alaikum, {rec.name.split(' ')[0]}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
             <Mono className="text-xs text-slate-400">{rec.empId}</Mono>
             <Tag className="bg-slate-100 text-slate-600">{rec.grade}</Tag>
             <StatusBadge status={rec.status} sm />
          </div>
        </div>
        <div className="bg-indigo-50 px-4 py-2 rounded-xl text-xs font-semibold text-indigo-700 ring-1 ring-indigo-200">FAITH Probation Access</div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
           {needsAccept && (
             <Card className="p-6 overflow-hidden relative border-amber-200 bg-amber-50/30">
                <div className="absolute top-0 right-0 p-3"><Info className="text-amber-400" size={24} /></div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1.5">Action Required · S-03</div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">Accept Month {n} review outcome</h3>
                <p className="text-sm text-slate-600 mb-5 leading-relaxed">Your manager {rec.lm} has submitted your Month {n} review. Please review the details below. If not accepted within 7 days, it will be auto-accepted by the system.</p>
                
                <div className="bg-white rounded-xl p-4 ring-1 ring-amber-200 shadow-sm mb-5">
                   <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-3">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Manager Assessment</div>
                        <div className="text-xl font-black text-slate-900">{mthReview?.rpm >= 3 ? 'Meets Expectations' : 'Needs Development'}</div>
                      </div>
                      <RpmDots score={mthReview?.rpm} />
                   </div>
                   <div className="text-sm text-slate-700 italic">"{mthReview?.comment || 'No qualitative feedback provided.'}"</div>
                </div>
                <div className="flex gap-3">
                   <Btn icon={CheckCircle2} onClick={() => onAccept(rec.id)}>Acknowledge & Save</Btn>
                   <Btn variant="ghost" onClick={() => alert("Contact HRBP/Manager to discuss outcome (F-06)")}>Discuss Outcome</Btn>
                </div>
             </Card>
           )}

           {needsSign && (
             <Card className="p-6 bg-indigo-600 text-white border-indigo-700 shadow-indigo-200">
                <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1.5">Legal Signature Required · S-10</div>
                <h3 className="text-lg font-bold mb-2">Outcome letter ready for signing</h3>
                <p className="text-sm text-indigo-100 mb-5">Your probation outcome letter ({rec.letterId}) has been released by HRBP. Please review and sign to complete the workflow.</p>
                <Btn variant="white" icon={FileSignature} onClick={() => alert("Routing to e-signature portal...")}>Open Electronic Signature</Btn>
             </Card>
           )}

           <Card className="p-5">
             <div className="text-sm font-semibold text-slate-800 mb-4 flex items-center gap-2"><ClipboardList size={16} /> My KPIs & targets</div>
              {rec.kpis.length === 0 ? <p className="text-sm text-slate-400">KPIs have not been published by your manager yet.</p> : (
                <div className="grid sm:grid-cols-2 gap-3">
                   {rec.kpis.map((k, i) => (
                     <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex justify-between items-start gap-2">
                           <span className="text-sm font-semibold text-slate-700">{k.name}</span>
                           <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded ring-1 ring-indigo-100">{k.weight}%</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{k.target}</p>
                     </div>
                   ))}
                </div>
              )}
           </Card>

           <Card className="p-5">
             <div className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2"><History size={16} /> Timeline</div>
             <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                {rec.reviews.map(rv => (
                  <div key={rv.cycle} className="relative">
                    <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-200" />
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-tight">Month {rv.cycle} Review · RPM {rv.rpm}</span>
                       <Mono className="text-[10px] text-slate-300">COMPLETED</Mono>
                    </div>
                    <p className="text-sm text-slate-600">{rv.comment}</p>
                  </div>
                ))}
                <div className="relative">
                   <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white ring-1 ring-indigo-200 animate-pulse" />
                   <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">Current Status</span>
                       <StatusBadge status={rec.status} sm />
                   </div>
                </div>
             </div>
           </Card>
        </div>

        <div className="space-y-5">
           <Card className="p-5 text-center">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">Workflow Progress</div>
              <div className="relative pt-4 pb-2">
                 <div className="text-4xl font-black text-slate-900">{rec.day}</div>
                 <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Days since start</div>
                 <div className="mt-4 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (rec.day / daysCap(rec)) * 100)}%` }} />
                 </div>
                 <div className="flex justify-between mt-1.5">
                    <Mono className="text-[10px] text-slate-400">0</Mono>
                    <Mono className="text-[10px] text-slate-400">{daysCap(rec)} (Target)</Mono>
                 </div>
              </div>
           </Card>

           <Card className="p-5">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">Employment Details</div>
              <dl className="space-y-2 text-sm">
                 <Row k="Line Manager" v={rec.lm} />
                 <Row k="Join Date" v={rec.joined} />
                 <Row k="Role Status" v={rec.employmentStatus} />
                 <Row k="Workflow" v={rec.wf} />
                 {rec.acting && <Row k="Acting Allowance" v={rec.acting.allowance} />}
              </dl>
           </Card>

           <Card className="p-5 bg-slate-50 border-slate-100">
              <div className="text-[10px] font-bold text-slate-400 uppercase mb-3">Support & Issues</div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">If you believe your probation data is incorrect, or if you wish to raise a grievance regarding the process, please contact HRBP directly.</p>
              <Btn variant="ghost" size="sm" className="w-full" onClick={() => alert("Opening support portal...")}>Contact HRBP Support</Btn>
           </Card>
        </div>
      </div>
    </div>
  );
}
