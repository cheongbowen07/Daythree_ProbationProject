import { useState } from "react";
import {
  Bell, Clock, AlertTriangle, CheckCircle2, Mail, RefreshCw,
  ChevronDown, ChevronRight, Shield, User, Cpu, Gavel, Send,
  Activity, Search,
} from "lucide-react";
import { Card, PageHead, Mono, Tag, Stat } from "../ui";

const NOTIFS = [
  {
    id: "N-01", code: "N-01", type: "milestone",
    title: "Day-31 trigger — Month 1 review due",
    desc: "Fires when an employee's probation day counter reaches 31. Notifies the Line Manager that Month 1 RPM review must be submitted.",
    recipient: { name: "Marcus Lee", role: "LM", empId: "LM-001" },
    relatedEmp: { name: "Aisha Rahman", empId: "EMP-1042" },
    triggeredBy: "System · A-01 scheduler",
    triggeredAt: "19 Jun 2026 · 09:00 MYT",
    deliveredAt:  "19 Jun 2026 · 09:00 MYT",
    channel: "In-app dashboard + Outlook (A-14)",
    policy: "A-01 · FRD §3.2",
    status: "Delivered",
    retries: 0,
    ackBy: null,
    ip: "10.42.11.204",
    sessionId: "SYS-A01-1042-D31",
    hash: "SHA256-N01AISHA1042D31",
  },
  {
    id: "N-02", code: "N-02", type: "milestone",
    title: "Day-61 trigger — Month 2 review due",
    desc: "Fires at Day 61. Notifies the LM that Month 2 review must be submitted within 5 business days.",
    recipient: { name: "Marcus Lee", role: "LM", empId: "LM-001" },
    relatedEmp: { name: "Aisha Rahman", empId: "EMP-1042" },
    triggeredBy: "System · A-01 scheduler",
    triggeredAt: "19 Jul 2026 · 09:00 MYT",
    deliveredAt:  "Scheduled",
    channel: "In-app dashboard + Outlook (A-14)",
    policy: "A-01 · FRD §3.2",
    status: "Scheduled",
    retries: 0,
    ackBy: null,
    ip: null,
    sessionId: "SYS-A01-1042-D61",
    hash: null,
  },
  {
    id: "N-03", code: "N-03", type: "milestone",
    title: "Day-91 trigger — Month 3 review due (E08 final)",
    desc: "Final cycle trigger for E08 & below grade band. After acceptance the record moves to LM outcome decision.",
    recipient: { name: "Marcus Lee", role: "LM", empId: "LM-001" },
    relatedEmp: { name: "Chandra Devi", empId: "EMP-0915" },
    triggeredBy: "System · A-01 scheduler",
    triggeredAt: "Scheduled",
    deliveredAt:  "Scheduled",
    channel: "In-app dashboard + Outlook (A-14)",
    policy: "A-01 · FRD §3.2",
    status: "Queued",
    retries: 0,
    ackBy: null,
    ip: null,
    sessionId: "SYS-A01-0915-D91",
    hash: null,
  },
  {
    id: "N-04", code: "N-04", type: "reminder",
    title: "Daily DR acceptance reminder",
    desc: "Fires every 24 hours while a record sits in a DR-Acpt status. Increments reminder counter. Stops on acceptance or after the A-02 auto-accept fires at Day 7.",
    recipient: { name: "Bryan Koh", role: "DR", empId: "EMP-1071" },
    relatedEmp: { name: "Bryan Koh", empId: "EMP-1071" },
    triggeredBy: "System · A-02 timer",
    triggeredAt: "19 Jun 2026 · 09:34 MYT",
    deliveredAt:  "19 Jun 2026 · 09:34 MYT",
    channel: "In-app banner · reminder badge",
    policy: "A-02 · FRD §4.1",
    status: "Active",
    retries: 4,
    ackBy: null,
    ip: "10.42.88.3",
    sessionId: "SYS-A02-1071-REM4",
    hash: "SHA256-N04BRYAN1071REM4",
  },
  {
    id: "N-05", code: "N-05", type: "signing",
    title: "E-signature dispatch — sign letter",
    desc: "Fired by HRBP after letter generation. Notifies the DR that their probation outcome letter is ready for internal e-signature in FAITH (S-10/F-09).",
    recipient: { name: "Elena Garcia", role: "DR", empId: "EMP-1003" },
    relatedEmp: { name: "Elena Garcia", empId: "EMP-1003" },
    triggeredBy: "Niresha · HRBP (manual dispatch)",
    triggeredAt: "19 Jun 2026 · 09:31 MYT",
    deliveredAt:  "19 Jun 2026 · 09:31 MYT",
    channel: "In-app banner · Outlook (A-14)",
    policy: "S-10 · A-10 · OI-11",
    status: "Pending signature",
    retries: 3,
    ackBy: null,
    ip: "10.42.91.17",
    sessionId: "HRBP-DISPATCH-1003-LT03",
    hash: "SHA256-N05ELENA1003NCONF",
  },
  {
    id: "N-06", code: "N-06", type: "sla",
    title: "Letter SLA alert — HRBP action required",
    desc: "Fires when a Pending-Letter record approaches the 5-business-day SLA window. N-07 (URGENT) escalates once the SLA is breached.",
    recipient: { name: "Niresha", role: "HRBP", empId: "HRBP-001" },
    relatedEmp: { name: "Leon Tan", empId: "EMP-0489" },
    triggeredBy: "System · A-04 SLA monitor",
    triggeredAt: "19 Jun 2026 · 09:33 MYT",
    deliveredAt:  "19 Jun 2026 · 09:33 MYT",
    channel: "In-app banner · SLA tracker badge",
    policy: "A-04 · S-08 · FRD §5.3",
    status: "Urgent",
    retries: 0,
    ackBy: null,
    ip: "10.42.61.9",
    sessionId: "SYS-A04-0489-SLA6",
    hash: "SHA256-N06LEON0489SLA",
  },
  {
    id: "N-07", code: "N-07", type: "sla",
    title: "N-07 URGENT — SLA breached",
    desc: "Fires when the 5-day letter SLA is breached. Flags the record in the SLA Tracker and marks it as breached on the HRBP pipeline.",
    recipient: { name: "Niresha", role: "HRBP", empId: "HRBP-001" },
    relatedEmp: { name: "Leon Tan", empId: "EMP-0489" },
    triggeredBy: "System · A-04 SLA monitor",
    triggeredAt: "19 Jun 2026 · 09:33 MYT",
    deliveredAt:  "19 Jun 2026 · 09:33 MYT",
    channel: "In-app urgent banner · SLA Tracker",
    policy: "A-04 · S-08",
    status: "Breached",
    retries: 0,
    ackBy: null,
    ip: "10.42.61.9",
    sessionId: "SYS-A04-0489-BREACH",
    hash: "SHA256-N07LEON0489BREACH",
  },
  {
    id: "N-08", code: "N-08", type: "signing",
    title: "Daily e-sign reminder",
    desc: "Fires every 24 hours while a sign-off is pending. Stops on signing or manual cancellation.",
    recipient: { name: "Elena Garcia", role: "DR", empId: "EMP-1003" },
    relatedEmp: { name: "Elena Garcia", empId: "EMP-1003" },
    triggeredBy: "System · A-10 signing engine",
    triggeredAt: "19 Jun 2026 · 09:31 MYT",
    deliveredAt:  "19 Jun 2026 · 09:31 MYT",
    channel: "In-app banner · daily cadence",
    policy: "A-10 · S-10",
    status: "Active",
    retries: 3,
    ip: "10.42.91.17",
    sessionId: "SYS-A10-1003-ESIGN3",
    hash: "SHA256-N08ELENA1003ESIGN",
  },
  {
    id: "N-09", code: "N-09", type: "milestone",
    title: "New probation initiated — KPI setup required",
    desc: "Fires when HRBP creates a new probation record. Notifies the assigned LM to set KPIs within the onboarding window.",
    recipient: { name: "Marcus Lee", role: "LM", empId: "LM-001" },
    relatedEmp: { name: "Mei Ling", empId: "EMP-1200" },
    triggeredBy: "Niresha · HRBP (record creation)",
    triggeredAt: "07 Jun 2026 · 11:02 MYT",
    deliveredAt:  "07 Jun 2026 · 11:02 MYT",
    channel: "In-app dashboard · Outlook (A-14)",
    policy: "S-02 · FRD §2.1",
    status: "Delivered",
    retries: 0,
    ackBy: "Marcus Lee · 07 Jun 2026 · 11:15 MYT",
    ip: "10.42.23.188",
    sessionId: "HRBP-CREATE-1200-INIT",
    hash: "SHA256-N09MEILING1200INIT",
  },
  {
    id: "N-10", code: "N-10", type: "milestone",
    title: "Extension cycle commenced — LM notified",
    desc: "Fires when a probation extension is signed. Notifies the LM that the extension cycle has started (Ext-Mth1-Review) — 1 month for M09–M12, 3 months for E08 & below.",
    recipient: { name: "Marcus Lee", role: "LM", empId: "LM-001" },
    relatedEmp: { name: "Karen Soh", empId: "EMP-0512" },
    triggeredBy: "System · A-09 signing engine post-sign",
    triggeredAt: "01 Mar 2026 · 14:22 MYT",
    deliveredAt:  "01 Mar 2026 · 14:22 MYT",
    channel: "In-app dashboard",
    policy: "A-09 · S-10 · FRD §6.1",
    status: "Delivered",
    retries: 0,
    ackBy: null,
    ip: "10.42.44.12",
    sessionId: "SYS-A09-0512-EXTSTART",
    hash: "SHA256-N10KAREN0512EXT",
  },
  {
    id: "N-11", code: "N-11", type: "reminder",
    title: "Escalation raised — HRBP notified (F-06)",
    desc: "Fires when a Line Manager submits an inaccuracy escalation (F-06). Routes to HRBP for review and response.",
    recipient: { name: "Niresha", role: "HRBP", empId: "HRBP-001" },
    relatedEmp: null,
    triggeredBy: "Marcus Lee · LM (F-06 submission)",
    triggeredAt: "On demand",
    deliveredAt:  "On demand",
    channel: "In-app notification · HRBP pipeline flag",
    policy: "F-06 · S-06",
    status: "On demand",
    retries: 0,
    ackBy: null,
    ip: null,
    sessionId: null,
    hash: null,
  },
  {
    id: "N-12", code: "N-12", type: "policy",
    title: "Salary review trigger — Rewards notified (ActingConf)",
    desc: "Fires when an acting confirmation letter is signed. Notifies the Rewards team to initiate salary review and new-role benefits.",
    recipient: { name: "Rewards Team", role: "System", empId: "INT-REWARDS" },
    relatedEmp: null,
    triggeredBy: "System · A-09 signing engine",
    triggeredAt: "On sign",
    deliveredAt:  "On sign",
    channel: "Internal API · Rewards system",
    policy: "A-09 · FRD §7.2",
    status: "On demand",
    retries: 0,
    ackBy: null,
    ip: null,
    sessionId: null,
    hash: null,
  },
  {
    id: "N-13", code: "N-13", type: "policy",
    title: "HOD alert — acting placement or outcome",
    desc: "Notifies the HOD when an acting placement starts (WF2 initiation) or when an acting outcome is confirmed/reversed.",
    recipient: { name: "Ahmad Razif", role: "HOD", empId: "HOD-001" },
    relatedEmp: null,
    triggeredBy: "System · acting placement / outcome sign",
    triggeredAt: "On event",
    deliveredAt:  "On event",
    channel: "In-app HOD pipeline · Outlook (A-14)",
    policy: "WF2 · FRD §7.3",
    status: "On demand",
    retries: 0,
    ackBy: null,
    ip: null,
    sessionId: null,
    hash: null,
  },
  {
    id: "N-15", code: "N-15", type: "milestone",
    title: "HRBP acknowledgement requested — LM outcome decision",
    desc: "Fires when an LM records their outcome decision. Notifies HRBP to review and acknowledge before letter generation can proceed.",
    recipient: { name: "Niresha", role: "HRBP", empId: "HRBP-001" },
    relatedEmp: { name: "Daniel Wong", empId: "EMP-1100" },
    triggeredBy: "Marcus Lee · LM (outcome decision recorded)",
    triggeredAt: "19 Jun 2026 · 09:00 MYT",
    deliveredAt:  "19 Jun 2026 · 09:00 MYT",
    channel: "In-app pipeline badge · HRBP dashboard",
    policy: "S-07 · F-05 · FRD §5.1",
    status: "Pending ack",
    retries: 0,
    ackBy: null,
    ip: "10.42.31.5",
    sessionId: "LM-OUTCOME-1100-ACK",
    hash: "SHA256-N15DANIEL1100ACK",
  },
  {
    id: "N-16", code: "N-16", type: "reminder",
    title: "HRBP returned outcome — LM reconsideration required",
    desc: "Fires when HRBP returns an LM outcome decision. The LM must review the remarks and re-record their decision.",
    recipient: { name: "Marcus Lee", role: "LM", empId: "LM-001" },
    relatedEmp: null,
    triggeredBy: "System · HRBP return action",
    triggeredAt: "On event",
    deliveredAt:  "On event",
    channel: "In-app dashboard · LM case panel",
    policy: "S-07 · F-05",
    status: "On demand",
    retries: 0,
    ackBy: null,
    ip: null,
    sessionId: null,
    hash: null,
  },
];

