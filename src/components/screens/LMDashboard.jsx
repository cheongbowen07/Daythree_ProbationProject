import { useState } from "react";
import { Plus, Search, Bell, Users, ClipboardList, CheckCircle2, ChevronRight } from "lucide-react";
import { LM_SELF } from "../../constants";
import { isActiveProbation, pendingFor } from "../../utils/status";
import { daysCap } from "../../utils/lifecycle";
import { Card, Btn, StatusBadge, Tag, PageHead, Mono, Stat } from "../ui";
import InitiateModal from "../modals/InitiateModal";

export default function LMDashboard({ records, onOpen, onAdd }) {
  const [q, setQ]           = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const team     = records.filter((r) => r.lm === LM_SELF);
  const filtered = team.filter((r) => (r.name + r.empId).toLowerCase().includes(q.toLowerCase()));
  const pending  = team.filter((r) => pendingFor(r, "LM")).length;

  return (
    <div className="fadeUp">
      <PageHead
        code="S-01 · MyTeamProb"
        title="My Team Probation"
        sub={`${LM_SELF} · ${team.length} direct reports. Scope is enforced by A-08 — managers see only their own team.`}
        right={<Btn icon={Plus} onClick={() => setAddOpen(true)}>Initiate probation</Btn>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="Direct reports"   value={team.length}                                               icon={Users}          />
        <Stat label="Pending my action" value={pending}                                                  icon={Bell}    tone="amber"   />
        <Stat label="In review cycle"  value={team.filter((r) => /Mth/.test(r.status)).length}          icon={ClipboardList}  />
        <Stat label="Completed"        value={team.filter((r) => !isActiveProbation(r.status)).length}  icon={CheckCircle2} tone="emerald" />
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
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Day</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
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
                        {r.name} {due && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                      </div>
                      <Mono className="text-[11px] text-slate-400">{r.empId}</Mono>
                    </td>
                    <td className="px-4 py-3"><Tag className="bg-slate-100 text-slate-600">{r.grade}</Tag></td>
                    <td className="px-4 py-3"><Tag className={r.wf === "WF2" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}>{r.wf === "WF2" ? "Acting" : "New-hire"}</Tag></td>
                    <td className="px-4 py-3 text-slate-500"><Mono>{r.day}/{daysCap(r)}</Mono></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} sm /></td>
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

      {addOpen && <InitiateModal onClose={() => setAddOpen(false)} onAdd={(r) => { onAdd(r); setAddOpen(false); }} />}
    </div>
  );
}
