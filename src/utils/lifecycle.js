export function totalCycles(rec) { return rec.gradeBand === "M09_M12" ? 6 : 3; }

// Extension length is grade-differentiated: M09 & above extend for a single
// month, E08 & below extend for the full 3-month cycle.
export function extensionCycles(rec) { return rec.gradeBand === "M09_M12" ? 1 : 3; }

// Day cap for the probation window. In the extension phase the window grows by
// the extension length, so the day counter (and days-remaining) stay correct
// past the original cap.
export function daysCap(rec) {
  const base = rec.gradeBand === "M09_M12" ? 180 : 90;
  return rec.phase === "EXT" ? base + extensionCycles(rec) * 30 : base;
}

// The original (pre-extension) probation stages, ending in the outcome & letter.
function baseStages(rec) {
  const cycles = totalCycles(rec);
  // One node per month — its colour conveys review/acceptance state
  // (see LifecycleRail), so we no longer split review vs. acceptance.
  const st = [{ key: "kpi", label: rec.wf === "WF2" ? "KPI (Acting)" : "KPI & Targets" }];
  for (let m = 1; m <= cycles; m++) {
    st.push({ key: `m${m}`, label: `Month ${m}` });
  }
  return st;
}

export function getStages(rec) {
  if (rec.phase === "EXT") {
    // Show the whole journey: the original probation cycle (now complete and
    // resolved as an extension) followed by the grade-based extension cycle.
    const st = baseStages(rec);
    st.push({ key: "pending", label: "Outcome: Extension" });
    st.push({ key: "sign",    label: "Extension signed" });
    st.push({ key: "ext-start", label: "Extension start" });
    for (let m = 1; m <= extensionCycles(rec); m++) {
      st.push({ key: `ext-m${m}`, label: `Ext · Month ${m}` });
    }
    st.push({ key: "ext-pending", label: "Outcome (Conf / Non-Conf)" });
    st.push({ key: "ext-sign",    label: "E-signature" });
    st.push({ key: "ext-done",    label: "Complete" });
    return st;
  }
  const st = baseStages(rec);
  st.push({ key: "pending", label: "Outcome & letter" });
  st.push({ key: "sign",    label: "E-signature" });
  st.push({ key: "done",    label: "Complete" });
  return st;
}

// Order reviews so the original probation cycle comes first, then the
// extension cycle. Reviews without a phase are treated as original-cycle.
export function sortedReviews(reviews = []) {
  return [...reviews].sort((a, b) => {
    const ap = a.phase === "EXT" ? 1 : 0;
    const bp = b.phase === "EXT" ? 1 : 0;
    return ap !== bp ? ap - bp : a.cycle - b.cycle;
  });
}

// Display label / stable React key for a single review record.
export const reviewLabel = (rv) => (rv.phase === "EXT" ? `Ext · Month ${rv.cycle}` : `Month ${rv.cycle}`);
export const reviewKey   = (rv) => `${rv.phase === "EXT" ? "ext" : "base"}-${rv.cycle}`;

export function currentStageKey(rec) {
  const s = rec.status;
  if (rec.phase === "EXT") {
    let m;
    if ((m = s.match(/^Ext-Mth(\d)-(Review|DR-Acpt)$/))) return `ext-m${m[1]}`;
    if (["Ext-Pending-Letter", "Ext-LM-Outcome", "Ext-HRBP-Ack"].includes(s)) return "ext-pending";
    if (/Sign-Off$/.test(s))                     return "ext-sign";
    if (s === "Complete-Conf" || s === "Complete-NConf") return "ext-done";
    return "ext-start";
  }
  if (s.startsWith("KPI")) return "kpi";
  let m;
  if ((m = s.match(/^Mth(\d)-(Review|DR-Acpt)$/))) return `m${m[1]}`;
  if (["Pending-Letter", "Pending-Letter(Acting)", "LM-Outcome", "LM-Outcome(Acting)", "HRBP-Ack", "HRBP-Ack(Acting)"].includes(s) || /-Letter$/.test(s)) return "pending";
  if (/Sign-Off$/.test(s))                return "sign";
  if (s === "Complete-Conf" || s === "Complete-NConf") return "done";
  return "kpi";
}

export function outcomeOptions(rec) {
  if (rec.wf === "WF2")
    return [["ActingConf", "Acting Confirmation", "LT-05"], ["ActingNConf", "Acting Non-Confirmation", "LT-06"]];
  if (rec.phase === "EXT")
    return [["Conf", "Confirmation", "LT-01"], ["NConf", "Non-Confirmation", "LT-03"]];
  const base = [["Conf", "Confirmation", "LT-01"], ["Ext", "Extension", "LT-02"], ["NConf", "Non-Confirmation", "LT-03"]];
  if (rec.gradeBand === "M09_M12") base.push(["EarlyConf", "Early Confirmation", "LT-04"]);
  return base;
}
