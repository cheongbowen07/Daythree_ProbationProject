import { useState, useEffect } from "react";
import { LM_SELF } from "../../constants";
import { PageHead, Mono } from "../ui";
import R01 from "./R01";
import R02 from "./R02";
import R03 from "./R03";
import R04 from "./R04";
import R05 from "./R05";

export default function Reports({ records, role, onReportExport }) {
  const scoped    = role === "LM" ? records.filter((r) => r.lm === LM_SELF) : records;
  const aggregate = role === "LEAD";

  const allReports = [
    ["R-01", "Probation Status Summary", true],
    ["R-02", "Overdue / At-Risk",        role !== "LEAD"],
    ["R-03", "Outcome Summary",          true],
    ["R-04", "RPM Score Trends",         role !== "LEAD"],
    ["R-05", "Acting Probation Pipeline", true],
  ].filter((r) => r[2]);

  const [sel, setSel] = useState(allReports[0][0]);
  useEffect(() => { if (!allReports.find((r) => r[0] === sel)) setSel(allReports[0][0]); }, [role]);
  const eff = allReports.find((r) => r[0] === sel) ? sel : allReports[0][0];

  const scopeLabel = role === "LM" ? "Own team only" : role === "LEAD" ? "Aggregate · no employee names" : "Organisation-wide";

  return (
    <div className="fadeUp">
      <PageHead
        code="S-12 · Reports & Analytics"
        title="Reports & Analytics"
        sub={`Access scope: ${scopeLabel} (A-11 injects role scope at query time). Leadership cannot see R-02 / R-04 or any individual names.`}
      />

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

      {eff === "R-01" && <R01 records={scoped} aggregate={aggregate} onReportExport={onReportExport} role={role} />}
      {eff === "R-02" && <R02 records={scoped} onReportExport={onReportExport} role={role} />}
      {eff === "R-03" && <R03 records={scoped} onReportExport={onReportExport} role={role} />}
      {eff === "R-04" && <R04 records={scoped} onReportExport={onReportExport} role={role} />}
      {eff === "R-05" && <R05 records={scoped} aggregate={aggregate} onReportExport={onReportExport} role={role} />}
    </div>
  );
}
