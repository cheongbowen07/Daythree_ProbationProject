import { useState } from "react";
import { Search, Bell, Users, ClipboardList, CheckCircle2, ChevronRight } from "lucide-react";
import { LM_SELF, OUTCOME_LABEL } from "../../constants";
import { isActiveProbation, pendingFor, statusRank, defaultRowOrder, statusLabel } from "../../utils/status";
import { daysCap, totalCycles } from "../../utils/lifecycle";
import { Card, StatusBadge, PageHead, Mono, Stat, SortTh, Pager } from "../ui";
import { useSort } from "../../utils/useSort";

function dashLabel(s, outcome) {
  if (s === "Complete-Conf" || s === "Complete-NConf") return undefined;
  let m;
  if ((m = s.match(/^Mth(\d)-(?:Review|DR-Acpt)$/)))     return `Month ${m[1]}`;
  if ((m = s.match(/^Ext-Mth(\d)-(?:Review|DR-Acpt)$/))) return `Extension – Month ${m[1]}`;
  if (s === "HRBP-Ack" || s === "HRBP-Ack(Acting)") {
    const ol = outcome ? OUTCOME_LABEL[outcome] : null;
    return ol ? `HRBP Acknowledgement – ${ol}` : "HRBP Acknowledgement";
  }
  if (s === "Pending-Letter" || s === "Pending-Letter(Acting)") return "Pending Letter from HRBP";
  if (s === "Pending-NConf-Sign-Off")  return "Pending Non-Confirmation Sign-Off";
  return statusLabel(s);
}

export default function LMDashboard({ records, onOpen }) {
  const [q, setQ]           = useState("");
  const [page, setPage]     = useState(0);
  const PAGE_SIZE = 10;

  const { sort, toggle, sortRows } = useSort({
    name:        (r) => r.name,
    joined:      (r) => new Date(r.joined).getTime() || 0,
    status:      (r) => statusRank(r.status),
    daysLeft:    (r) => (isActiveProbation(r.status) ? Math.max(0, daysCap(r) - r.day) : -1),
    months:      (r) => r.currentCycle || 0,
  }, defaultRowOrder("LM"));

  const team     = records.filter((r) => r.lm === LM_SELF && r.wf !== "WF2");
  const searched = team.filter((r) => (r.name + r.empId).toLowerCase().includes(q.toLowerCase()));
  const filtered = sortRows(searched);
  const pendingRows  = team.filter((r) => pendingFor(r, "LM"));
  const pending      = pendingRows.length;
  const activeOther  = team.filter((r) => isActiveProbation(r.status) && !pendingFor(r, "LM")).length;
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const safePage  = Math.min(page, Math.max(0, pageCount - 1));
  const paged     = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  return (
    <div className="fadeUp h-full min-h-0 flex flex-col">
      <PageHead
        code="S-01 · MyTeamProb"
        title="My Team Probation"
        className="mb-3"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        <Stat label="Direct reports"    value={team.length}   icon={Users}          />
        <Stat label="Pending my action" value={pending}       icon={Bell}           tone="amber"   />
        <Stat label="Active"            value={activeOther}   icon={ClipboardList}  />
        <Stat label="Completed"         value={team.filter((r) => !isActiveProbation(r.status)).length} icon={CheckCircle2} tone="emerald" />
      </div>

      <Card className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <Search size={16} className="text-slate-400" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search name or employee ID…" className="flex-1 text-sm outline-none placeholder:text-slate-400 bg-transparent" />
        </div>
        <div className="flex-1 min-h-0 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <SortTh label="Employee" sortKey="name" sort={sort} onSort={toggle} />
                <SortTh label="Start date" sortKey="joined" sort={sort} onSort={toggle} />
                <SortTh label="Days remaining" sortKey="daysLeft" sort={sort} onSort={toggle} />
                <SortTh label="Months" sortKey="months" sort={sort} onSort={toggle} />
                <SortTh label="Status" sortKey="status" sort={sort} onSort={toggle} />
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((r) => {
                const due = pendingFor(r, "LM");
                const isKpiStage    = r.status.startsWith("KPI-Review");
                const isReviewStage = !isKpiStage && /-Review$/.test(r.status);
                const actionLabel   = due ? (isKpiStage ? "KPI Review due" : "Action due") : "View";
                let statusLabel = dashLabel(r.status, r.outcome);
                if (due && isReviewStage) {
                  let m;
                  if ((m = r.status.match(/^Mth(\d+)-Review$/)))     statusLabel = `Month ${m[1]} Review`;
                  if ((m = r.status.match(/^Ext-Mth(\d+)-Review$/))) statusLabel = `Extension – Month ${m[1]} Review`;
                }
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/70 cursor-pointer" onClick={() => onOpen(r.id)}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800 flex items-center gap-2">
                        {r.name} {due && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Action overdue" />}
                      </div>
                      <Mono className="text-[11px] text-slate-400">{r.empId}</Mono>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{r.joined || "—"}</td>
                    <td className="px-4 py-3">
                      {isActiveProbation(r.status)
                        ? <Mono className={`text-xs ${daysCap(r) - r.day <= 7 ? "text-rose-600 font-semibold" : "text-slate-500"}`}>{Math.max(0, daysCap(r) - r.day)}d</Mono>
                        : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Mono className="text-xs text-slate-500">{r.currentCycle || 0}/{totalCycles(r)}</Mono>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} sm label={statusLabel} toneKey={/^(Ext-)?Mth\d-(Review|DR-Acpt)$/.test(r.status) ? "review" : undefined} /></td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${due ? "text-cyan-700" : "text-slate-400"}`}>
                        {actionLabel} <ChevronRight size={14} />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Pager page={safePage} pageCount={pageCount} total={filtered.length} pageSize={PAGE_SIZE} onPage={setPage} />
      </Card>
    </div>
  );
}
