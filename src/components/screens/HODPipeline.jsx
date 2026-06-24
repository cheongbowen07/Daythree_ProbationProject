import { useState } from "react";
import { Users, CheckCircle2, Clock, Bell, ChevronRight, Lock } from "lucide-react";
import { HOD_DEPT, HOD_SELF, EVENT_META } from "../../constants";
import { isActiveProbation } from "../../utils/status";
import { Card, PageHead, StatusBadge, Tag, Mono, Stat } from "../ui";

const STATUS_LABELS = {
  "LM-Outcome": "Outcome pending LM",
  "LM-Outcome(Acting)": "Outcome pending LM",
  "Ext-LM-Outcome": "Outcome pending LM",
};

export default function HODPipeline({ records, audit, view }) {
  const dept    = records.filter((r) => r.dept === HOD_DEPT);
  const [q, setQ] = useState("");

  const filtered = dept.filter((r) =>
    (r.name + r.empId + r.lm + r.status).toLowerCase().includes(q.toLowerCase())
  );

  const lms = [...new Set(dept.map((r) => r.lm))];

  if (view === "notifications") {
    const deptEmpIds = new Set(dept.map((r) => r.empId));
    const events = audit.filter((e) => deptEmpIds.has(e.empId)).slice(0, 50);
    return (
      <div className="fadeUp">
        <PageHead
          code="N-15 · HOD Notifications"
          title="Status Notifications"
          sub={`${HOD_DEPT} department · read-only feed of all status changes. You are notified automatically on every transition.`}
        />
        <Card className="p-0">
          <div className="px-4 py-3 border-b border-slate-100 text-xs text-slate-400 font-medium uppercase tracking-wider">
            Recent activity · {dept.length} employees
          </div>
          {events.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">No activity yet.</div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-[600px] overflow-y-auto">
              {events.map((e) => {
                const meta = EVENT_META[e.type] || ["Event", "text-slate-600 bg-slate-100"];
                const rec  = dept.find((r) => r.empId === e.empId);
                return (
                  <div key={e.id} className="flex items-start gap-3 px-4 py-3">
                    <span className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded ${meta[1]}`} style={{ fontFamily: "var(--mono)" }}>{meta[0]}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-slate-700">{e.detail}</div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 flex-wrap">
                        <Mono>{e.ts}</Mono>
                        {rec && <><span>·</span><span className="font-medium text-slate-600">{rec.name}</span></>}
                        <span>· by {e.actor}</span>
                      </div>
                    </div>
                    {e.next && (
                      <Mono className="text-[10px] text-slate-400 shrink-0">{e.next}</Mono>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="fadeUp">
      <PageHead
        code="S-06 · HOD View"
        title={`${HOD_DEPT} Department Pipeline`}
        sub={`${HOD_SELF} · ${dept.length} employees across ${lms.length} line manager(s). View-only — actions are performed by Line Managers and HRBP.`}
        right={
          <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 ring-1 ring-slate-200 px-3 py-1.5 rounded-lg font-medium">
            <Lock size={12} /> View only
          </span>
        }
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="Active"      value={dept.filter((r) => isActiveProbation(r.status)).length}            icon={Users} />
        <Stat label="Confirmed"   value={dept.filter((r) => r.status === "Complete-Conf").length}            icon={CheckCircle2} tone="emerald" />
        <Stat label="Pending letter" value={dept.filter((r) => r.status.includes("Pending-Letter") || r.status.includes("LM-Outcome")).length} icon={Clock} tone="amber" />
        <Stat label="Line managers" value={lms.length}                                                       icon={Bell} />
      </div>

      <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 ring-1 ring-slate-200">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, ID, LM, or status…"
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400"
        />
      </div>

      <div className="space-y-4">
        {lms.map((lm) => {
          const lmRecs = filtered.filter((r) => r.lm === lm);
          if (!lmRecs.length) return null;
          return (
            <div key={lm}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Users size={12} /> {lm}
                <span className="font-normal normal-case">· {lmRecs.length} employee{lmRecs.length !== 1 ? "s" : ""}</span>
              </div>
              <Card className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                        <th className="px-4 py-2.5 font-medium">Employee</th>
                        <th className="px-4 py-2.5 font-medium">Grade</th>
                        <th className="px-4 py-2.5 font-medium">Type</th>
                        <th className="px-4 py-2.5 font-medium">Status</th>
                        <th className="px-4 py-2.5 font-medium">Emp. Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lmRecs.map((r) => (
                        <tr key={r.id} className="border-b border-slate-50">
                          <td className="px-4 py-3">
                            <div className="font-medium text-slate-800">{r.name}</div>
                            <Mono className="text-[11px] text-slate-400">{r.empId}</Mono>
                          </td>
                          <td className="px-4 py-3">
                            <Tag className="bg-slate-100 text-slate-600">{r.grade}</Tag>
                          </td>
                          <td className="px-4 py-3">
                            <Tag className={r.wf === "WF2" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}>
                              {r.wf === "WF2" ? "Acting" : "New-hire"}
                            </Tag>
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={r.status} sm />
                            {STATUS_LABELS[r.status] && (
                              <div className="text-[10px] text-amber-600 mt-0.5">{STATUS_LABELS[r.status]}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{r.employmentStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <Card className="py-12 text-center text-sm text-slate-400">No records match your search.</Card>
        )}
      </div>
    </div>
  );
}
