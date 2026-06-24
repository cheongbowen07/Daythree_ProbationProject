import { useState } from "react";
import { Search, Download, ChevronDown, ChevronRight, ArrowRight, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { EVENT_META } from "../../constants";
import { exportPDF, exportXLSX } from "../../utils/export";
import { Card, Btn, PageHead, Mono } from "../ui";

function FingerprintRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="text-[10px] text-slate-400 uppercase tracking-wide w-28 shrink-0 pt-0.5">{label}</span>
      <Mono className="text-xs text-slate-700 break-all">{value}</Mono>
    </div>
  );
}

const WF_TYPE_MAP = {
  "WF1": "New-hire (WF1)",
  "WF2": "Acting-role (WF2)",
};

export default function AuditTrail({ audit, records = [] }) {
  const [q, setQ]               = useState("");
  const [expanded, setExpanded] = useState({});
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType]   = useState("");
  const [filterActor, setFilterActor] = useState("");
  const [filterWf, setFilterWf]       = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo]     = useState("");

  const recMap  = Object.fromEntries(records.map((r) => [r.empId, r]));
  const empWfMap = Object.fromEntries(records.map((r) => [r.empId, r.wf]));

  const allActors = [...new Set(audit.map((e) => e.actor))].sort();
  const allTypes  = [...new Set(audit.map((e) => e.type))].sort();

  const f = audit.filter((e) => {
    if (q && !(e.empId + e.detail + e.actor + (e.refId || "")).toLowerCase().includes(q.toLowerCase())) return false;
    if (filterType  && e.type   !== filterType)  return false;
    if (filterActor && e.actor  !== filterActor) return false;
    if (filterWf) {
      const wf = empWfMap[e.empId];
      if (wf !== filterWf) return false;
    }
    if (filterDateFrom && e.ts < filterDateFrom) return false;
    if (filterDateTo   && e.ts > filterDateTo + "z") return false;
    return true;
  });

  const hasFilter = filterType || filterActor || filterWf || filterDateFrom || filterDateTo;
  function clearFilters() { setFilterType(""); setFilterActor(""); setFilterWf(""); setFilterDateFrom(""); setFilterDateTo(""); }

  function toggle(id) { setExpanded((p) => ({ ...p, [id]: !p[id] })); }

  function doExport(format) {
    const head = ["Timestamp", "Emp ID", "Actor", "Event", "Detail", "Prev Status", "New Status"];
    const rows = f.map((e) => [e.ts, e.empId, e.actor, e.type, e.detail, e.prev || "—", e.next || "—"]);

    if (format === "pdf") {
      exportPDF({
        filename: "faith-audit-trail.pdf",
        title: "Compliance Audit Trail",
        subtitle: `S-09 · Append-only · ${f.length} entries · Exported ${new Date().toLocaleDateString("en-MY")}`,
        code: "S-09",
        sections: [
          { sectionTitle: "Audit Log", head, body: rows },
          { text: "Immutable · append-only · tamper-evident. Entries cannot be edited or deleted. Retained 7 years per policy OI-05. FAITH Probation · Internal use only." },
        ],
      });
    } else {
      exportXLSX({
        filename: "faith-audit-trail.xlsx",
        sheets: [{
          name: "Audit Trail",
          head,
          rows,
          colWidths: [26, 14, 18, 16, 60, 22, 22],
          metaRows: [
            ["FAITH Probation · Compliance Audit Trail · S-09"],
            [`Exported: ${new Date().toLocaleString("en-MY")}`],
            ["Classification: Internal · Confidential"],
            ["Policy: OI-05 · Retained 7 years · Append-only · Tamper-evident"],
          ],
        }],
      });
    }
  }

  return (
    <div className="fadeUp">
      <PageHead
        code="S-09 · Audit Trail"
        title="Compliance audit trail"
        sub="Append-only, read-only (A-08). Every status change, submission, signing event, and reminder is traceable. Retention 7 years (pending Legal — OI-05)."
        right={
          <div className="flex gap-2">
            <Btn icon={Download} variant="ghost" onClick={() => doExport("xlsx")}>Excel</Btn>
            <Btn icon={Download} variant="ghost" onClick={() => doExport("pdf")}>PDF</Btn>
          </div>
        }
      />

      <div className="mb-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100 rounded-lg px-3 py-2 font-medium">
        <ShieldCheck size={13} /> Immutable log — append-only (A-08). Entries cannot be edited or deleted. Retained 7 years per policy OI-05.
      </div>

      <Card className="p-0">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <Search size={16} className="text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search employee, actor, ref ID, or detail…"
            className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400"
          />
          <span className="text-xs text-slate-400">{f.length} entries</span>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg ring-1 transition ${showFilters || hasFilter ? "bg-indigo-50 ring-indigo-300 text-indigo-700" : "ring-slate-200 text-slate-500 hover:bg-slate-50"}`}
          >
            <SlidersHorizontal size={13} /> Filters {hasFilter && <span className="font-bold">·</span>}
          </button>
          {hasFilter && (
            <button onClick={clearFilters} className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-0.5">
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Event type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full text-xs bg-white ring-1 ring-slate-200 rounded-lg px-2 py-1.5 outline-none">
                <option value="">All types</option>
                {allTypes.map((t) => <option key={t} value={t}>{EVENT_META[t]?.[0] || t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Actor</label>
              <select value={filterActor} onChange={(e) => setFilterActor(e.target.value)} className="w-full text-xs bg-white ring-1 ring-slate-200 rounded-lg px-2 py-1.5 outline-none">
                <option value="">All actors</option>
                {allActors.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Workflow type</label>
              <select value={filterWf} onChange={(e) => setFilterWf(e.target.value)} className="w-full text-xs bg-white ring-1 ring-slate-200 rounded-lg px-2 py-1.5 outline-none">
                <option value="">All workflows</option>
                <option value="WF1">New-hire (WF1)</option>
                <option value="WF2">Acting-role (WF2)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Date from</label>
              <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} className="w-full text-xs bg-white ring-1 ring-slate-200 rounded-lg px-2 py-1.5 outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Date to</label>
              <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} className="w-full text-xs bg-white ring-1 ring-slate-200 rounded-lg px-2 py-1.5 outline-none" />
            </div>
          </div>
        )}

        <div className="divide-y divide-slate-50 max-h-[620px] overflow-y-auto">
          {f.map((e) => {
            const meta     = EVENT_META[e.type] || ["Event", "text-slate-600 bg-slate-100"];
            const isSigned = e.type === "sign";
            const isOpen   = expanded[e.id];
            const rec      = recMap[e.empId];
            const fp       = rec?.completion;
            const hasFp    = isSigned && fp;

            return (
              <div key={e.id} className={isSigned ? "bg-emerald-50/40" : ""}>
                <div
                  className={`flex items-start gap-3 px-4 py-3 ${hasFp ? "cursor-pointer hover:bg-slate-50/60" : ""}`}
                  onClick={() => hasFp && toggle(e.id)}
                >
                  {hasFp
                    ? <span className="shrink-0 mt-0.5 text-slate-400">{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                    : <span className="w-3.5 shrink-0" />}

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
                      {e.refId && <span className="ml-1 text-[10px] text-indigo-400 font-mono">ref:{e.refId}</span>}
                      {empWfMap[e.empId] && <span className="text-[10px] text-slate-300">{empWfMap[e.empId]}</span>}
                    </div>
                  </div>

                  {isSigned && (
                    <span className="shrink-0 text-[9px] font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded uppercase tracking-wide">Verified</span>
                  )}
                </div>

                {/* ── Expandable digital fingerprint ── */}
                {hasFp && isOpen && (
                  <div className="mx-4 mb-3 rounded-xl bg-white ring-1 ring-emerald-100 p-4 space-y-3">
                    <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <ShieldCheck size={11} /> Digital fingerprint · A-09 compliance record
                    </div>

                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Identity</div>
                        <FingerprintRow label="User ID"    value={fp.userId || fp.empId} />
                        <FingerprintRow label="Signed by"  value={fp.empName} />
                        <FingerprintRow label="IP Address" value={fp.ip} />
                        <FingerprintRow label="User agent" value={fp.ua} />
                      </div>
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Letter version</div>
                        <FingerprintRow label="Letter ID"   value={fp.letterId} />
                        <FingerprintRow label="Letter type" value={fp.letterType} />
                        <FingerprintRow label="Version"     value={fp.letterVersion} />
                        <FingerprintRow label="Generated"   value={fp.letterGeneratedAt ? new Date(fp.letterGeneratedAt).toLocaleString("en-MY") : "—"} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Integrity</div>
                      <FingerprintRow label="Signed at"       value={fp.ts} />
                      <FingerprintRow label="Sign method"     value={fp.signatureMethod === "typed" ? "Typed name" : "Drawn signature"} />
                      <FingerprintRow label="Integrity hash"  value={fp.integrityHash} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
