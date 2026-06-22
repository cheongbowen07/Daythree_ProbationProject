import React from "react";
import { Server, Database, Shield, Radio, Key, Users } from "lucide-react";
import { Card, PageHead, Mono, Tag, Btn } from "../ui";

export default function SystemConsole() {
  return (
    <div className="fadeUp">
      <PageHead title="FAITH Control Center" subtitle="Global system configuration and master data management" />

      <div className="grid lg:grid-cols-2 gap-8">
        <section className="space-y-4">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2"><Server size={14} /> Node Configuration</h3>
           <Card className="p-5 space-y-4">
              <ToggleRow label="E-Signature Integration" status="Online" color="emerald" />
              <ToggleRow label="Outlook Email Dispatcher" status="Online" color="emerald" />
              <ToggleRow label="Nightly Auto-Accept Daemon" status="Active" color="indigo" />
              <ToggleRow label="Archive Automation" status="Standby" color="slate" />
           </Card>

           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 pt-4 flex items-center gap-2"><Database size={14} /> Master Data Keys</h3>
           <Card className="p-5">
              <div className="space-y-3">
                 <KeyInput label="HCM API Integration Key" val="••••••••••••••••" />
                 <KeyInput label="DocuSign Integration ID" val="9A-12345-B" />
                 <KeyInput label="System Notifications Source" val="faith-no-reply@organisation.com" />
              </div>
           </Card>
        </section>

        <section className="space-y-4">
           <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2"><Shield size={14} /> Global Policy Settings</h3>
           <Card className="p-5 space-y-5">
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Standard Probation Duration (E06-E08)</label>
                 <select className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none">
                    <option>90 Days (3 Months)</option>
                    <option>180 Days (6 Months)</option>
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-semibold text-slate-700 mb-1.5">Auto-Accept Grace Period</label>
                 <div className="flex gap-2">
                    <input type="number" className="flex-1 bg-slate-50 ring-1 ring-slate-200 rounded-xl px-3 py-2.5 text-sm outline-none" defaultValue={7} />
                    <span className="flex items-center text-sm font-medium text-slate-400 px-3">Days</span>
                 </div>
              </div>
              <div className="pt-2">
                 <Btn className="w-full" variant="danger">Commit Global Changes</Btn>
                 <p className="text-[10px] text-slate-400 text-center mt-3 uppercase font-bold tracking-tight">Warning: Changes impact all active 4,200 records</p>
              </div>
           </Card>

           <Card className="p-5 border-amber-100 bg-amber-50/20">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                 <span className="text-xs font-bold text-amber-700 uppercase">System Maintenance</span>
              </div>
              <p className="text-sm text-amber-800 font-medium">Next scheduled sync with SAP SuccessFactors: <span className="underline">Today, 23:59 GST</span></p>
           </Card>
        </section>
      </div>
    </div>
  );
}

function ToggleRow({ label, status, color }) {
  const colors = {
    emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    indigo: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
    slate: 'bg-slate-100 text-slate-500 ring-slate-200'
  };
  return (
    <div className="flex items-center justify-between py-1">
       <span className="text-sm font-medium text-slate-700">{label}</span>
       <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight ring-1 ${colors[color]}`}>{status}</span>
    </div>
  );
}

function KeyInput({ label, val }) {
  return (
    <div>
       <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</label>
       <div className="flex bg-slate-50 ring-1 ring-slate-100 rounded-lg p-1.5 group">
          <Mono className="flex-1 text-xs text-slate-600 px-2 flex items-center">{val}</Mono>
          <button className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase">Change</button>
       </div>
    </div>
  );
}
