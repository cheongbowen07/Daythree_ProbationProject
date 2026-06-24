import { useEffect } from "react";
import { Download, FileSignature, ShieldCheck } from "lucide-react";
import { exportPDF, exportXLSX } from "../../utils/export";
import { Card, Btn, Mono, Tag } from "../ui";

const HEAD = ["Employee", "Emp ID", "Grade", "Letter ID", "Letter Type", "Version", "Generated At", "Signed At", "IP Address", "Signature Method", "Integrity Hash", "Outcome"];

export default function R06({ records, onReportExport, exportRef }) {
  const signed = records.filter((r) => r.completion);

  function getRows() {
    return signed.map((r) => {
      const c = r.completion;
      return [
        r.name, r.empId, r.grade,
        c.letterId, c.letterType, c.letterVersion || "v1.0",
        c.letterGeneratedAt ? new Date(c.letterGeneratedAt).toLocaleString("en-MY") : "—",
        c.ts, c.ip, c.signatureMethod === "typed" ? "Typed name" : "Drawn",
        c.integrityHash || "—", r.outcome,
      ];
    });
  }

  function doExport(format) {
    onReportExport?.("HRBP", "R-06", format, signed.length);
    const rows = getRows();
    if (format === "pdf") {
      exportPDF({
        filename: "R06-acknowledgement-report.pdf",
        title: "Acknowledgement Report",
        subtitle: `R-06 · Compliance / Non-repudiation · ${signed.length} signed record(s) · Exported ${new Date().toLocaleDateString("en-MY")}`,
        code: "R-06",
        sections: [
          { sectionTitle: "Digital Fingerprint & Version Control", head: HEAD, body: rows },
          { text: "Immutable · append-only · tamper-evident. Retained 7 years per policy OI-05. FAITH Probation · Internal use only." },
        ],
      });
    } else {
      exportXLSX({
        filename: "R06-acknowledgement-report.xlsx",
        sheets: [{
          name: "Acknowledgements",
          head: HEAD,
          rows,
          colWidths: [22, 14, 10, 14, 14, 14, 24, 24, 18, 16, 32, 14],
          metaRows: [
            ["Report: R-06 Acknowledgement Report"],
            [`Generated: ${new Date().toLocaleString("en-MY")}`],
            ["Classification: Internal · Confidential"],
            ["Policy: OI-05 · Retained 7 years"],
          ],
        }],
      });
    }
  }

  useEffect(() => { if (exportRef) exportRef.current = doExport; });

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-semibold text-slate-400 mb-1 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={13} /> Compliance · Non-repudiation
          </div>
          <p className="text-sm text-slate-500 max-w-2xl">
            All signed acknowledgements with their digital fingerprint (User ID, timestamp, IP address), letter version, and integrity hash. Export for legal or audit verification.
          </p>
        </div>
        <div className="flex gap-2">
          <Btn icon={Download} variant="ghost" onClick={() => doExport("xlsx")} disabled={signed.length === 0}>Excel</Btn>
          <Btn icon={Download} variant="ghost" onClick={() => doExport("pdf")}  disabled={signed.length === 0}>PDF</Btn>
        </div>
      </div>

      {signed.length === 0 ? (
        <Card className="py-14 text-center">
          <FileSignature size={28} className="mx-auto text-slate-300 mb-2" />
          <p className="text-sm text-slate-500">No signed acknowledgements on record yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {signed.map((r) => {
            const c = r.completion;
            return (
              <Card key={r.id} className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <div className="font-semibold text-slate-800">{r.name}</div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Mono className="text-[11px] text-slate-400">{r.empId}</Mono>
                      <Tag className="bg-slate-100 text-slate-600">{r.grade}</Tag>
                      <Tag className={`${r.outcome?.includes("NConf") ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>{r.outcome}</Tag>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 ring-1 ring-emerald-100 px-2.5 py-1 rounded-full uppercase tracking-wide flex items-center gap-1">
                    ✓ Verified · {c.integrityHash || "hash pending"}
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Digital Fingerprint</div>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-2"><span className="text-slate-400">User ID</span><Mono className="text-slate-700">{c.userId || r.empId}</Mono></div>
                      <div className="flex justify-between gap-2"><span className="text-slate-400">Date / Time</span><Mono className="text-slate-700">{c.ts}</Mono></div>
                      <div className="flex justify-between gap-2"><span className="text-slate-400">IP Address</span><Mono className="text-slate-700">{c.ip}</Mono></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Letter Version</div>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-2"><span className="text-slate-400">Letter ID</span><Mono className="text-slate-700">{c.letterId}</Mono></div>
                      <div className="flex justify-between gap-2"><span className="text-slate-400">Type</span><Mono className="text-slate-700">{c.letterType}</Mono></div>
                      <div className="flex justify-between gap-2"><span className="text-slate-400">Version</span><Mono className="text-slate-700">{c.letterVersion || "v1.0"}</Mono></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Signature</div>
                    <div className="space-y-1">
                      <div className="flex justify-between gap-2"><span className="text-slate-400">Method</span><span className="text-slate-700">{c.signatureMethod === "typed" ? "Typed name" : "Drawn"}</span></div>
                      <div className="flex justify-between gap-2"><span className="text-slate-400">Captured</span><span className="text-slate-700 truncate max-w-[120px]">{c.signature}</span></div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
