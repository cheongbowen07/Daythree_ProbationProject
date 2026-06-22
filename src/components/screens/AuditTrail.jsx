import { useState } from "react";
import { Search, Download, ArrowRight } from "lucide-react";
import { EVENT_META } from "../../constants";
import { downloadCSV } from "../../utils/csv";
import { Card, Btn, PageHead, Mono } from "../ui";

export default function AuditTrail({ audit }) {
  const [q, setQ] = useState("");
  const f = audit.filter((e) => (e.empId + e.detail + e.actor).toLowerCase().includes(q.toLowerCase()));

  function exportCsv() {
    const rows = [
      ["Timestamp", "Employee", "Event", "Detail", "Actor", "Prev", "New"],
      ...f.map((e) => [e.ts, e.empId, e.type, e.detail, e.actor, e.prev, e.next]),
    ];
    downloadCSV("faith-audit-trail.csv", rows);
  }

  return (
    <div className="fadeUp">
      <PageHead
        code="S-09 · Audit Trail"
        title="Compliance audit trail"
        sub="Append-only, read-only (A-08). Every status change, submission, signing event, and reminder is traceable. Retention 7 years (pending Legal — OI-05)."
        right={<Btn icon={Download} variant="ghost" onClick={exportCsv}>Export CSV</Btn>}
      />
      <Card className="p-0">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <Search size={16} className="text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by employee, actor, or detail…" className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400" />
        </div>
        <div className="divide-y divide-slate-50 max-h-[560px] overflow-y-auto">
          {f.map((e) => {
            const meta = EVENT_META[e.type] || ["Event", "text-slate-600 bg-slate-100"];
            return (
              <div key={e.id} className="flex items-start gap-3 px-4 py-3">
                <span className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded ${meta[1]}`} style={{ fontFamily: "var(--mono)" }}>{meta[0]}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-700">{e.detail}</div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 flex-wrap">
                    <Mono>{e.ts}</Mono> · <Mono>{e.empId}</Mono> · {e.actor}
                    {e.prev && e.next && (
                      <span className="inline-flex items-center gap-1">
                        · <Mono>{e.prev}</Mono><ArrowRight size={10} /><Mono>{e.next}</Mono>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
