import { useState, useEffect, useRef } from "react";
import { FileSpreadsheet, FileText, SlidersHorizontal, X, Bookmark } from "lucide-react";
import { LM_SELF } from "../../constants";
import { PageHead, Mono, Btn, Card } from "../ui";
import R01 from "./R01";
import R02 from "./R02";
import R03 from "./R03";
import R04 from "./R04";
import R05 from "./R05";
import R06 from "./R06";

const ALL_GRADES = ["E06", "E07", "E08", "M09", "M10", "M11", "M12"];
const ALL_DEPTS  = ["Operations", "Technology"];
const ALL_WF     = [["WF1", "New-hire (WF1)"], ["WF2", "Acting-role (WF2)"]];

const BLANK_FILTER = { dateFrom: "", dateTo: "", grades: [], dept: "", wf: "" };

function parseDateMs(d) { return d ? new Date(d).getTime() : null; }

function applyFilters(records, f) {
  const from = parseDateMs(f.dateFrom);
  const to   = parseDateMs(f.dateTo);
  return records.filter((r) => {
    const joined = parseDateMs(r.joined);
    if (from && joined && joined < from) return false;
    if (to   && joined && joined > to)   return false;
    if (f.grades.length && !f.grades.includes(r.grade)) return false;
    if (f.dept && r.dept !== f.dept) return false;
    if (f.wf   && r.wf   !== f.wf)   return false;
    return true;
  });
}

