import React from "react";
import { Clock, AlertTriangle, CheckCircle, BarChart3, TrendingUp, Inbox } from "lucide-react";
import { Card, PageHead, Mono, Tag, StatusBadge } from "../ui";
import { daysCap } from "../../constants";

export default function SLATracker({ records }) {
  const active = records.filter(r => !["Confirmed", "Ended"].includes(r.status));
  const late = active.filter(r => r.day > 180);
  const letterLate = active.filter(r => r.status.includes("Pending-Letter") && r.day > 5);

  return (
    <div className="fadeUp">
      <PageHead title="SLA & Compliance Tracker" subtitle="Monitoring system response times and policy adherence (S-06)" />
      
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <KPIBox label="Mean Time to Letter" val="2.4 Days" target="< 3.0" icon={Clock} color="text-indigo-600" />
        <KPIBox label="Auto-Accept Rate" val="12%" target="< 15%" icon={CheckCircle} color="text-emerald-600" />
        <KPIBox label="Compliance Breaches" val={late.length} target="0" icon={AlertTriangle} color="text-rose-600" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
           <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-500" /> Letter Turnaround</h3>
              <Tag className="bg-slate-100 text-slate-500">Last 30 Days</Tag>
           </div>
           <p className="text-sm text-slate-500 mb-6 font-medium">Measurement of time between Line Manager submission and HRBP letter generation.</p>
           <div className="space-y-4">
              <BarRow label="Within 24h" pct={65} color="bg-emerald-500" />
              <BarRow label="24h - 72h" pct={25} color="bg-indigo-500" />
              <BarRow label="Over 72h" pct={10} color="bg-rose-500" />
           </div>
        </Card>

        <Card className="p-5">
           <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2"><Inbox size={16} className="text-amber-500" /> Acceptance Latency</h3>
              <Tag className="bg-slate-100 text-slate-500">System Wide</Tag>
           </div>
           <p className="text-sm text-slate-500 mb-6 font-medium">Tracking how long employees take to acknowledge review outcomes (Target: 7 Days).</p>
           <div className="space-y-4">
              <BarRow label="Immediate" pct={40} color="bg-emerald-500" />
              <BarRow label="1-3 Days" pct={35} color="bg-indigo-500" />
              <BarRow label="4-7 Days" pct={15} color="bg-amber-500" />
              <BarRow label="Auto-Accept" pct={10} color="bg-slate-400" />
           </div>
        </Card>
      </div>
    </div>
  );
}

function KPIBox({ label, val, target, icon: Icon, color }) {
  return (
    <Card className="p-5 flex items-center gap-4 bg-white/50 backdrop-blur-sm">
       <div className={`w-12 h-12 rounded-2xl grid place-items-center ${color} bg-white shadow-sm ring-1 ring-slate-100`}><Icon size={24} /></div>
       <div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</div>
          <div className="text-2xl font-black text-slate-900">{val}</div>
          <div className="text-[10px] text-slate-500 mt-1">Target: <span className="font-bold">{target}</span></div>
       </div>
    </Card>
  );
}

function BarRow({ label, pct, color }) {
  return (
    <div className="space-y-1.5">
       <div className="flex justify-between text-xs font-bold text-slate-600">
          <span>{label}</span>
          <span>{pct}%</span>
       </div>
       <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
       </div>
    </div>
  );
}
