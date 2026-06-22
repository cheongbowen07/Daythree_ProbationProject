import { 
  Users, ShieldCheck, UserCog, Building2, LayoutDashboard, BarChart3, Clock, ScrollText, FileText, Settings
} from "lucide-react";

export const TODAY = "19 Jun 2026";
export const LM_SELF = "Marcus Lee";
export const HRBP_SELF = "Niresha";

/* ---------- status helpers ----------------------------------------------- */
export function statusLabel(s) {
  const map = {
    "KPI-Review": "Prob – KPI Review",
    "KPI-Review(Acting)": "Prob – KPI Review (Acting)",
    "Pending-Letter": "Prob – Pending Letter",
    "Pending-Letter(Acting)": "Prob – Pending Letter (Acting)",
    "Ext-Pending-Letter": "Extension – Pending Letter",
    "Complete-Conf": "Complete – Confirmed",
    "Complete-NConf": "Complete – Not Confirmed",
    "Terminated": "Prob – Terminated",
  };
  if (map[s]) return map[s];
  let m;
  if ((m = s.match(/^Mth(\d)-Review$/))) return `Prob – Month ${m[1]} Review`;
  if ((m = s.match(/^Mth(\d)-DR-Acpt$/))) return `Prob – Month ${m[1]} DR Acceptance`;
  if ((m = s.match(/^Ext-Mth(\d)-Review$/))) return `Extension – Month ${m[1]} Review`;
  if ((m = s.match(/^Ext-Mth(\d)-DR-Acpt$/))) return `Extension – Month ${m[1]} DR Acceptance`;
  if ((m = s.match(/^(.*)-Letter$/))) return `Prob – ${m[1]} Letter`;
  if ((m = s.match(/^Pending-(.*)-Sign-Off$/))) return `Pending ${m[1]} Sign-Off`;
  return s;
}

export function tone(s) {
  if (s.startsWith("KPI")) return "kpi";
  if (/-Review$/.test(s)) return "review";
  if (/-DR-Acpt$/.test(s)) return "accept";
  if (s === "Pending-Letter" || s === "Pending-Letter(Acting)" || s === "Ext-Pending-Letter") return "pending";
  if (/-Letter$/.test(s)) return "letter";
  if (/Sign-Off$/.test(s)) return "sign";
  if (s === "Complete-Conf") return "confirmed";
  if (s === "Complete-NConf") return "nconf";
  if (s === "Terminated") return "terminated";
  return "kpi";
}

export const TONE_CLASS = {
  kpi: "bg-[#EFE8FF] text-[#5D3FD3] ring-[#C3B1F5]",
  review: "bg-[#E8F3FF] text-[#1A6ECC] ring-[#A8D1FF]",
  accept: "bg-[#E8FAF4] text-[#1A7D5E] ring-[#A8E8D0]",
  pending: "bg-[#FFF3D6] text-[#9A6400] ring-[#FFD98A]",
  letter: "bg-[#EFE8FF] text-[#5D3FD3] ring-[#C3B1F5]",
  sign: "bg-[#FCD9D9] text-[#C8102E] ring-[#F5A5A5]",
  confirmed: "bg-[#E8FAF4] text-[#1A7D5E] ring-[#A8E8D0]",
  nconf: "bg-[#FCD9D9] text-[#D62828] ring-[#F0AAAA]",
  terminated: "bg-[#E0E0E0] text-[#4D4D4D] ring-[#B0B0B0]",
};

export function monthFromStatus(s) {
  let m;
  if ((m = s.match(/Mth(\d)-(Review|DR-Acpt)/))) return parseInt(m[1], 10);
  return null;
}

export function isActiveProbation(s) {
  return !["Complete-Conf", "Complete-NConf", "Terminated"].includes(s);
}

export function totalCycles(rec) { return rec.gradeBand === "M09_M12" ? 6 : 3; }
export function daysCap(rec) { return rec.gradeBand === "M09_M12" ? 180 : 90; }