const TYPE_META = {
  milestone: { icon: Clock,         colour: "text-indigo-600 bg-indigo-50",  label: "Milestone"  },
  reminder:  { icon: Bell,          colour: "text-amber-600  bg-amber-50",   label: "Reminder"   },
  sla:       { icon: AlertTriangle, colour: "text-rose-600   bg-rose-50",    label: "SLA"        },
  signing:   { icon: Mail,          colour: "text-cyan-600   bg-cyan-50",    label: "Signing"    },
  policy:    { icon: Gavel,         colour: "text-emerald-600 bg-emerald-50",label: "Policy"     },
  auto:      { icon: Cpu,           colour: "text-slate-500  bg-slate-100",  label: "Automation" },
};

const STATUS_COLOUR = {
  "Delivered":        "bg-emerald-50 text-emerald-700",
  "Scheduled":        "bg-blue-50 text-blue-700",
  "Queued":           "bg-slate-100 text-slate-600",
  "Active":           "bg-amber-50 text-amber-700",
  "Urgent":           "bg-rose-50 text-rose-600",
  "Breached":         "bg-rose-100 text-rose-700 font-bold",
  "Pending signature":"bg-violet-50 text-violet-700",
  "Pending ack":      "bg-cyan-50 text-cyan-700",
  "On demand":        "bg-slate-100 text-slate-500",
  "Enforced":         "bg-indigo-50 text-indigo-700",
};

