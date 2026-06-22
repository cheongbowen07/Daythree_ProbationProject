import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, PageHead, Mono } from "../ui";

export default function SLATracker({ records }) {
  const pending = records
    .filter((r) => r.status.includes("Pending-Letter"))
    .sort((a, b) => (b.slaBreached ? 1 : 0) - (a.slaBreached ? 1 : 0));

  return (
    <div className="fadeUp">
      <PageHead
        code="S-08 · SLA Tracker"
        title="Letter generation SLA"
        sub="HRBP has 5 business days to generate the outcome letter once notified (A-04). Breaches are flagged but do not block generation."
      />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="px-4 py-2.5 font-medium">Employee</th>
                <th className="px-4 py-2.5 font-medium">LM</th>
                <th className="px-4 py-2.5 font-medium">Days elapsed</th>
                <th className="px-4 py-2.5 font-medium">SLA</th>
              </tr>
            </thead>
            <tbody>
              {pending.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No letters pending generation.</td></tr>
              )}
              {pending.map((r) => (
                <tr key={r.id} className={`border-b border-slate-50 ${r.slaBreached ? "bg-rose-50/40" : ""}`}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{r.name}</div>
                    <Mono className="text-[11px] text-slate-400">{r.empId}</Mono>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{r.lm}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className={`h-full ${r.slaBreached ? "bg-rose-500" : "bg-cyan-500"}`} style={{ width: `${Math.min(100, ((r.slaDays || 0) / 5) * 100)}%` }} />
                      </div>
                      <Mono className="text-xs text-slate-500">{r.slaDays || 0}/5 d</Mono>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {r.slaBreached
                      ? <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600"><AlertTriangle size={13} /> Breached · N-07 sent</span>
                      : <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 size={13} /> Within SLA</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
