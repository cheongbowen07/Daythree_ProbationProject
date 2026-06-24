import { useState } from "react";
import { Users, FileText, AlertTriangle, PenLine, ChevronRight, Plus } from "lucide-react";
import { daysCap } from "../../utils/lifecycle";
import { isActiveProbation } from "../../utils/status";
import { Card, PageHead, StatusBadge, Tag, Mono, Stat, Btn } from "../ui";
import InitiateModal from "../modals/InitiateModal";

export default function HRBPPipeline({ records, onOpen, onAdd }) {
  const [addOpen, setAddOpen] = useState(false);
  const TABS = [
    ["all",    "All cases"],
    ["action", "Needs my action"],
    ["sla",    "SLA at risk"],
    ["ext",    "Extended"],
    ["sign",   "Awaiting sign-off"],
  ];
  const [tab, setTab] = useState("all");

  const f = records.filter((r) => {
    if (tab === "action") return ["Pending-Letter", "Pending-Letter(Acting)", "Ext-Pending-Letter", "HRBP-Ack", "HRBP-Ack(Acting)", "Ext-HRBP-Ack"].includes(r.status);
    if (tab === "sla")    return r.slaBreached || ((r.slaDays || 0) >= 4 && r.status.includes("Pending-Letter"));
    if (tab === "ext")    return r.phase === "EXT";
    if (tab === "sign")   return /Sign-Off$/.test(r.status);
    return true;
  });

  return (
    <div className="fadeUp">
      <PageHead
        code="S-06 · HRBP Pipeline"
        title="Probation Pipeline"
        sub="Organisation-wide visibility across all line managers and both workflows. HRBP initiates probation and is the sole owner of letter generation."
        right={<Btn icon={Plus} onClick={() => setAddOpen(true)}>Initiate probation</Btn>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="Active probations"  value={records.filter((r) => isActiveProbation(r.status)).length}         icon={Users}          />
        <Stat label="Letters pending"    value={records.filter((r) => r.status.includes("Pending-Letter")).length} icon={FileText}  tone="amber" />
        <Stat label="SLA breached"       value={records.filter((r) => r.slaBreached).length}                       icon={AlertTriangle} tone="amber" />
        <Stat label="Awaiting signature" value={records.filter((r) => /Sign-Off$/.test(r.status)).length}          icon={PenLine}        />
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {TABS.map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`text-sm px-3 py-1.5 rounded-lg font-medium transition ${tab === k ? "text-white" : "text-slate-600 bg-white ring-1 ring-slate-200 hover:bg-slate-50"}`} style={tab === k ? { background: "var(--brand)" } : {}}>
            {l}
          </button>
        ))}
      </div>

      {addOpen && <InitiateModal onClose={() => setAddOpen(false)} onAdd={(r) => { onAdd(r); setAddOpen(false); }} />}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="px-4 py-2.5 font-medium">Employee</th>
                <th className="px-4 py-2.5 font-medium">LM</th>
                <th className="px-4 py-2.5 font-medium">Grade</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Day</th>
                <th className="px-4 py-2.5 font-medium">SLA</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {f.map((r) => {
                const ackDue    = ["HRBP-Ack", "HRBP-Ack(Acting)", "Ext-HRBP-Ack"].includes(r.status);
                const letterDue = ["Pending-Letter", "Pending-Letter(Acting)", "Ext-Pending-Letter"].includes(r.status);
                const actionLabel = ackDue ? "Acknowledge" : letterDue ? "Generate letter" : "View";
                const actionColor = (ackDue || letterDue) ? "text-cyan-700" : "text-slate-400";
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/70 cursor-pointer" onClick={() => onOpen(r.id)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{r.name}</div>
                      <Mono className="text-[11px] text-slate-400">{r.empId}</Mono>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{r.lm}</td>
                    <td className="px-4 py-3"><Tag className="bg-slate-100 text-slate-600">{r.grade}</Tag></td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} sm />
                      {ackDue && r.outcome && <div className="text-[10px] text-amber-600 mt-0.5">LM: {r.outcome}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <Mono className="text-xs text-slate-500">{r.day}/{daysCap(r)}</Mono>
                    </td>
                    <td className="px-4 py-3">
                      {r.status.includes("Pending-Letter")
                        ? r.slaBreached
                          ? <Tag className="bg-rose-100 text-rose-700">BREACHED</Tag>
                          : <Mono className="text-xs text-slate-500">{r.slaDays || 0}/3 d</Mono>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${actionColor}`}>
                        {actionLabel} <ChevronRight size={14} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