function DigitalFootprint({ n }) {
  const rows = [
    ["Notification ID",  n.code],
    ["Session / Ref",    n.sessionId || "—"],
    ["Triggered by",     n.triggeredBy],
    ["Triggered at",     n.triggeredAt],
    ["Delivered at",     n.deliveredAt],
    ["Delivery channel", n.channel],
    ["Source IP",        n.ip || "—"],
    ["Integrity hash",   n.hash || "—"],
    ["Policy ref",       n.policy],
    ["Recipient role",   n.recipient.role],
    ["Recipient ID",     n.recipient.empId],
    ["Retries",          String(n.retries)],
    ["Acknowledged by",  n.ackBy || "—"],
  ];
  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
        <Shield size={11} /> Digital Fingerprint &amp; Delivery Trace
      </div>
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 border-b border-slate-50 py-1 text-xs">
            <span className="text-slate-400 shrink-0">{k}</span>
            <span className="text-slate-700 text-right" style={{ fontFamily: "var(--mono)", fontSize: "10.5px" }}>{v}</span>
          </div>
        ))}
      </div>
      {n.relatedEmp && (
        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
          <User size={11} />
          <span>Related employee:</span>
          <span className="font-semibold text-slate-700">{n.relatedEmp.name}</span>
          <Mono className="text-[10px] text-slate-400">{n.relatedEmp.empId}</Mono>
        </div>
      )}
    </div>
  );
}