export default function Reports({ records, role, onReportExport }) {
  const baseScoped = role === "LM" ? records.filter((r) => r.lm === LM_SELF) : records;
  const aggregate  = role === "LEAD";
  const exportRef  = useRef(null);

  const [showFilter, setShowFilter] = useState(false);
  const [filter, setFilter]         = useState(BLANK_FILTER);
  const [savedPreset, setSavedPreset] = useState(null);

  function patchFilter(k, v) { setFilter((f) => ({ ...f, [k]: v })); }
  function toggleGrade(g) {
    setFilter((f) => ({
      ...f,
      grades: f.grades.includes(g) ? f.grades.filter((x) => x !== g) : [...f.grades, g],
    }));
  }

  const from  = parseDateMs(filter.dateFrom);
  const to    = parseDateMs(filter.dateTo);
  const dateRangeInvalid = from && to && to < from;
  const dateRangeTooWide = from && to && (to - from) > 3 * 365.25 * 24 * 3600 * 1000;
  const hasFilter = filter.dateFrom || filter.dateTo || filter.grades.length || filter.dept || filter.wf;

  const scoped  = applyFilters(baseScoped, filter);

  const allReports = [
    ["R-01", "Probation Status Summary",    true],
    ["R-02", "Overdue / At-Risk",           role !== "LEAD"],
    ["R-03", "Outcome Summary",             true],
    ["R-04", "RPM Score Trends",            role !== "LEAD"],
    ["R-05", "Acting Probation Pipeline",   true],
    ["R-06", "Acknowledgement Report",      role === "HRBP"],
  ].filter((r) => r[2]);

  const [sel, setSel] = useState(allReports[0][0]);
  useEffect(() => { if (!allReports.find((r) => r[0] === sel)) setSel(allReports[0][0]); }, [role]);
  const eff = allReports.find((r) => r[0] === sel) ? sel : allReports[0][0];

  const scopeLabel = role === "LM" ? "Own team only" : role === "LEAD" ? "Aggregate · no employee names" : "Organisation-wide";
  const filterCount = (filter.grades.length ? 1 : 0) + (filter.dept ? 1 : 0) + (filter.wf ? 1 : 0) + (filter.dateFrom || filter.dateTo ? 1 : 0);

  return (
    <div className="fadeUp">
      <PageHead
        code="S-12 · Reports & Analytics"
        title="Reports & Analytics"
        sub={`Access scope: ${scopeLabel} (A-11 injects role scope at query time). Leadership cannot see R-02 / R-04 or any individual names.`}
        right={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilter((v) => !v)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg ring-1 transition ${showFilter || hasFilter ? "bg-indigo-50 ring-indigo-300 text-indigo-700" : "ring-slate-200 text-slate-500 hover:bg-slate-50"}`}
            >
              <SlidersHorizontal size={13} /> Filters {filterCount > 0 && <span className="font-bold text-indigo-600">· {filterCount}</span>}
            </button>
            <Btn variant="ghost" size="sm" icon={FileSpreadsheet} onClick={() => exportRef.current?.("xlsx")}>Excel</Btn>
            <Btn variant="ghost" size="sm" icon={FileText}        onClick={() => exportRef.current?.("pdf")}>PDF</Btn>
          </div>
        }
      />

      {/* F-12 Filter Panel */}
      {showFilter && (
        <Card className="p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">F-12 · Report filters</span>
            <div className="flex items-center gap-2">
              {role === "HRBP" && (
                <button
                  onClick={() => { setSavedPreset(filter); }}
                  className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800"
                >
                  <Bookmark size={12} /> {savedPreset ? "Update preset" : "Save preset"}
                </button>
              )}
              {savedPreset && role === "HRBP" && (
                <button onClick={() => setFilter(savedPreset)} className="text-xs text-slate-500 hover:text-indigo-600">Load preset</button>
              )}
              {hasFilter && (
                <button onClick={() => setFilter(BLANK_FILTER)} className="flex items-center gap-0.5 text-xs text-slate-400 hover:text-rose-500">
                  <X size={12} /> Reset
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Date from</label>
              <input type="date" value={filter.dateFrom} onChange={(e) => patchFilter("dateFrom", e.target.value)}
                className={`w-full text-xs bg-white ring-1 rounded-lg px-2 py-1.5 outline-none ${dateRangeInvalid ? "ring-rose-400" : "ring-slate-200"}`} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Date to</label>
              <input type="date" value={filter.dateTo} onChange={(e) => patchFilter("dateTo", e.target.value)}
                className={`w-full text-xs bg-white ring-1 rounded-lg px-2 py-1.5 outline-none ${dateRangeInvalid || dateRangeTooWide ? "ring-rose-400" : "ring-slate-200"}`} />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Department</label>
              <select value={filter.dept} onChange={(e) => patchFilter("dept", e.target.value)}
                className="w-full text-xs bg-white ring-1 ring-slate-200 rounded-lg px-2 py-1.5 outline-none">
                <option value="">All departments</option>
                {ALL_DEPTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 block">WF type</label>
              <select value={filter.wf} onChange={(e) => patchFilter("wf", e.target.value)}
                className="w-full text-xs bg-white ring-1 ring-slate-200 rounded-lg px-2 py-1.5 outline-none">
                <option value="">All workflows</option>
                {ALL_WF.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Grade</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_GRADES.map((g) => (
                <button key={g} onClick={() => toggleGrade(g)}
                  className={`text-xs px-2.5 py-1 rounded-lg ring-1 font-medium transition ${filter.grades.includes(g) ? "bg-indigo-600 text-white ring-indigo-600" : "bg-white ring-slate-200 text-slate-600 hover:bg-slate-50"}`}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {(dateRangeInvalid || dateRangeTooWide) && (
            <p className="text-xs text-rose-600">
              {dateRangeInvalid ? '"Date to" cannot precede "Date from".' : 'Date range exceeds 3-year maximum (F-12 validation).'}
            </p>
          )}

          <div className="text-xs text-slate-400">
            Showing <span className="font-semibold text-slate-700">{scoped.length}</span> of {baseScoped.length} records in scope
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-1.5 mb-5">
        {allReports.map(([code, name]) => (
          <button
            key={code}
            onClick={() => setSel(code)}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-2 ${sel === code ? "text-white" : "text-slate-600 bg-white ring-1 ring-slate-200 hover:bg-slate-50"}`}
            style={sel === code ? { background: "var(--brand)" } : {}}
          >
            <Mono className={`text-[10px] ${sel === code ? "text-white/60" : "text-slate-400"}`}>{code}</Mono>
            {name}
          </button>
        ))}
      </div>

      {eff === "R-01" && <R01 records={scoped} aggregate={aggregate} onReportExport={onReportExport} role={role} exportRef={exportRef} />}
      {eff === "R-02" && <R02 records={scoped} onReportExport={onReportExport} role={role} exportRef={exportRef} />}
      {eff === "R-03" && <R03 records={scoped} onReportExport={onReportExport} role={role} exportRef={exportRef} />}
      {eff === "R-04" && <R04 records={scoped} onReportExport={onReportExport} role={role} exportRef={exportRef} />}
      {eff === "R-05" && <R05 records={scoped} aggregate={aggregate} onReportExport={onReportExport} role={role} exportRef={exportRef} />}
      {eff === "R-06" && <R06 records={scoped} onReportExport={onReportExport} exportRef={exportRef} />}
    </div>
  );
}
