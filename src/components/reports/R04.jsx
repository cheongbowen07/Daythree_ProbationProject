import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Tag } from "../ui";
import ReportShell, { exportReport } from "./ReportShell";

export default function R04({ records, role, onReportExport }) {
  const data = [1, 2, 3, 4, 5, 6].map((c) => {
    const vals = records.flatMap((r) => r.reviews.filter((v) => v.cycle === c).map((v) => v.rpm));
    return { cycle: `Mth ${c}`, avg: vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null };
  }).filter((d) => d.avg !== null);

  const belowTotal = records.flatMap((r) => r.reviews).filter((v) => v.rpm < 3).length;

  function exp(format) {
    exportReport(format, "R-04", [["Cycle", "Avg RPM"], ...data.map((d) => [d.cycle, d.avg])], "R04-rpm-trends.csv", role, onReportExport);
  }

  return (
    <ReportShell code="R-04" title="RPM Score Trends" onExport={exp}>
      <div className="flex items-center gap-2 mb-3 text-sm">
        <Tag className="bg-rose-50 text-rose-600">Below-threshold reviews: {belowTotal}</Tag>
      </div>
      <div className="h-60">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: -16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
            <XAxis dataKey="cycle" tick={{ fontSize: 11, fill: "#6E6E6E" }} />
            <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#9D9990" }} />
            <Tooltip />
            <Line type="monotone" dataKey="avg" stroke="#409CFF" strokeWidth={2.5} dot={{ r: 4, fill: "#409CFF", stroke: "#ffffff", strokeWidth: 2 }} name="Avg RPM" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ReportShell>
  );
}
