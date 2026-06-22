import React, { useState } from "react";
import { Bell, Clock, AlertTriangle, CheckCircle, Info, Mail } from "lucide-react";
import { Card, PageHead, Mono, Tag, Btn } from "../ui";

export default function NotificationCenter() {
  const [notifs] = useState([
    { id: 1, type: 'milestone', title: 'Day 31 Trigger: Mth 1 Review Due', target: 'Marcus Lee (LM)', date: '2026-06-20', status: 'Delivered' },
    { id: 2, type: 'milestone', title: 'Day 61 Trigger: Mth 2 Review Due', target: 'Marcus Lee (LM)', date: '2026-07-20', status: 'Scheduled' },
    { id: 3, type: 'reminder', title: 'Daily Reminder: Pending DR Acceptance', target: 'Sarah J. (DR)', date: 'Every 24h', status: 'Active' },
    { id: 4, type: 'sla', title: 'SLA Warning: Letter Generation overdue', target: 'Niresha (HRBP)', date: '2026-06-22', status: 'Urgent' },
    { id: 5, type: 'signing', title: 'E-Signature Reminder (Internal)', target: 'Mike T. (DR)', date: 'Every 24h', status: 'Active' },
    { id: 6, type: 'milestone', title: 'Day 91 Trigger: Mth 3 Review Due', target: 'B. Wen (LM)', date: '2026-08-20', status: 'Scheduled' },
    { id: 7, type: 'auto', title: '7-Day Auto-Accept Countdown', target: 'System', date: 'T-Minus 48h', status: 'Active' },
    { id: 8, type: 'milestone', title: 'Day 121 Milestone: WF1 Continue', target: 'System', date: '2026-09-20', status: 'Queued' },
    { id: 9, type: 'milestone', title: 'Day 151 Milestone: WF1 Final Cycle', target: 'System', date: '2026-10-20', status: 'Queued' },
    { id: 10, type: 'milestone', title: 'Day 181 Milestone: Final Outcome', target: 'System', date: '2026-11-20', status: 'Queued' },
    { id: 11, type: 'policy', title: 'Legal Review Required: Non-Conf', target: 'Legal Team', date: 'Immediate', status: 'Delivered' },
    { id: 12, type: 'sync', title: 'SAP SuccessFactors Status Sync', target: 'API Node', date: 'Nightly', status: 'Ready' },
    { id: 13, type: 'reminder', title: 'Promotion Gate: DEP-09 Block', target: 'Marcus Lee (LM)', date: 'Active', status: 'Enforced' },
    { id: 14, type: 'reminder', title: 'Early Confirmation Window Open', target: 'B. Wen (LM)', date: 'Day 90+', status: 'Active' },
  ]);

  const ICONS = {
    milestone: <Clock className="text-indigo-500" size={18} />,
    reminder: <Bell className="text-amber-500" size={18} />,
    sla: <AlertTriangle className="text-rose-500" size={18} />,
    signing: <Mail className="text-cyan-500" size={18} />,
    auto: <Info className="text-slate-400" size={18} />,
    policy: <CheckCircle className="text-emerald-500" size={18} />,
    sync: <Info className="text-indigo-400" size={18} />
  };

  return (
    <div className="fadeUp">
      <PageHead title="Notification Engine" subtitle="Automated multi-channel milestone triggers and reminders (S-05/S-06)." />

      <div className="grid lg:grid-cols-4 gap-4 mb-6">
        <StatSmall label="Total Triggers" val={notifs.length} />
        <StatSmall label="Day 31/61/91 Triggers" val={6} />
        <StatSmall label="Active Reminders" val={5} />
        <StatSmall label="SLA Alerts" val={3} />
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
           <h3 className="font-bold text-slate-800 text-sm">Active Automations (14 Triggers)</h3>
           <Tag className="bg-indigo-50 text-indigo-700">Internal Dispatcher Online</Tag>
        </div>
        <div className="divide-y divide-slate-50">
           {notifs.map(n => (
             <div key={n.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-white ring-1 ring-slate-100 grid place-items-center shadow-sm">
                      {ICONS[n.type] || <Info size={18} />}
                   </div>
                   <div>
                      <div className="text-sm font-bold text-slate-900">{n.title}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                         <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Recipient: {n.target}</span>
                         <span className="w-1 h-1 rounded-full bg-slate-200" />
                         <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Schedule: {n.date}</span>
                      </div>
                   </div>
                </div>
                <Tag className={n.status === 'Urgent' ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-500'}>{n.status}</Tag>
             </div>
           ))}
        </div>
      </Card>

      <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-100 italic text-xs text-indigo-700 leading-relaxed">
         The notification engine runs natively within FAITH. No third-party email dependencies are required for internal dashboard alerts. External Outlook sync (A-14) is enabled via the Control Center.
      </div>
    </div>
  );
}

function StatSmall({ label, val }) {
  return (
    <Card className="p-4 text-center">
       <div className="text-xl font-black text-slate-900">{val}</div>
       <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</div>
    </Card>
  );
}
