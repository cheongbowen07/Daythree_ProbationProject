import { useEffect } from "react";
import { Briefcase } from "lucide-react";
import { totalCycles } from "../../utils/lifecycle";
import { Empty, Tag, Mono, StatusBadge } from "../ui";
import ReportShell, { exportReport } from "./ReportShell";

export default function R05({ records, aggregate, role, onReportExport, exportRef }) {
  const acting = records.filter((r) => r.wf === "WF2");

  function exp(format) {
    const head = ["Employee", "Emp ID", "Acting Grade", "Monthly Allowance", "Cycle Progress", "Start Date", "Status", "Employment Status"];
    const rows = acting.map((r) => [
      aggregate ? "(withheld)" : r.name,
      aggregate ? "(withheld)" : r.empId,
      r.acting?.grade ?? "—",
      r.acting?.allowance ?? "—",
      `${r.currentCycle} of ${totalCycles(r)}`,
      r.acting?.start ?? "—",
      r.status,
      r.employmentStatus,
    ]);
    exportReport(format, "R-05", "Acting Probation Pipeline", head, rows, "R05-acting-pipeline.csv", role, onReportExport, {
      scope: aggregate ? "Aggregate (names withheld — BR-26)" : "Organisation-wide",
      colWidths: [22, 14, 16, 20, 16, 16, 28, 28],
    });
  }

  useEffect(() => { if (exportRef) exportRef.current = exp; });

  return (
    <ReportShell code="R-05" title="Acting Probation Pipeline" onExport={exp}>
      {acting.length === 0
        ? <Empty icon={Briefcase} title="No acting probations" sub="WF2 acting-role cases appear here." />
        : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  {!aggregate && <th className="py-2 font-medium">Employee</th>}
                  <th className="py-2 font-medium">Acting grade</th>
                  <th className="py-2 font-medium">Allowance</th>
                  <th className="py-2 font-medium">Cycle</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {acting.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50">
                    {!aggregate && <td className="py-2.5 font-medium text-slate-700">{r.name}</td>}
                    <td className="py-2.5"><Tag className="bg-violet-50 text-violet-700">{r.acting && r.acting.grade}</Tag></td>
                    <td className="py-2.5 text-slate-600">{r.acting && r.acting.allowance}</td>
                    <td className="py-2.5"><Mono className="text-slate-500">{r.currentCycle}/{totalCycles(r)}</Mono></td>
                    <td className="py-2.5"><StatusBadge status={r.status} sm /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {aggregate && <p className="text-xs text-slate-400 mt-3">Leadership view shows counts, grades, and outcome status only — employee names are withheld (BR-26).</p>}
          </>
        )}
    </ReportShell>
  );
}
