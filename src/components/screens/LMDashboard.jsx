import { useState } from "react";
import { Search, Bell, Users, ClipboardList, CheckCircle2, ChevronRight, AlertTriangle, Plus, UserPlus } from "lucide-react";
import { LM_SELF } from "../../constants";
import { isActiveProbation, pendingFor } from "../../utils/status";
import { daysCap, totalCycles } from "../../utils/lifecycle";
import { Card, StatusBadge, Tag, PageHead, Mono, Stat, Btn } from "../ui";
import DRListEscalateModal from "../modals/DRListEscalateModal";
import InitiateModal from "../modals/InitiateModal";

export default function LMDashboard({ records, onOpen, onDRListEscalate, onAdd }) {
  const [q, setQ]           = useState("");
  const [tab, setTab]       = useState("all");
  const [showEscalate, setShowEscalate] = useState(false);
  const [addOpen, setAddOpen]           = useState(false);
  const [addWf, setAddWf]               = useState("WF1");

  const team     = records.filter((r) => r.lm === LM_SELF);
  const acting   = team.filter((r) => r.wf === "WF2");
  const view     = tab === "acting" ? acting : team;
  const filtered = view.filter((r) => (r.name + r.empId).toLowerCase().includes(q.toLowerCase()));
  const pending  = team.filter((r) => pendingFor(r, "LM")).length;

  return (
    <div className="fadeUp">
      <PageHead
        code="S-01 · MyTeamProb"
        title="My Team Probation"
        sub={`${LM_SELF} · ${team.length} direct reports. Scope is enforced by A-08 — managers see only their own team.`}
        right={
          <div className="flex items-center gap-2">
            <Btn size="sm" icon={Plus} onClick={() => { setAddWf("WF1"); setAddOpen(true); }}>New-hire (F-01)</Btn>
            <Btn size="sm" variant="ghost" icon={UserPlus} onClick={() => { setAddWf("WF2"); setAddOpen(true); }} className="text-violet-700 ring-violet-200 hover:bg-violet-50">Acting-role (F-10)</Btn>
            <Btn variant="ghost" size="sm" icon={AlertTriangle} onClick={() => setShowEscalate(true)} className="text-amber-600 ring-amber-200 hover:bg-amber-50">Report inaccuracy</Btn>
          </div>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="Direct reports"   value={team.length}                                               icon={Users}          />
        <Stat label="Pending my action" value={pending}                                                  icon={Bell}    tone="amber"   />
        <Stat label="In review cycle"  value={team.filter((r) => /Mth/.test(r.status)).length}          icon={ClipboardList}  />
        <Stat label="Completed"        value={team.filter((r) => !isActiveProbation(r.status)).length}  icon={CheckCircle2} tone="emerald" />
      </div>

      {/* S-11 tab switcher */}
      <div className="flex gap-1 mb-4 border-b border-slate-200">
        {[["all", "All probations", `S-01`], ["acting", `Acting-role (WF2) · S-11`, `${acting.length}`]].map(([key, label, badge]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition flex items-center gap-2 ${tab === key ? "border-violet-500 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${tab === key ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-500"}`}>{badge}</span>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <Search size={16} className="text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or employee ID…" className="flex-1 text-sm outline-none placeholder:text-slate-400 bg-transparent" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="px-4 py-2.5 font-medium">Employee</th>
                <th className="px-4 py-2.5 font-medium">Grade</th>
                {tab === "acting"
                  ? <><th className="px-4 py-2.5 font-medium">Acting grade</th><th className="px-4 py-2.5 font-medium">Allowance</th><th className="px-4 py-2.5 font-medium">Acting since</th></>
                  : <th className="px-4 py-2.5 font-medium">Type</th>}
                <th className="px-4 py-2.5 font-medium">Start date</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Days remaining</th>
                <th className="px-4 py-2.5 font-medium">Months</th>
                <th className="px-4 py-2.5 font-medium">Owner</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const due = pendingFor(r, "LM");
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/70 cursor-pointer" onClick={() => onOpen(r.id)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 flex items-center gap-2">
                        {r.name} {due && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Action overdue" />}
                      </div>
                      <Mono className="text-[11px] text-slate-400">{r.empId}</Mono>
                    </td>
                    <td className="px-4 py-3"><Tag className="bg-slate-100 text-slate-600">{r.grade}</Tag></td>
                    {tab === "acting"
                      ? <>
                          <td className="px-4 py-3"><Tag className="bg-violet-50 text-violet-700">{r.acting?.grade || "—"}</Tag></td>
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{r.acting?.allowance || "—"}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{r.acting?.start || "—"}</td>
                        </>
                      : <td className="px-4 py-3"><Tag className={r.wf === "WF2" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}>{r.wf === "WF2" ? "Acting" : "New-hire"}</Tag></td>}
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{r.joined || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} sm /></td>
                    <td className="px-4 py-3">
                      {isActiveProbation(r.status)
                        ? <Mono className={`text-xs ${daysCap(r) - r.day <= 7 ? "text-rose-600 font-semibold" : "text-slate-500"}`}>{Math.max(0, daysCap(r) - r.day)}d</Mono>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Mono className="text-xs text-slate-500">{r.currentCycle || 0}/{totalCycles(r)}</Mono>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{r.lm}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${due ? "text-cyan-700" : "text-slate-400"}`}>
                        {due ? "Action due" : "View"} <ChevronRight size={14} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {addOpen && (
        <InitiateModal
          defaultWf={addWf}
          onClose={() => setAddOpen(false)}
          onAdd={(r) => { onAdd?.(r); setAddOpen(false); }}
        />
      )}

      {showEscalate && (
        <DRListEscalateModal
          onClose={() => setShowEscalate(false)}
          onSubmit={(type, ref, desc) => { onDRListEscalate(type, ref, desc); setShowEscalate(false); }}
        />
      )}
    </div>
  );
}
