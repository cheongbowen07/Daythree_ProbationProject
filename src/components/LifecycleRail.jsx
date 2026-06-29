import { CheckCircle2 } from "lucide-react";
import { getStages, currentStageKey } from "../utils/lifecycle";
import { statusRank } from "../utils/status";

const MONTH_KEY = /^(ext-)?m\d+$/;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function parseJoined(s) {
  if (!s) return null;
  const [d, mon, y] = s.split(" ");
  const mi = MONTHS.indexOf(mon);
  return mi < 0 ? null : new Date(Number(y), mi, Number(d));
}
const fmtDate = (d) => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
function addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

// Scheduled date under a node: the KPI node anchors on the start date; each
// monthly review is due (30·m + 1) days in (Month 1 → +31, Month 2 → +61, …).
// Extension months continue past the base probation window.
function dateFor(rec, start, key) {
  // Outcome & letter node: once a letter is generated, anchor on its actual
  // generation date rather than a scheduled offset.
  if (key === "pending" || key === "ext-pending") {
    const gen = rec.letterGeneratedAt || rec.completion?.letterGeneratedAt;
    return gen ? fmtDate(new Date(gen)) : null;
  }
  if (!start) return null;
  if (key === "kpi") return fmtDate(start);
  let m = key.match(/^m(\d+)$/);
  if (m) return fmtDate(addDays(start, 30 * Number(m[1]) + 1));
  m = key.match(/^ext-m(\d+)$/);
  if (m) {
    const baseDays = rec.gradeBand === "M09_M12" ? 180 : 90;
    return fmtDate(addDays(start, baseDays + 30 * Number(m[1]) + 1));
  }
  return null;
}

// A month node's colour reflects its review/acceptance state rather than mere
// position: grey = LM hasn't submitted the review, amber = submitted but the DR
// hasn't accepted yet, green = accepted. Derived from the lifecycle status rank.
function monthTone(rec, key) {
  const ext = key.startsWith("ext-m");
  const m   = parseInt(key.replace("ext-m", "").replace(/^m/, ""), 10);
  const acptRank = (ext ? 51 : 21) + m * 2; // rank of "Month m DR acceptance"
  const r = statusRank(rec.status);
  if (r > acptRank)  return "done";    // accepted (or past) → green
  if (r === acptRank) return "pending"; // submitted, awaiting acceptance → amber
  return "todo";                        // not yet reviewed → grey
}

const NODE = {
  done:    { cls: "text-[#0F4B37]",  bg: "#3CC49F", border: "",                    label: "text-[#4D4D4D]" },
  pending: { cls: "text-white",      bg: "#F5A623", border: "",                    label: "text-[#B0760E] font-semibold" },
  current: { cls: "text-white",      bg: "var(--brand-red)", border: "2px solid #C8102E", label: "text-[#C8102E] font-semibold" },
  todo:    { cls: "text-[#8B79C4]",  bg: "#EEE9FA",  border: "2px solid #C3B1F5",  label: "text-slate-400" },
};

export default function LifecycleRail({ rec }) {
  const stages = getStages(rec);
  const curKey = currentStageKey(rec);
  const curIdx = stages.findIndex((s) => s.key === curKey);
  const done   = rec.status === "Complete-Conf" || rec.status === "Complete-NConf";
  const start  = parseJoined(rec.joined);

  const toneFor = (s, i) => {
    if (MONTH_KEY.test(s.key)) return monthTone(rec, s.key);
    if (done || i < curIdx)    return "done";
    if (i === curIdx)          return "current";
    return "todo";
  };

  return (
    <div className="pb-2">
      <div className="flex items-start overflow-x-auto">
        {stages.map((s, i) => {
          const tone = toneFor(s, i);
          const n = NODE[tone];
          const date = dateFor(rec, start, s.key);
          const lineColor = tone === "done" ? "bg-[#3CC49F]" : tone === "pending" ? "bg-[#F5A623]" : "bg-[#C3B1F5]";
          return (
            <div key={s.key} className={`flex items-center ${i < stages.length - 1 ? "flex-1" : ""}`}>
              <div className="flex flex-col items-center w-[88px] shrink-0 text-center">
                <div
                  className={`grid place-items-center w-7 h-7 rounded-full text-[11px] font-semibold transition ${n.cls}`}
                  style={{ background: n.bg, ...(n.border ? { border: n.border } : {}) }}
                >
                  {tone === "done" ? <CheckCircle2 size={15} /> : i + 1}
                </div>
                <div className={`mt-1.5 text-[10.5px] leading-tight ${n.label}`}>
                  {s.label}
                </div>
                {date && <div className="mt-0.5 text-[9.5px] text-slate-400 tabular-nums">{date}</div>}
              </div>
              {i < stages.length - 1 && (
                <div className={`h-0.5 flex-1 min-w-[16px] mx-1 -mt-4 ${lineColor}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Colour key for the month nodes */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-[10.5px] text-slate-400">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full ring-1 ring-[#C3B1F5]" style={{ background: "#EEE9FA" }} /> Not reviewed</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#F5A623" }} /> Submitted · awaiting acceptance</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: "#3CC49F" }} /> Accepted</span>
      </div>
    </div>
  );
}
