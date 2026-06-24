export function statusLabel(s) {
  const map = {
    "KPI-Review":             "Probation –KPI Review",
    "KPI-Review(Acting)":     "Probation –KPI Review (Acting)",
    "Pending-Letter":         "Probation –Pending Letter",
    "Pending-Letter(Acting)": "Probation –Pending Letter (Acting)",
    "Ext-Pending-Letter":     "Extension – Pending Letter",
    "Complete-Conf":          "Complete – Confirmed",
    "Complete-NConf":         "Complete – Not Confirmed",
    "Terminated":             "Probation –Terminated",
  };
  if (map[s]) return map[s];
  let m;
  if ((m = s.match(/^Mth(\d)-Review$/)))      return `Probation –Month ${m[1]} Review`;
  if ((m = s.match(/^Mth(\d)-DR-Acpt$/)))     return `Probation –Month ${m[1]} DR Acceptance`;
  if ((m = s.match(/^Ext-Mth(\d)-Review$/)))  return `Extension – Month ${m[1]} Review`;
  if ((m = s.match(/^Ext-Mth(\d)-DR-Acpt$/))) return `Extension – Month ${m[1]} DR Acceptance`;
  if ((m = s.match(/^(.*)-Letter$/)))          return `Probation –${m[1]} Letter`;
  if ((m = s.match(/^Pending-(.*)-Sign-Off$/))) return `Pending ${m[1]} Sign-Off`;
  return s;
}

export function tone(s) {
  if (s.startsWith("KPI"))  return "kpi";
  if (/-Review$/.test(s))   return "review";
  if (/-DR-Acpt$/.test(s))  return "accept";
  if (s === "Pending-Letter" || s === "Pending-Letter(Acting)" || s === "Ext-Pending-Letter") return "pending";
  if (/-Letter$/.test(s))   return "letter";
  if (/Sign-Off$/.test(s))  return "sign";
  if (s === "Complete-Conf") return "confirmed";
  if (s === "Complete-NConf") return "nconf";
  if (s === "Terminated")   return "terminated";
  return "kpi";
}

export function monthFromStatus(s) {
  const m = s.match(/Mth(\d)-(Review|DR-Acpt)/);
  return m ? parseInt(m[1], 10) : null;
}

export function isActiveProbation(s) {
  return !["Complete-Conf", "Complete-NConf", "Terminated"].includes(s);
}

export function statusGroup(s) {
  if (s === "Complete-Conf")            return "Confirmed";
  if (s === "Complete-NConf")           return "Not Confirmed";
  if (s === "Terminated")               return "Terminated";
  if (s.includes("Pending-Letter"))     return "Pending Letter";
  if (/Sign-Off$/.test(s))              return "Awaiting Sign-Off";
  if (/Letter$/.test(s))               return "Letter Issued";
  return "In Review";
}

export function pendingFor(rec, role) {
  const s = rec.status;
  if (role === "LM"   && (/-Review$/.test(s) || s === "KPI-Review" || s === "KPI-Review(Acting)")) return true;
  if (role === "DR"   && (/-DR-Acpt$/.test(s) || /Sign-Off$/.test(s))) return true;
  if (role === "HRBP" && ["Pending-Letter", "Pending-Letter(Acting)", "Ext-Pending-Letter"].includes(s)) return true;
  return false;
}