/* ---------- lifecycle rail stages ---------------------------------------- */
export function getStages(rec) {
  if (rec.phase === "EXT") {
    const st = [{ key: "ext-start", label: "Extension start" }];
    for (let m = 1; m <= 3; m++) {
      st.push({ key: `ext-m${m}r`, label: `Ext · Month ${m} review` });
      st.push({ key: `ext-m${m}a`, label: `Ext · Month ${m} acceptance` });
    }
    st.push({ key: "ext-pending", label: "Outcome (Conf / Non-Conf)" });
    st.push({ key: "ext-sign", label: "E-signature" });
    st.push({ key: "ext-done", label: "Complete" });
    return st;
  }
  const cycles = totalCycles(rec);
  const st = [{ key: "kpi", label: rec.wf === "WF2" ? "KPI (Acting)" : "KPI & Targets" }];
  for (let m = 1; m <= cycles; m++) {
    st.push({ key: `m${m}r`, label: `Month ${m} review` });
    st.push({ key: `m${m}a`, label: `Month ${m} acceptance` });
  }
  st.push({ key: "pending", label: "Outcome & letter" });
  st.push({ key: "sign", label: "E-signature" });
  st.push({ key: "done", label: "Complete" });
  return st;
}

export function currentStageKey(rec) {
  const s = rec.status;
  if (rec.phase === "EXT") {
    let m;
    if ((m = s.match(/^Ext-Mth(\d)-Review$/))) return `ext-m${m[1]}r`;
    if ((m = s.match(/^Ext-Mth(\d)-DR-Acpt$/))) return `ext-m${m[1]}a`;
    if (s === "Ext-Pending-Letter") return "ext-pending";
    if (/Sign-Off$/.test(s)) return "ext-sign";
    if (s === "Complete-Conf" || s === "Complete-NConf") return "ext-done";
    return "ext-start";
  }
  if (s.startsWith("KPI")) return "kpi";
  let m;
  if ((m = s.match(/^Mth(\d)-Review$/))) return `m${m[1]}r`;
  if ((m = s.match(/^Mth(\d)-DR-Acpt$/))) return `m${m[1]}a`;
  if (s === "Pending-Letter" || s === "Pending-Letter(Acting)" || /-Letter$/.test(s)) return "pending";
  if (/Sign-Off$/.test(s)) return "sign";
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

export const OUTCOME_TO_SIGN = {
  Conf: "Pending-Conf-Sign-Off", EarlyConf: "Pending-Conf-Sign-Off", Ext: "Pending-Ext-Sign-Off",
  NConf: "Pending-NConf-Sign-Off", ActingConf: "Pending-ActingConf-Sign-Off", ActingNConf: "Pending-ActingNConf-Sign-Off",
};

export const OUTCOME_TO_LETTER = {
  Conf: "Conf-Letter", EarlyConf: "EarlyConf-Letter", Ext: "Ext-Letter",
  NConf: "NConf-Letter", ActingConf: "Acting-Conf-Letter", ActingNConf: "Acting-NConf-Letter",
};

export const ROLES = [
  { id: "LM", label: "Line Manager", who: LM_SELF, icon: Users, scope: "Own team only" },
  { id: "DR", label: "Direct Report", who: "self", icon: UserCog, scope: "Own record only" },
  { id: "HRBP", label: "HR Business Partner", who: HRBP_SELF, icon: ShieldCheck, scope: "Organisation-wide" },
  { id: "LEAD", label: "Senior Leadership", who: "HR Director", icon: Building2, scope: "Aggregate, no names" },
];

export const NAV = {
  LM: [["dashboard", "My Team Probation", LayoutDashboard, "S-01"], ["reports", "Reports & Analytics", BarChart3, "S-12"]],
  DR: [["myprob", "My Probation", UserCog, "S-04"]],
  HRBP: [
    ["pipeline", "Probation Pipeline", LayoutDashboard, "S-06"],
    ["sla", "SLA Tracker", Clock, "S-08"],
    ["audit", "Audit Trail", ScrollText, "S-09"],
    ["reports", "Reports & Analytics", BarChart3, "S-12"],
    ["settings_upload", "Settings/Upload Document", FileText, "A-05"],
    ["console", "System Console", Settings, "A-01·02·04"],
  ],
  LEAD: [["reports", "Reports & Analytics", BarChart3, "S-12"]],
};