import { Download, FileText } from "lucide-react";
import { downloadCSV } from "../../utils/csv";
import { Card, Btn, Mono } from "../ui";

export function exportReport(format, code, rows, filename, role, onReportExport) {
  onReportExport?.(role, code, format, Math.max(0, rows.length - 1));
  if (format === "pdf") {
    window.print();
    return;
  }
  downloadCSV(filename, rows);
}

export default function ReportShell({ code, title, onExport, children }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Mono className="text-[11px] text-cyan-700">{code}</Mono> {title}
        </div>
        <div className="flex gap-2">
          <Btn size="sm" variant="ghost" icon={Download} onClick={() => onExport("csv")}>Excel/CSV</Btn>
          <Btn size="sm" variant="ghost" icon={FileText} onClick={() => onExport("pdf")}>PDF</Btn>
        </div>
      </div>
      {children}
    </Card>
  );
}
