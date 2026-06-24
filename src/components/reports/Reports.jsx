import { useState, useEffect, useRef } from "react";
import { FileSpreadsheet, FileText, Download } from "lucide-react";
import { LM_SELF } from "../../constants";
import { PageHead, Mono, Btn } from "../ui";
import R01 from "./R01";
import R02 from "./R02";
import R03 from "./R03";
import R04 from "./R04";
import R05 from "./R05";
import R06 from "./R06";

export default function Reports({ records, role, onReportExport }) {
  const scoped    = role === "LM" ? records.filter((r) => r.lm === LM_SELF) : records;
  const aggregate = role === "LEAD";
  const exportRef = useRef(null);

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

  return (
    <div className="fadeUp">
      <PageHead
        code="S-12 · Reports & Analytics"
        title="Reports & Analytics"
        sub={`Access scope: ${scopeLabel} (A-11 injects role scope at query time). Leadership cannot see R-02 / R-04 or any individual names.`}
        right={
          <div className="flex items-center gap-2">
            <Btn variant="ghost" size="sm" icon={FileSpreadsheet} onClick={() => exportRef.current?.("xlsx")}>Excel</Btn>
            <Btn variant="ghost" size="sm" icon={FileText}        onClick={() => exportRef.current?.("pdf")}>PDF</Btn>
          </div>
        }
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

      {eff === "R-01" && <R01 records={scoped} aggregate={aggregate} onReportExport={onReportExport} role={role} exportRef={exportRef} />}
      {eff === "R-02" && <R02 records={scoped} onReportExport={onReportExport} role={role} exportRef={exportRef} />}
      {eff === "R-03" && <R03 records={scoped} onReportExport={onReportExport} role={role} exportRef={exportRef} />}
      {eff === "R-04" && <R04 records={scoped} onReportExport={onReportExport} role={role} exportRef={exportRef} />}
      {eff === "R-05" && <R05 records={scoped} aggregate={aggregate} onReportExport={onReportExport} role={role} exportRef={exportRef} />}
      {eff === "R-06" && <R06 records={records} onReportExport={onReportExport} exportRef={exportRef} />}
    </div>
  );
}
