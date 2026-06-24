import { useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { statusGroup } from "../../utils/status";
import ReportShell, { exportReport } from "./ReportShell";

export default function R01({ records, aggregate, role, onReportExport, exportRef }) {
  const groups = {};
  records.forEach((r) => { const g = statusGroup(r.status); groups[g] = (groups[g] || 0) + 1; });
  const data    = Object.entries(groups).map(([name, value]) => ({ name, value }));
  const byGrade = [
    { name: "E08 & below", value: records.filter((r) => r.gradeBand === "E08_below").length },
    { name: "M09–M12",     value: records.filter((r) => r.gradeBand === "M09_M12").length },
  ];

  function exp(format) {
    const head = ["Status Group", "Count", "Grade Band", "Grade Count"];
    const rows = data.map((d, i) => [d.name, d.value, byGrade[i]?.name ?? "", byGrade[i]?.value ?? ""]);
    exportReport(format, "R-01", "Probation Status Summary", head, rows, "R01-status-summary.csv", role, onReportExport, {
      scope: aggregate ? "Aggregate" : "Organisation-wide",
      colWidths: [32, 12, 20, 14],
    });
  }

  useEffect(() => { if (exportRef) exportRef.current = exp; });

  return (
    <ReportShell code="R-01" title="Probation Status Summary" onExport={exp}>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6E6E6E" }} interval={0} angle={-12} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11, fill: "#9D9990" }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#5D3FD3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">By grade band</div>
          {byGrade.map((g) => (
            <div key={g.name} className="flex items-center justify-between py-2 border-b border-slate-50 text-sm">
              <span className="text-slate-600">{g.name}</span>
              <span className="font-semibold text-slate-800">{g.value}</span>
            </div>
          ))}
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-slate-600">Total {aggregate ? "(aggregate)" : ""}</span>
            <span className="font-semibold text-slate-800">{records.length}</span>
          </div>
        </div>
      </div>
    </ReportShell>
  );
}
