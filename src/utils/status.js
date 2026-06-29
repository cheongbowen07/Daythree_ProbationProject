import { daysCap } from "./lifecycle";

export function statusLabel(s) {
  const map = {
    "KPI-Review":             "Probation –KPI Review",
    "KPI-Review(Acting)":     "Probation –KPI Review (Acting)",
    "Pending-Letter":         "Probation –Pending Letter",
    "Pending-Letter(Acting)": "Probation –Pending Letter (Acting)",
    "Ext-Pending-Letter":     "Extension – Pending Letter",
    "Complete-Conf":          "Complete – Confirmed",
    "Complete-NConf":         "Complete – Not Confirmed",
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
  return "kpi";
}

// Numeric position of a status within the probation lifecycle, used to sort
// the Status column by workflow progression rather than alphabetically.
// Lower = earlier in the journey.
export function statusRank(s) {
  let m;
  if (s === "KPI-Review" || s === "KPI-Review(Acting)")          return 10;
  if ((m = s.match(/^Mth(\d)-Review$/)))                         return 20 + parseInt(m[1], 10) * 2;
  if ((m = s.match(/^Mth(\d)-DR-Acpt$/)))                        return 21 + parseInt(m[1], 10) * 2;
  if (s === "LM-Outcome" || s === "LM-Outcome(Acting)")          return 40;
  if (s === "HRBP-Ack"   || s === "HRBP-Ack(Acting)")            return 42;
  if (s === "Pending-Letter" || s === "Pending-Letter(Acting)") return 44;
  if (s === "Pending-Ext-Sign-Off")                             return 48;
  // Extension cycle
  if ((m = s.match(/^Ext-Mth(\d)-Review$/)))                    return 50 + parseInt(m[1], 10) * 2;
  if ((m = s.match(/^Ext-Mth(\d)-DR-Acpt$/)))                   return 51 + parseInt(m[1], 10) * 2;
  if (s === "Ext-LM-Outcome")                                   return 70;
  if (s === "Ext-HRBP-Ack")                                     return 72;
  if (s === "Ext-Pending-Letter")                               return 74;
  // Final letter issuance / signature
  if (/Sign-Off$/.test(s))                                      return 80;
  if (/-Letter$/.test(s))                                       return 82;
  // Terminal states
  if (s === "Complete-Conf")                                    return 90;
  if (s === "Complete-NConf")                                   return 92;
  return 99;
}

// Priority bucket for the default dashboard ordering (lower = nearer the top).
// The viewing role's OWN action-due rows float to the very top (SLA-breached
// ones first), so each dashboard opens with "what I need to do" up front. Any
// remaining attention-worthy rows (other breaches, signatures, acknowledgements)
// follow, then the rest of the active cases, with completed cases at the bottom.
export function rowPriority(r, role) {
  if (!isActiveProbation(r.status))   return 100; // completed → bottom
  const mine = role && pendingFor(r, role);
  if (mine && r.slaBreached)          return 0;   // my action, SLA breached → top
  if (mine)                           return 1;   // my action due
  if (r.slaBreached)                  return 2;   // someone else's SLA breach
  if (/Sign-Off$/.test(r.status))     return 3;   // awaiting signature
  if (/HRBP-Ack/.test(r.status))      return 4;   // acknowledgement
  return 50;                                       // active, nothing due
}

// Days left in the probation window for an active row (smaller = more urgent).
function daysRemaining(r) {
  return Math.max(0, daysCap(r) - (r.day || 0));
}

// Comparator for the initial (no column selected) sort of a dashboard table.
// Action-required rows float to the top (see rowPriority); within a bucket the
// most urgent cases — fewest days remaining in the window — come first.
// Completed rows are ordered most-recently-completed first.
export function defaultRowOrder(role) {
  return (a, b) => {
    const pa = rowPriority(a, role);
    const pb = rowPriority(b, role);
    if (pa !== pb) return pa - pb;
    if (pa === 100) {
      const ta = a.completion?.isoTs || "";
      const tb = b.completion?.isoTs || "";
      return tb.localeCompare(ta); // newest completion first
    }
    return daysRemaining(a) - daysRemaining(b); // most urgent first
  };
}

export function monthFromStatus(s) {
  const m = s.match(/Mth(\d)-(Review|DR-Acpt)/);
  return m ? parseInt(m[1], 10) : null;
}

export function isActiveProbation(s) {
  return !["Complete-Conf", "Complete-NConf"].includes(s);
}

export function statusGroup(s) {
  if (s === "Complete-Conf")            return "Confirmed";
  if (s === "Complete-NConf")           return "Not Confirmed";
  if (s.includes("Pending-Letter"))     return "Pending Letter";
  if (/Sign-Off$/.test(s))              return "Awaiting Sign-Off";
  if (/Letter$/.test(s))               return "Letter Issued";
  return "In Review";
}

export function pendingFor(rec, role) {
  const s = rec.status;
  if (role === "LM"   && (/-Review$/.test(s) || s === "KPI-Review" || s === "KPI-Review(Acting)")) return true;
  if (role === "DR"   && (/-DR-Acpt$/.test(s) || /Sign-Off$/.test(s))) return true;
  if (role === "HRBP") {
    if (rec.earlyConfRequest?.status === "Pending") return true;
    return ["Pending-Letter", "Pending-Letter(Acting)", "Ext-Pending-Letter",
            "HRBP-Ack", "HRBP-Ack(Acting)", "Ext-HRBP-Ack"].includes(s);
  }
  return false;
}