function NotifRow({ n }) {
  const [open, setOpen] = useState(false);
  const meta = TYPE_META[n.type] || TYPE_META.auto;
  const Icon = meta.icon;

  return (
    <div className={`border-b border-slate-50 transition-colors ${open ? "bg-slate-50/60" : "hover:bg-slate-50/40"}`}>
      <button
        className="w-full flex items-start gap-4 px-5 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <div className={`grid place-items-center w-9 h-9 rounded-lg shrink-0 mt-0.5 ${meta.colour}`}>
          <Icon size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Mono className="text-[10px] text-slate-400">{n.code}</Mono>
            <span className="text-sm font-semibold text-slate-800">{n.title}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><User size={10} /> {n.recipient.name} · {n.recipient.role}</span>
            <span>·</span>
            <span className="flex items-center gap-1"><Send size={10} /> {n.deliveredAt}</span>
            {n.retries > 0 && <><span>·</span><span className="text-amber-600">{n.retries} reminder{n.retries !== 1 ? "s" : ""} sent</span></>}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Tag className={STATUS_COLOUR[n.status] || "bg-slate-100 text-slate-500"}>{n.status}</Tag>
          {open ? <ChevronDown size={15} className="text-slate-400" /> : <ChevronRight size={15} className="text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-slate-600 leading-relaxed mb-1">{n.desc}</p>
          <DigitalFootprint n={n} />
        </div>
      )}
    </div>
  );
}

