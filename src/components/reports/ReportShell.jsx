import { Download, FileText } from "lucide-react";
import { exportPDF, exportXLSX } from "../../utils/export";
import { Card, Btn, Mono } from "../ui";

export { exportPDF, exportXLSX };

const META = () => [
  ["Report generated", new Date().toLocaleString("en-MY")],
  ["System", "FAITH Probation · Daythree Workflow"],
  ["Classification", "Internal — Confidential"],
];

// Convenience: build a single-sheet PDF + XLSX from flat head/rows
export function exportReport(format, code, title, head, rows, filename, role, onReportExport, extra = {}) {
  onReportExport?.(role, code, format, rows.length);
  const today = new Date().toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" });

  if (format === "pdf") {
    exportPDF({
      filename: filename.replace(/\.\w+$/, ".pdf"),
      title,
      subtitle: `${code} · Exported ${today} · Access scope: ${extra.scope || "—"}`,
      code,
      sections: [
        ...(extra.sections || []),
        { head, body: rows },
        { text: "FAITH Probation · Internal use only · Not for external distribution." },
      ],
    });
  } else {
    exportXLSX({
      filename: filename.replace(/\.\w+$/, ".xlsx"),
      sheets: [{
        name:    code,
        head,
        rows,
        colWidths: extra.colWidths,
        metaRows: META().map(([k, v]) => [`${k}: ${v}`]),
      }],
    });
  }
}

export default function ReportShell({ code, title, onExport, children }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          {/* reference code hidden — {code} */} {title}
        </div>
        <div className="flex gap-2">
          <Btn size="sm" variant="ghost" icon={Download} onClick={() => onExport("xlsx")}>Excel</Btn>
          <Btn size="sm" variant="ghost" icon={FileText} onClick={() => onExport("pdf")}>PDF</Btn>
        </div>
      </div>
      {children}
    </Card>
  );
}
