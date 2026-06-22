export function totalCycles(rec) { return rec.gradeBand === "M09_M12" ? 6 : 3; }
export function daysCap(rec)    { return rec.gradeBand === "M09_M12" ? 180 : 90; }

export function getStages(rec) {
  if (rec.phase === "EXT") {
    const st = [{ key: "ext-start", label: "Extension start" }];
    for (let m = 1; m <= 3; m++) {
      st.push({ key: `ext-m${m}r`, label: `Ext · Month ${m} review` });
      st.push({ key: `ext-m${m}a`, label: `Ext · Month ${m} acceptance` });
    }
    st.push({ key: "ext-pending", label: "Outcome (Conf / Non-Conf)" });
    st.push({ key: "ext-sign",    label: "E-signature" });
    st.push({ key: "ext-done",    label: "Complete" });
    return st;
  }
  const cycles = totalCycles(rec);
  const st = [{ key: "kpi", label: rec.wf === "WF2" ? "KPI (Acting)" : "KPI & Targets" }];
  for (let m = 1; m <= cycles; m++) {
    st.push({ key: `m${m}r`, label: `Month ${m} review` });
    st.push({ key: `m${m}a`, label: `Month ${m} acceptance` });
  }
  st.push({ key: "pending", label: "Outcome & letter" });
  st.push({ key: "sign",    label: "E-signature" });
  st.push({ key: "done",    label: "Complete" });
  return st;
}

export function currentStageKey(rec) {
  const s = rec.status;
  if (rec.phase === "EXT") {
    let m;
    if ((m = s.match(/^Ext-Mth(\d)-Review$/)))  return `ext-m${m[1]}r`;
    if ((m = s.match(/^Ext-Mth(\d)-DR-Acpt$/))) return `ext-m${m[1]}a`;
    if (s === "Ext-Pending-Letter")              return "ext-pending";
    if (/Sign-Off$/.test(s))                     return "ext-sign";
    if (s === "Complete-Conf" || s === "Complete-NConf") return "ext-done";
    return "ext-start";
  }
  if (s.startsWith("KPI")) return "kpi";
  let m;
  if ((m = s.match(/^Mth(\d)-Review$/)))  return `m${m[1]}r`;
  if ((m = s.match(/^Mth(\d)-DR-Acpt$/))) return `m${m[1]}a`;
  if (s === "Pending-Letter" || s === "Pending-Letter(Acting)" || /-Letter$/.test(s)) return "pending";
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
