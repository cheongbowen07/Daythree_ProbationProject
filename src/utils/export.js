import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const BRAND_PURPLE = [93, 63, 211];
const BRAND_RED    = [200, 16, 46];
const SLATE_800    = [30, 41, 59];
const SLATE_500    = [100, 116, 139];
const SLATE_100    = [241, 245, 249];

function addPdfHeader(doc, title, subtitle, code) {
  // gradient bar approximation — two rects
  doc.setFillColor(...BRAND_PURPLE);
  doc.rect(0, 0, 148, 14, "F");
  doc.setFillColor(...BRAND_RED);
  doc.rect(100, 0, 48, 14, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("FAITH Probation · Daythree", 8, 6);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.text(code, 8, 10.5);
  doc.text(new Date().toLocaleDateString("en-MY", { day: "2-digit", month: "short", year: "numeric" }), 140, 10.5, { align: "right" });

  doc.setTextColor(...SLATE_800);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text(title, 8, 22);

  if (subtitle) {
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...SLATE_500);
    doc.text(subtitle, 8, 27, { maxWidth: 132 });
  }

  return subtitle ? 33 : 28;
}

function addPdfFooter(doc) {
  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setTextColor(...SLATE_500);
    doc.setFont("helvetica", "normal");
    doc.text("FAITH Probation · Confidential · Not for external distribution", 8, 207);
    doc.text(`Page ${i} of ${pages}`, 140, 207, { align: "right" });
  }
}

// head = [[col, col, ...]], body = [[val, val, ...]], columnStyles optional
export function exportPDF({ filename, title, subtitle, code, sections }) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  let y = addPdfHeader(doc, title, subtitle, code);

  sections.forEach((s, i) => {
    if (i > 0) y += 4;
    if (s.sectionTitle) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...BRAND_PURPLE);
      doc.text(s.sectionTitle.toUpperCase(), 8, y);
      y += 4;
    }

    if (s.keyValues) {
      // Two-column key-value block
      const pairs = s.keyValues;
      const half  = Math.ceil(pairs.length / 2);
      const left  = pairs.slice(0, half);
      const right = pairs.slice(half);
      const rowH  = 5.5;
      left.forEach(([k, v], idx) => {
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...SLATE_500);
        doc.text(k, 8, y + idx * rowH);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...SLATE_800);
        doc.text(String(v ?? "—"), 42, y + idx * rowH);
      });
      right.forEach(([k, v], idx) => {
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...SLATE_500);
        doc.text(k, 78, y + idx * rowH);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...SLATE_800);
        doc.text(String(v ?? "—"), 112, y + idx * rowH);
      });
      y += Math.max(left.length, right.length) * rowH + 3;
    }

    if (s.head && s.body) {
      autoTable(doc, {
        startY: y,
        head:   [s.head],
        body:   s.body,
        margin: { left: 8, right: 8 },
        styles: { fontSize: 7.5, cellPadding: 2.5, textColor: SLATE_800 },
        headStyles: { fillColor: BRAND_PURPLE, textColor: [255,255,255], fontStyle: "bold", fontSize: 7 },
        alternateRowStyles: { fillColor: SLATE_100 },
        columnStyles: s.columnStyles || {},
        tableLineColor: [226, 232, 240],
        tableLineWidth: 0.2,
        didDrawPage: () => {},
      });
      y = doc.lastAutoTable.finalY + 4;
    }

    if (s.text) {
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...SLATE_500);
      doc.text(s.text, 8, y, { maxWidth: 132 });
      y += 8;
    }
  });

  addPdfFooter(doc);
  doc.save(filename);
}

// sheets = [{ name, head, rows, colWidths }]
export function exportXLSX({ filename, sheets }) {
  const wb = XLSX.utils.book_new();

  sheets.forEach(({ name, head, rows, colWidths, metaRows }) => {
    const data = [];

    // optional metadata block at top
    if (metaRows) {
      metaRows.forEach((r) => data.push(r));
      data.push([]);
    }

    data.push(head);
    rows.forEach((r) => data.push(r));

    const ws = XLSX.utils.aoa_to_sheet(data);

    // column widths
    const headerRow = metaRows ? metaRows.length + 1 : 0;
    ws["!cols"] = (colWidths || head.map(() => ({ wch: 18 }))).map((w) =>
      typeof w === "number" ? { wch: w } : w
    );

    // Style header row
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cell = ws[XLSX.utils.encode_cell({ r: headerRow, c: C })];
      if (cell) {
        cell.s = {
          font:    { bold: true, color: { rgb: "FFFFFF" } },
          fill:    { fgColor: { rgb: "5D3FD3" } },
          border:  { bottom: { style: "thin", color: { rgb: "FFFFFF" } } },
          alignment: { horizontal: "center", wrapText: true },
        };
      }
    }

    // Zebra rows
    for (let R = headerRow + 1; R <= range.e.r; R++) {
      const isEven = (R - headerRow) % 2 === 0;
      for (let C = range.s.c; C <= range.e.c; C++) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
        if (cell) {
          cell.s = {
            fill: isEven ? { fgColor: { rgb: "F1F5F9" } } : {},
            alignment: { wrapText: false },
          };
        }
      }
    }

    // Metadata rows bold
    if (metaRows) {
      for (let R = 0; R < metaRows.length; R++) {
        const cell = ws[XLSX.utils.encode_cell({ r: R, c: 0 })];
        if (cell) cell.s = { font: { bold: true }, alignment: {} };
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  });

  XLSX.writeFile(wb, filename, { bookType: "xlsx", cellStyles: true });
}

export function exportCSV({ filename, head, rows }) {
  const escape = (v) => {
    const s = String(v ?? "").replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  const csv = [head, ...rows].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
