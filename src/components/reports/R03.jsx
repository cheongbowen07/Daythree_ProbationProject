import { useEffect } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";
import { PIE_COLORS } from "../../constants";
import { Empty } from "../ui";
import ReportShell, { exportReport } from "./ReportShell";

export default function R03({ records, role, onReportExport, exportRef }) {
  const outcomes = { Confirmed: 0, Extension: 0, "Not Confirmed": 0, "Early Confirmation": 0 };
  records.forEach((r) => {
    if (r.status === "Complete-Conf")  outcomes[r.outcome === "EarlyConf" ? "Early Confirmation" : "Confirmed"]++;
    else if (r.status === "Complete-NConf") outcomes["Not Confirmed"]++;
    else if (r.phase === "EXT")        outcomes["Extension"]++;
  });
  const data = Object.entries(outcomes).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));

  function exp(format) {
    const total = data.reduce((s, d) => s + d.value, 0);
    const head = ["Outcome", "Count", "% of Total"];
    const rows = data.map((d) => [d.name, d.value, total ? `${((d.value / total) * 100).toFixed(1)}%` : "—"]);
    exportReport(format, "R-03", "Outcome Summary", head, rows, "R03-outcomes.csv", role, onReportExport, {
      scope: "Organisation-wide",
      colWidths: [28, 12, 16],
    });
  }

  useEffect(() => { if (exportRef) exportRef.current = exp; });

  return (
    <ReportShell code="R-03" title="Outcome Summary" onExport={exp}>
      {data.length === 0
        ? <Empty icon={BarChart3} title="No decided outcomes yet" sub="Outcomes appear once letters are signed." />
        : (
          <div className="grid sm:grid-cols-2 gap-6 items-center">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>
                    {data.map((d, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              {data.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2.5 py-2 border-b border-slate-50 text-sm">
                  <span className="w-3 h-3 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-slate-600 flex-1">{d.name}</span>
                  <span className="font-semibold text-slate-800">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
    </ReportShell>
  );
}
