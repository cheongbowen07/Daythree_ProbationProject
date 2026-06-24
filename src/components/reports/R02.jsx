import { useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Empty, StatusBadge, Tag } from "../ui";
import ReportShell, { exportReport } from "./ReportShell";

export default function R02({ records, role, onReportExport, exportRef }) {
  const rows = records.filter((r) => r.slaBreached || r.reminders >= 3);

  function exp(format) {
    const head = ["Employee", "Emp ID", "Line Manager", "Status", "Issue", "SLA Days", "Reminders Sent"];
    const data = rows.map((r) => [r.name, r.empId, r.lm, r.status, r.slaBreached ? "SLA Breach" : "Reminders ≥ 3", r.slaDays ?? "—", r.reminders ?? 0]);
    exportReport(format, "R-02", "Overdue / At-Risk", head, data, "R02-overdue.csv", role, onReportExport, {
      scope: "Organisation-wide",
      colWidths: [22, 14, 22, 28, 18, 12, 16],
    });
  }

  useEffect(() => { if (exportRef) exportRef.current = exp; });

  return (
    <ReportShell code="R-02" title="Overdue / At-Risk" onExport={exp}>
      {rows.length === 0
        ? <Empty icon={CheckCircle2} title="Nothing overdue" sub="No SLA breaches or stalled acceptances in scope." />
        : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="py-2 font-medium">Employee</th>
                <th className="py-2 font-medium">LM</th>
                <th className="py-2 font-medium">Status</th>
                <th className="py-2 font-medium">Issue</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-slate-50">
                  <td className="py-2.5 font-medium text-slate-700">{r.name}</td>
                  <td className="py-2.5 text-slate-500">{r.lm}</td>
                  <td className="py-2.5"><StatusBadge status={r.status} sm /></td>
                  <td className="py-2.5">
                    {r.slaBreached
                      ? <Tag className="bg-rose-100 text-rose-700">SLA breach</Tag>
                      : <Tag className="bg-amber-100 text-amber-700">Reminders 3+</Tag>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </ReportShell>
  );
}