const TYPES = ["all", "milestone", "reminder", "sla", "signing", "policy"];

export default function NotificationCenter() {
  const [tab, setTab]   = useState("all");
  const [q, setQ]       = useState("");

  const filtered = NOTIFS.filter((n) => {
    const matchType = tab === "all" || n.type === tab;
    const matchQ    = !q || (n.title + n.code + n.recipient.name + n.policy).toLowerCase().includes(q.toLowerCase());
    return matchType && matchQ;
  });

  const counts = {
    delivered: NOTIFS.filter((n) => n.status === "Delivered").length,
    active:    NOTIFS.filter((n) => ["Active", "Pending signature", "Pending ack"].includes(n.status)).length,
    urgent:    NOTIFS.filter((n) => ["Urgent", "Breached"].includes(n.status)).length,
    scheduled: NOTIFS.filter((n) => ["Scheduled", "Queued"].includes(n.status)).length,
  };

  return (
    <div className="fadeUp">
      <PageHead
        code="S-05 · Notification Engine"
        title="Notification Engine"
        sub="All 16 system notifications (N-01 → N-16). Click any row to expand delivery trace and digital fingerprint. Dispatcher runs natively — no third-party email dependency for in-app alerts."
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="Delivered"       value={counts.delivered} icon={CheckCircle2} tone="emerald" />
        <Stat label="Active / pending" value={counts.active}   icon={Activity}     tone="amber"   />
        <Stat label="Urgent / breach"  value={counts.urgent}   icon={AlertTriangle} tone="rose"   />
        <Stat label="Scheduled"        value={counts.scheduled} icon={Clock}                      />
      </div>

      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {TYPES.map((t) => {
          const on = tab === t;
          return (
            <button key={t} onClick={() => setTab(t)} className={`text-sm px-3 py-1.5 rounded-lg font-medium transition capitalize ${on ? "text-white" : "text-slate-600 bg-white ring-1 ring-slate-200 hover:bg-slate-50"}`} style={on ? { background: "var(--brand)" } : {}}>
              {t === "all" ? `All (${NOTIFS.length})` : TYPE_META[t]?.label || t}
            </button>
          );
        })}
        <div className="flex items-center gap-2 ml-auto bg-white ring-1 ring-slate-200 rounded-lg px-3 py-1.5">
          <Search size={13} className="text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="text-sm outline-none bg-transparent placeholder:text-slate-400 w-36" />
        </div>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <RefreshCw size={11} /> Dispatcher online · {filtered.length} notification{filtered.length !== 1 ? "s" : ""}
          </span>
          <Tag className="bg-emerald-50 text-emerald-700 text-[10px]">Internal · no third-party dependency</Tag>
        </div>
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">No notifications match your filter.</div>
        ) : (
          filtered.map((n) => <NotifRow key={n.id} n={n} />)
        )}
      </Card>

      <p className="text-xs text-slate-400 mt-3 leading-relaxed">
        External Outlook sync (A-14) enabled via Control Centre. Open items: OI-11 (legal sign-off on e-signature format), OI-05 (7-year notification log retention).
      </p>
    </div>
  );
}
