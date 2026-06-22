import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import {
  LayoutDashboard, Users, FileText, PenLine, BarChart3, ShieldCheck,
  ClipboardList, Clock, AlertTriangle, CheckCircle2, XCircle, RefreshCw,
  ChevronRight, Download, Bell, Building2, ScrollText, Gavel, UserCog,
  Search, ArrowRight, Lock, Send, FileSignature, Settings, Play, Info,
  Plus, X, Briefcase, ChevronDown, Calendar, Inbox,
} from "lucide-react";

/* ============================================================================
   FAITH · Probation Process Digitalisation — Interactive Prototype
   Built from BRD / FRD / Project Charter v2.1 (May 2026)
   Simulated in-memory state. No backend, no real auth, no persistence.
   ========================================================================== */

const TODAY = "19 Jun 2026";
const LM_SELF = "Marcus Lee";
const HRBP_SELF = "Niresha";

/* ---------- generic helpers ---------------------------------------------- */
function downloadCSV(filename, rows) {
  const csv = rows
    .map((r) => r.map((c) => `"${String(c == null ? "" : c).replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ---------- status helpers ----------------------------------------------- */
function statusLabel(s) {
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
function tone(s) {
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
const TONE_CLASS = {
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

function monthFromStatus(s) {
  let m;
  if ((m = s.match(/Mth(\d)-(Review|DR-Acpt)/))) return parseInt(m[1], 10);
  return null;
}
function isActiveProbation(s) {
  return !["Complete-Conf", "Complete-NConf", "Terminated"].includes(s);
}
function totalCycles(rec) { return rec.gradeBand === "M09_M12" ? 6 : 3; }
function daysCap(rec) { return rec.gradeBand === "M09_M12" ? 180 : 90; }

/* ---------- lifecycle rail stages ---------------------------------------- */
function getStages(rec) {
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
function currentStageKey(rec) {
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

/* ---------- outcome / letter mapping ------------------------------------- */
function outcomeOptions(rec) {
  if (rec.wf === "WF2")
    return [["ActingConf", "Acting Confirmation", "LT-05"], ["ActingNConf", "Acting Non-Confirmation", "LT-06"]];
  if (rec.phase === "EXT")
    return [["Conf", "Confirmation", "LT-01"], ["NConf", "Non-Confirmation", "LT-03"]];
  const base = [["Conf", "Confirmation", "LT-01"], ["Ext", "Extension", "LT-02"], ["NConf", "Non-Confirmation", "LT-03"]];
  if (rec.gradeBand === "M09_M12") base.push(["EarlyConf", "Early Confirmation", "LT-04"]);
  return base;
}
const OUTCOME_TO_SIGN = {
  Conf: "Pending-Conf-Sign-Off", EarlyConf: "Pending-Conf-Sign-Off", Ext: "Pending-Ext-Sign-Off",
  NConf: "Pending-NConf-Sign-Off", ActingConf: "Pending-ActingConf-Sign-Off", ActingNConf: "Pending-ActingNConf-Sign-Off",
};
const OUTCOME_TO_LETTER = {
  Conf: "Conf-Letter", EarlyConf: "EarlyConf-Letter", Ext: "Ext-Letter",
  NConf: "NConf-Letter", ActingConf: "Acting-Conf-Letter", ActingNConf: "Acting-NConf-Letter",
};

/* ---------- seed data ----------------------------------------------------- */
function defaultKpis() {
  return [
    { name: "Role onboarding & systems proficiency", target: "Independent in core tools", weight: 30 },
    { name: "Quality of work output", target: "Meets team quality bar", weight: 40 },
    { name: "Collaboration & communication", target: "Positive peer feedback", weight: 30 },
  ];
}
function seedRecords() {
  return [
    { id: 1, name: "Aisha Rahman", empId: "EMP-1042", grade: "E08", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF, joined: "17 May 2026", day: 33, status: "Mth1-Review", phase: "NEW", currentCycle: 1, employmentStatus: "Probation", reviews: [], kpis: defaultKpis() },
    { id: 2, name: "Bryan Koh", empId: "EMP-1071", grade: "E07", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF, joined: "14 May 2026", day: 36, status: "Mth1-DR-Acpt", phase: "NEW", currentCycle: 1, employmentStatus: "Probation", reviews: [{ cycle: 1, rpm: 4, rec: "On track against onboarding KPIs.", actor: LM_SELF }], reminders: 4, kpis: defaultKpis() },
    { id: 3, name: "Chandra Devi", empId: "EMP-0915", grade: "M11", gradeBand: "M09_M12", wf: "WF1", lm: LM_SELF, joined: "15 Mar 2026", day: 96, status: "Mth3-DR-Acpt", phase: "NEW", currentCycle: 3, employmentStatus: "Probation", reviews: [{ cycle: 1, rpm: 4 }, { cycle: 2, rpm: 3 }, { cycle: 3, rpm: 4 }], reminders: 2, kpis: defaultKpis() },
    { id: 4, name: "Daniel Wong", empId: "EMP-1100", grade: "E08", gradeBand: "E08_below", wf: "WF1", lm: "Priya Nair", joined: "19 Mar 2026", day: 92, status: "Pending-Letter", phase: "NEW", currentCycle: 3, employmentStatus: "Probation", slaDays: 1, slaBreached: false, reviews: [{ cycle: 1, rpm: 3 }, { cycle: 2, rpm: 4 }, { cycle: 3, rpm: 4 }], kpis: defaultKpis() },
    { id: 5, name: "Elena Garcia", empId: "EMP-1003", grade: "E06", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF, joined: "12 Mar 2026", day: 99, status: "Pending-NConf-Sign-Off", phase: "NEW", currentCycle: 3, employmentStatus: "Probation", outcome: "NConf", letterType: "LT-03", letterId: "LTR-2041", legalReviewed: true, reviews: [{ cycle: 1, rpm: 2 }, { cycle: 2, rpm: 2 }, { cycle: 3, rpm: 1 }], reminders: 3, kpis: defaultKpis() },
    { id: 6, name: "Faiz Osman", empId: "EMP-0880", grade: "M12", gradeBand: "M09_M12", wf: "WF1", lm: "Priya Nair", joined: "23 Dec 2025", day: 178, status: "Mth6-DR-Acpt", phase: "NEW", currentCycle: 6, employmentStatus: "Probation", reviews: [{ cycle: 1, rpm: 5 }, { cycle: 2, rpm: 4 }, { cycle: 3, rpm: 5 }, { cycle: 4, rpm: 5 }, { cycle: 5, rpm: 4 }, { cycle: 6, rpm: 5 }], reminders: 1, kpis: defaultKpis() },
    { id: 7, name: "Grace Lim", empId: "EMP-1150", grade: "E08", gradeBand: "E08_below", wf: "WF2", lm: LM_SELF, joined: "16 Apr 2026", day: 64, status: "Mth2-Review", phase: "NEW", currentCycle: 2, employmentStatus: "Acting probation", acting: { grade: "M09", allowance: "RM 1,200 / mo", start: "16 Apr 2026" }, reviews: [{ cycle: 1, rpm: 4 }], kpis: defaultKpis() },
    { id: 8, name: "Hassan Ali", empId: "EMP-0790", grade: "M11", gradeBand: "M09_M12", wf: "WF2", lm: "David Tan", joined: "16 Mar 2026", day: 95, status: "Mth3-DR-Acpt", phase: "NEW", currentCycle: 3, employmentStatus: "Acting probation", acting: { grade: "M12", allowance: "RM 2,500 / mo", start: "16 Mar 2026" }, reviews: [{ cycle: 1, rpm: 4 }, { cycle: 2, rpm: 4 }, { cycle: 3, rpm: 3 }], reminders: 2, kpis: defaultKpis() },
    { id: 9, name: "Ivy Chong", empId: "EMP-0701", grade: "E08", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF, joined: "19 Feb 2026", day: 120, status: "Complete-Conf", phase: "NEW", currentCycle: 3, employmentStatus: "Confirmed", outcome: "Conf", reviews: [{ cycle: 1, rpm: 4 }, { cycle: 2, rpm: 5 }, { cycle: 3, rpm: 4 }], kpis: defaultKpis() },
    { id: 10, name: "Jamal Idris", empId: "EMP-0655", grade: "E07", gradeBand: "E08_below", wf: "WF1", lm: "David Tan", joined: "10 Apr 2026", day: 70, status: "Terminated", phase: "NEW", currentCycle: 2, employmentStatus: "Probation (ended)", terminationReason: "Resignation", reviews: [{ cycle: 1, rpm: 3 }, { cycle: 2, rpm: 3 }], kpis: defaultKpis() },
    { id: 11, name: "Karen Soh", empId: "EMP-0512", grade: "E08", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF, joined: "01 Mar 2026", day: 110, status: "Ext-Mth1-Review", phase: "EXT", currentCycle: 1, employmentStatus: "Probation (extended)", reviews: [{ cycle: 1, rpm: 3 }, { cycle: 2, rpm: 2 }, { cycle: 3, rpm: 3 }], kpis: defaultKpis() },
    { id: 12, name: "Leon Tan", empId: "EMP-0489", grade: "M10", gradeBand: "M09_M12", wf: "WF1", lm: "David Tan", joined: "13 Dec 2025", day: 188, status: "Pending-Letter", phase: "NEW", currentCycle: 6, employmentStatus: "Probation", slaDays: 6, slaBreached: true, reviews: [{ cycle: 1, rpm: 4 }, { cycle: 2, rpm: 4 }, { cycle: 3, rpm: 3 }, { cycle: 4, rpm: 4 }, { cycle: 5, rpm: 4 }, { cycle: 6, rpm: 4 }], kpis: defaultKpis() },
    { id: 13, name: "Mei Ling", empId: "EMP-1200", grade: "E08", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF, joined: "07 Jun 2026", day: 12, status: "KPI-Review", phase: "NEW", currentCycle: 0, employmentStatus: "Probation", reviews: [], kpis: [] },
  ];
}
let _aid = 0;
function tnow(seq) { const mm = String(34 - (seq % 34)).padStart(2, "0"); return `19 Jun 2026 · 09:${mm} MYT`; }
function ev(actor, type, detail, empId, prev = "", next = "") {
  _aid += 1;
  return { id: _aid, ts: tnow(_aid), actor, type, detail, empId, prev, next };
}
function seedAudit() {
  return [
    ev("System", "create", "Probation record created on employee creation", "EMP-1200", "—", "KPI-Review"),
    ev("System", "trigger", "N-09 sent to People Manager", "EMP-1200"),
    ev(LM_SELF, "review-submit", "Month 1 review submitted (RPM 4)", "EMP-1071", "Mth1-Review", "Mth1-DR-Acpt"),
    ev("System", "schedule", "N-04 daily reminder dispatched to DR", "EMP-1071"),
    ev("Priya Nair", "accept", "Month 3 DR acceptance — final cycle complete", "EMP-1100", "Mth3-DR-Acpt", "Pending-Letter"),
    ev("System", "sla-start", "N-06 sent to HRBP · A-04 5-day SLA started", "EMP-1100"),
    ev(HRBP_SELF, "letter-gen", "Non-Confirmation letter generated (legal review passed)", "EMP-1003", "Pending-Letter", "NConf-Letter"),
    ev(HRBP_SELF, "dispatch", "Letter dispatched to S-10 · N-08 to DR", "EMP-1003", "NConf-Letter", "Pending-NConf-Sign-Off"),
    ev("System", "sla-breach", "N-07 URGENT — letter SLA breached", "EMP-0489"),
  ].reverse();
}

/* ---------- roles & nav --------------------------------------------------- */
const ROLES = [
  { id: "LM", label: "Line Manager", who: LM_SELF, icon: Users, scope: "Own team only" },
  { id: "DR", label: "Direct Report", who: "self", icon: UserCog, scope: "Own record only" },
  { id: "HRBP", label: "HR Business Partner", who: HRBP_SELF, icon: ShieldCheck, scope: "Organisation-wide" },
  { id: "LEAD", label: "Senior Leadership", who: "HR Director", icon: Building2, scope: "Aggregate, no names" },
];
const NAV = {
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

/* ============================================================================
   ROOT
   ========================================================================== */
export default function App() {
  const [records, setRecords] = useState(seedRecords);
  const [audit, setAudit] = useState(seedAudit);
  const [role, setRole] = useState("LM");
  const [view, setView] = useState("dashboard");
  const [activeId, setActiveId] = useState(null);
  const [asDr, setAsDr] = useState(2);
  const [toast, setToast] = useState(null);
  const [banner, setBanner] = useState(true);
  const [roleMenu, setRoleMenu] = useState(false);
  // demo accounts for impersonation / "view as"
  const demoUsers = [
    { id: "u-lm", role: "LM", name: LM_SELF, empId: "MANAGER-1" },
    { id: "u-hrbp", role: "HRBP", name: HRBP_SELF, empId: "HRBP-1" },
    { id: "u-dr", role: "DR", name: "Bryan Koh", empId: "EMP-1071" },
    { id: "u-lead", role: "LEAD", name: "HR Director", empId: "LEAD-1" },
  ];
  const [currentUser, setCurrentUser] = useState(demoUsers[0]);
  const [templates, setTemplates] = useState({ Conf: null, NConf: null, Ext: null });
  // load persisted templates from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("faith_templates");
      if (raw) {
        const parsed = JSON.parse(raw);
        setTemplates(parsed);
      }
    } catch (e) { /* ignore */ }
  }, []);

  function uploadTemplate(type, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      const tpl = { name: file.name, url: dataUrl };
      setTemplates((t) => {
        const next = { ...t, [type]: tpl };
        try { localStorage.setItem("faith_templates", JSON.stringify(next)); } catch (e) { /* ignore */ }
        return next;
      });
    };
    reader.readAsDataURL(file);
  }

  function removeTemplate(type) {
    setTemplates((t) => {
      const next = { ...t, [type]: null };
      try { localStorage.setItem("faith_templates", JSON.stringify(next)); } catch (e) { /* ignore */ }
      return next;
    });
  }

  const log = (e) => setAudit((a) => [{ ...e, id: a.length + 1000 + Math.random() }, ...a]);
  const flash = (msg, kind = "ok") => { setToast({ msg, kind }); setTimeout(() => setToast(null), 2600); };

  function switchRole(r) { setRole(r); setView(NAV[r][0][0]); setActiveId(null); setRoleMenu(false); }
  function patch(id, fn, audits = []) {
    setRecords((rs) => rs.map((r) => (r.id === id ? fn({ ...r }) : r)));
    audits.forEach(log);
  }

  function submitReview(id, rpm, recText) {
    const r = records.find((x) => x.id === id);
    const n = monthFromStatus(r.status);
    const ext = r.phase === "EXT";
    const next = ext ? `Ext-Mth${n}-DR-Acpt` : `Mth${n}-DR-Acpt`;
    patch(id, (rec) => {
      rec.status = next;
      rec.reviews = [...rec.reviews.filter((v) => v.cycle !== n), { cycle: n, rpm, rec: recText, actor: rec.lm }];
      rec.reminders = 0;
      return rec;
    }, [
      ev(r.lm, "review-submit", `${ext ? "Extension " : ""}Month ${n} review submitted (RPM ${rpm})`, r.empId, r.status, next),
      ev("System", "schedule", "N-04 daily reminder to DR · A-02 7-day timer started", r.empId),
    ]);
    flash(`Month ${n} review submitted — sent to ${r.name} for acceptance`);
  }

  function acceptReview(id, actor) {
    const r = records.find((x) => x.id === id);
    const n = monthFromStatus(r.status);
    const ext = r.phase === "EXT";
    const isFinal = ext ? n >= 3 : n >= totalCycles(r);
    let next, audits;
    if (!isFinal) {
      next = ext ? `Ext-Mth${n + 1}-Review` : `Mth${n + 1}-Review`;
      audits = [
        ev(actor, "accept", `Month ${n} acceptance (${actor === "System" ? "auto-accept, 7-day" : "DR"})`, r.empId, r.status, next),
        ev("System", "trigger", `Month ${n + 1} review trigger → LM`, r.empId),
      ];
    } else {
      next = ext ? "Ext-Pending-Letter" : r.wf === "WF2" ? "Pending-Letter(Acting)" : "Pending-Letter";
      audits = [
        ev(actor, "accept", `Final cycle acceptance (${actor === "System" ? "auto-accept" : "DR"})`, r.empId, r.status, next),
        ev("System", "sla-start", "N-06 to HRBP · A-04 5-day SLA started", r.empId),
      ];
    }
    patch(id, (rec) => {
      rec.status = next; rec.reminders = 0;
      if (isFinal) { rec.slaDays = 0; rec.slaBreached = false; } else rec.currentCycle = n + 1;
      return rec;
    }, audits);
    flash(actor === "System" ? `Auto-accepted Month ${n} (actor: System)` : `Month ${n} accepted`);
  }

  function generateLetter(id, outcome, label, lt, legal) {
    const r = records.find((x) => x.id === id);
    const letterStatus = OUTCOME_TO_LETTER[outcome];
    const signStatus = OUTCOME_TO_SIGN[outcome];
    patch(id, (rec) => {
      rec.outcome = outcome; rec.letterType = lt; rec.letterId = "LTR-" + (2100 + rec.id);
      rec.legalReviewed = !!legal; rec.status = signStatus; rec.slaBreached = false;
      // attach template metadata when available
      const tpl = templates[outcome];
      if (tpl) { rec.letterTemplate = tpl.name; rec.letterTemplateUrl = tpl.url; }
      return rec;
    }, [
      ev(HRBP_SELF, "letter-gen", `${label} letter generated (${lt})${outcome === "NConf" ? " · legal review passed" : ""}`, r.empId, r.status, letterStatus),
      ev(HRBP_SELF, "dispatch", "Letter dispatched to S-10 · N-08 daily reminder to DR", r.empId, letterStatus, signStatus),
    ]);
    flash(`${label} letter generated & dispatched for signing`);
  }

  function signLetter(id, sig) {
    const r = records.find((x) => x.id === id);
    const o = r.outcome;
    let next, empStatus, extra = [];
    if (["Conf", "EarlyConf", "ActingConf"].includes(o)) {
      next = "Complete-Conf";
      empStatus = o === "ActingConf" ? "Confirmed (acting role)" : "Confirmed";
      if (o === "ActingConf") extra = [ev("System", "notify", "N-12 → Rewards (salary review) · N-13 → HOD", r.empId)];
    } else if (["NConf", "ActingNConf"].includes(o)) {
      next = "Complete-NConf";
      empStatus = o === "ActingNConf" ? "Reverted to previous role · allowance stopped" : "Not Confirmed";
    } else if (o === "Ext") {
      next = "Ext-Mth1-Review"; empStatus = "Probation (extended)";
      extra = [ev("System", "trigger", "N-10 → LM · single 3-month extension cycle begins", r.empId)];
    }
    patch(id, (rec) => {
      if (o === "Ext") { rec.phase = "EXT"; rec.currentCycle = 1; }
      rec.status = next; rec.employmentStatus = empStatus;
      rec.completion = {
        ts: TODAY + " · 09:30 MYT", empId: rec.empId, letterId: rec.letterId, letterType: rec.letterType,
        signature: sig.method === "typed" ? sig.typed : "Drawn signature",
        signatureMethod: sig.method,
        signatureImage: sig.image || "",
        ip: "10.42.7.118", ua: "Chrome 126 · FAITH Web",
      };
      return rec;
    }, [
      ev(r.name, "sign", `Letter ${r.letterId} signed via S-10/F-09 · A-09 processed`, r.empId, r.status, next),
      ev("System", "emp-update", `A-05 employment status → ${empStatus}`, r.empId),
      ...extra,
    ]);
    flash("Signed. Employment status updated automatically.");
  }

  function escalate(id, issue, desc) {
    const r = records.find((x) => x.id === id);
    log(ev(r.lm, "escalation", `F-06 raised: ${issue} — ${desc}`, r.empId));
    log(ev("System", "notify", "N-11 → HRBP", r.empId));
    flash("Escalation sent to HRBP (N-11)");
  }
  function terminate(id, reason, remarks) {
    const r = records.find((x) => x.id === id);
    patch(id, (rec) => { rec.status = "Terminated"; rec.terminationReason = reason; rec.employmentStatus = "Probation (ended)"; rec.reminders = 0; return rec; }, [
      ev(r.lm, "terminate", `F-11 early termination: ${reason}${remarks ? " — " + remarks : ""}`, r.empId, r.status, "Terminated"),
      ev("System", "notify", "N-14 → stakeholders · all open tasks cancelled", r.empId),
    ]);
    flash("Probation terminated — all pending tasks cancelled");
  }
  function saveKpis(id, kpis) {
    const r = records.find((x) => x.id === id);
    patch(id, (rec) => { rec.kpis = kpis; return rec; }, [ev(r.lm, "kpi", `KPIs set (${kpis.length}) · armed for Day-31 trigger`, r.empId)]);
    flash("KPIs saved — awaiting Day-31 review trigger (A-01)");
  }
  function addRecord(rec) {
    const id = Math.max(...records.map((r) => r.id)) + 1;
    const full = {
      id, ...rec, lm: LM_SELF, phase: "NEW", currentCycle: 0,
      status: rec.wf === "WF2" ? "KPI-Review(Acting)" : "KPI-Review",
      employmentStatus: rec.wf === "WF2" ? "Acting probation" : "Probation",
      reviews: [], kpis: [], day: 1,
    };
    setRecords((rs) => [...rs, full]);
    log(ev(LM_SELF, "create", `${rec.wf === "WF2" ? "Acting-role (F-10)" : "New-hire (F-01)"} probation initiated`, rec.empId, "—", full.status));
    if (rec.wf === "WF2") log(ev("HOD", "approve", `N-13 HOD approval captured for acting placement (${rec.acting.grade})`, rec.empId));
    flash(`${rec.name} added — set KPIs to continue`);
    setActiveId(id);
  }

  function reportExport(roleName, reportCode, format, rowCount) {
    const scope = roleName === "LM" ? "own-team" : roleName === "LEAD" ? "aggregate" : "org-wide";
    log(ev(ROLES.find((r) => r.id === roleName)?.who || roleName, "export", `${reportCode} ${format.toUpperCase()} export · scope=${scope} · rows=${rowCount}`, "REPORT", "", reportCode));
    flash(`${reportCode} ${format.toUpperCase()} export logged to audit`);
  }

  function runScheduler() {
    let moved = 0;
    setRecords((rs) => rs.map((r) => {
      if (r.status === "KPI-Review" && r.kpis.length > 0) {
        moved++;
        log(ev("System", "schedule", "A-01: Day 31 reached → Month 1 review · N-01 to LM", r.empId, r.status, "Mth1-Review"));
        return { ...r, status: "Mth1-Review", currentCycle: 1, day: Math.max(r.day, 31) };
      }
      return r;
    }));
    flash(moved ? `A-01 advanced ${moved} record(s) to Month 1` : "A-01: no records due for a calendar trigger");
  }
  function runAutoAccept() {
    const due = records.filter((r) => /-DR-Acpt$/.test(r.status));
    if (!due.length) { flash("A-02: no acceptance windows open"); return; }
    due.forEach((r) => acceptReview(r.id, "System"));
    flash(`A-02 auto-accepted ${due.length} overdue acceptance(s)`);
  }
  function runSlaCheck() {
    let breached = 0;
    setRecords((rs) => rs.map((r) => {
      if (r.status.includes("Pending-Letter") && (r.slaDays || 0) >= 5 && !r.slaBreached) {
        breached++;
        log(ev("System", "sla-breach", "A-04: N-07 URGENT — letter SLA breached", r.empId));
        return { ...r, slaBreached: true };
      }
      return r;
    }));
    flash(breached ? `A-04 flagged ${breached} SLA breach(es)` : "A-04: all letters within SLA");
  }

  /* ---------- RBAC helpers ---------------------------------------------- */
  function canViewRecord(viewRole, user, rec) {
    if (viewRole === "HRBP") return true;
    if (viewRole === "LEAD") return true; // LEAD sees aggregates; keep records available for reports
    if (viewRole === "LM") return rec.lm === user.name;
    if (viewRole === "DR") return rec.empId === user.empId;
    return false;
  }
  function canPerform(viewRole, user, rec, action) {
    if (viewRole === "HRBP") return true;
    if (viewRole === "LM") return rec.lm === user.name;
    if (viewRole === "DR") return rec.empId === user.empId && ["acceptReview", "view"].includes(action);
    return false;
  }

  // build a records view constrained by the currently selected role + account
  const visibleRecords = (role === "LEAD")
    ? records // leave full dataset for aggregated reports (UI components may redact names)
    : records.filter((r) => canViewRecord(role, currentUser, r));

  const active = records.find((r) => r.id === activeId) || null;

  return (
    <div className="min-h-screen w-full text-[#4D4D4D]" style={{ background: "var(--paper)", fontFamily: "var(--sans)" }}>
      <StyleVars />
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 sm:px-6 h-16 text-white shadow-sm" style={{ background: "linear-gradient(90deg, var(--brand-purple), var(--sky))" }}>
        <div className="flex items-center gap-3">
          <div className="grid place-items-center w-10 h-10 rounded-lg bg-white/95 ring-1 ring-white/40 overflow-hidden">
            <img src="/daythree-logo.png" alt="Daythree" className="h-6 w-9 object-contain object-left" />
          </div>
          <div className="leading-tight">
            <div className="font-semibold tracking-tight">FAITH Probation</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-white/70" style={{ fontFamily: "var(--mono)" }}>Daythree Workflow</div>
          </div>
        </div>
          <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-white/55 text-xs px-2.5 py-1.5 rounded-md" style={{ background: "rgba(255,255,255,.07)", fontFamily: "var(--mono)" }}><Calendar size={13} /> {TODAY}</div>
          <div className="relative">
            <button onClick={() => setRoleMenu((v) => !v)} className="flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-md text-sm font-medium" style={{ background: "rgba(255,255,255,.12)" }}>
              <span className="text-white/55 text-[11px] hidden sm:inline">Viewing as</span>
              {(() => { const R = ROLES.find((x) => x.id === role); const I = R.icon; return (<><I size={15} /><span>{R.label}</span></>); })()}
              <ChevronDown size={14} className="text-white/60" />
            </button>
            {roleMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setRoleMenu(false)} />
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white text-slate-800 shadow-xl ring-1 ring-slate-200 z-20 overflow-hidden">
                  <div className="px-3.5 py-2.5 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100" style={{ fontFamily: "var(--mono)" }}>Switch role · RBAC demo</div>
                  {ROLES.map((R) => {
                    const I = R.icon; const on = R.id === role;
                    return (
                      <button key={R.id} onClick={() => switchRole(R.id)} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-slate-50 ${on ? "bg-slate-50" : ""}`}>
                        <div className="grid place-items-center w-8 h-8 rounded-md shrink-0" style={{ background: on ? "var(--brand)" : "#F4F4F4", color: on ? "white" : "#334155" }}><I size={16} /></div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium flex items-center gap-2">{R.label}{on && <span className="text-[10px] text-emerald-600 font-semibold">ACTIVE</span>}</div>
                          <div className="text-xs text-slate-500">{R.scope}{R.who !== "self" && ` · ${R.who}`}</div>
                        </div>
                      </button>
                    );
                  })}
                  <div className="px-3.5 py-2.5 text-[11px] uppercase tracking-wider text-slate-400 border-t border-b border-slate-100" style={{ fontFamily: "var(--mono)" }}>View as account</div>
                  {demoUsers.map((u) => (
                    <button key={u.id} onClick={() => { setCurrentUser(u); setRole(u.role); setRoleMenu(false); }} className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-slate-50`}> 
                      <div className="grid place-items-center w-8 h-8 rounded-md shrink-0" style={{ background: "#F4F4F4", color: "#334155" }}>{u.name[0]}</div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{u.name} <span className="text-xs text-slate-400">· {u.role}</span></div>
                        <div className="text-xs text-slate-500">{u.empId}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-3.5rem)]">
          <nav className="p-3 space-y-0.5">
            {NAV[role].map(([key, label, Icon, code]) => {
              const on = view === key;
              return (
                <button key={key} onClick={() => { setView(key); setActiveId(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${on ? "text-white" : "text-slate-600 hover:bg-slate-50"}`} style={on ? { background: "var(--brand)" } : {}}>
                  <Icon size={17} /><span className="font-medium">{label}</span>
                  <span className={`ml-auto text-[10px] ${on ? "text-white/55" : "text-slate-400"}`} style={{ fontFamily: "var(--mono)" }}>{code}</span>
                </button>
              );
            })}
          </nav>
          <div className="mt-auto p-3 space-y-2">
            <RoleCard role={role} />
            <button onClick={() => { setView("about"); setActiveId(null); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50"><Info size={14} /> About this prototype</button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1180px]">
          {banner && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-white ring-1 ring-amber-200 px-4 py-3 shadow-sm">
              <div className="grid place-items-center w-7 h-7 rounded-md bg-amber-50 text-amber-600 shrink-0"><Info size={15} /></div>
              <p className="text-sm text-slate-600 leading-relaxed"><span className="font-semibold text-slate-800">Interactive prototype.</span> Simulated in-memory data — no backend, auth, or persistence. Built from BRD / FRD / Charter v2.1. Switch roles (top-right) to see RBAC; drive the workflow from each role's screens.</p>
              <button onClick={() => setBanner(false)} className="ml-auto text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
          )}
          {view === "about" && <About />}
          {role === "LM" && view === "dashboard" && !active && <LMDashboard records={records} onOpen={setActiveId} onAdd={addRecord} />}
          {role === "LM" && view === "dashboard" && active && <CaseDetail rec={active} role={role} onBack={() => setActiveId(null)} onSubmitReview={submitReview} onEscalate={escalate} onTerminate={terminate} onSaveKpis={saveKpis} flash={flash} />}
          {role === "LM" && view === "reports" && <Reports records={records} role="LM" onReportExport={reportExport} />}
          {role === "DR" && view === "myprob" && <DRHome records={records} asDr={asDr} setAsDr={setAsDr} onAccept={acceptReview} onSign={signLetter} />}
          {role === "HRBP" && view === "pipeline" && !active && <HRBPPipeline records={records} onOpen={setActiveId} />}
          {role === "HRBP" && view === "pipeline" && active && <CaseDetail rec={active} role={role} onBack={() => setActiveId(null)} onGenerate={generateLetter} flash={flash} />}
          {role === "HRBP" && view === "sla" && <SLATracker records={records} />}
          {role === "HRBP" && view === "audit" && <AuditTrail audit={audit} />}
          {role === "HRBP" && view === "reports" && <Reports records={records} role="HRBP" onReportExport={reportExport} />}
          {role === "HRBP" && view === "settings_upload" && <HRBPTemplates templates={templates} onUploadTemplate={uploadTemplate} onRemoveTemplate={removeTemplate} />}
          {role === "HRBP" && view === "console" && <SystemConsole onScheduler={runScheduler} onAutoAccept={runAutoAccept} onSla={runSlaCheck} records={visibleRecords} templates={templates} onUploadTemplate={uploadTemplate} onRemoveTemplate={removeTemplate} />}
          {role === "LEAD" && view === "reports" && <Reports records={records} role="LEAD" onReportExport={reportExport} />}
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-white shadow-lg" style={{ background: toast.kind === "ok" ? "var(--mint)" : "var(--crimson)" }}>
          <CheckCircle2 size={17} /> {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ============================================================================
   SHARED UI
   ========================================================================== */
function StyleVars() {
  return (
    <style>{`
      :root{
        /* Primary: purple + sky blue */
        --brand:#5D3FD3; --brand-purple:#5D3FD3; --sky:#409CFF; --brand-2:#C8102E; --brand-red:#C8102E;
        /* Alerts and accents */
        --mint:#3CC49F; --amber:#FFB84D; --crimson:#C8102E; --coral:#FF9E3D;
        /* Typography and surfaces */
        --charcoal:#2F3438; --graphite:#333333; --paper:#f9f9f9; --smoke:#F4F4F4; --lavender:#C3B1F5;
        /* Utility */
        --hover-tint: rgba(16,24,40,0.04);
        --sans:"Source Sans 3","Source Sans Pro",ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
        --mono:ui-monospace,"SF Mono",Menlo,Monaco,"Cascadia Code","Roboto Mono",monospace; }
      *{ -webkit-font-smoothing:antialiased; }
      body{ background:var(--paper); }
      button:focus-visible{ box-shadow:0 0 0 3px rgba(93,63,211,.18); border-radius:8px; outline:none; }
      @keyframes fadeUp{ from{ opacity:0; transform:translateY(6px);} to{ opacity:1; transform:none;} }
      .fadeUp{ animation:fadeUp .25s ease both; }
      .brand-card{ border-color:rgba(211,199,223,.82); box-shadow:0 10px 24px rgba(47,48,51,.06); }
      .recharts-tooltip-wrapper .recharts-default-tooltip{ border:1px solid var(--lavender)!important; border-radius:8px!important; box-shadow:0 10px 24px rgba(47,48,51,.10)!important; }
      ::-webkit-scrollbar{ width:10px; height:10px; }
      ::-webkit-scrollbar-thumb{ background:#C3B1F5; border-radius:8px; border:2px solid var(--paper); }
      @media (prefers-reduced-motion: reduce){ .fadeUp{ animation:none; } }
    `}</style>
  );
}
function Mono({ children, className = "" }) { return <span className={className} style={{ fontFamily: "var(--mono)" }}>{children}</span>; }
function StatusBadge({ status, sm }) {
  const t = tone(status);
  return <span className={`inline-flex items-center rounded-full ring-1 font-medium ${TONE_CLASS[t]} ${sm ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"}`}>{statusLabel(status)}</span>;
}
function Tag({ children, className = "" }) { return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium ${className}`} style={{ fontFamily: "var(--mono)" }}>{children}</span>; }
function PageHead({ code, title, sub, right }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
      <div>
        <Mono className="text-[11px] font-semibold tracking-wide text-[#C8102E] bg-[#FCD9D9] px-1.5 py-0.5 rounded ring-1 ring-[#F5A5A5]">{code}</Mono>
        <h1 className="text-[22px] font-semibold tracking-tight text-[#4D4D4D] mt-1.5">{title}</h1>
        {sub && <p className="text-sm text-[#6E6E6E] mt-0.5 max-w-2xl">{sub}</p>}
      </div>
      {right}
    </div>
  );
}
function Card({ children, className = "" }) { return <div className={`rounded-lg bg-white ring-1 brand-card ${className}`}>{children}</div>; }
function Btn({ children, onClick, variant = "primary", size = "md", disabled, icon: Icon, className = "" }) {
  const sizes = { md: "px-3.5 py-2 text-sm", sm: "px-2.5 py-1.5 text-xs", lg: "px-4 py-2.5 text-sm" };
  const styles = {
    primary: "text-white hover:brightness-110",
    ghost: "text-[#4D4D4D] ring-1 ring-[#C3B1F5] hover:bg-[#EFE8FF] bg-white",
    danger: "text-white bg-[#C8102E] hover:brightness-110",
    soft: "text-[#5D3FD3] bg-[#EFE8FF] ring-1 ring-[#C3B1F5] hover:bg-[#E0D6FF]",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed ${sizes[size]} ${styles[variant]} ${className}`} style={variant === "primary" ? { background: "linear-gradient(90deg, var(--brand-purple), var(--sky))" } : {}}>
      {Icon && <Icon size={size === "sm" ? 14 : 16} />} {children}
    </button>
  );
}
function RoleCard({ role }) {
  const R = ROLES.find((x) => x.id === role); const I = R.icon;
  return (
    <div className="rounded-lg ring-1 ring-slate-200 bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-2 text-slate-700"><I size={15} /> <span className="text-sm font-medium">{R.label}</span></div>
      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500"><Lock size={11} /> {R.scope}</div>
    </div>
  );
}
function Empty({ icon: Icon, title, sub }) {
  return (
    <div className="grid place-items-center py-16 text-center">
      <div className="grid place-items-center w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mb-3"><Icon size={22} /></div>
      <p className="font-medium text-slate-700">{title}</p>
      {sub && <p className="text-sm text-slate-500 mt-1 max-w-sm">{sub}</p>}
    </div>
  );
}
function Row({ k, v }) { return <div className="flex justify-between gap-3"><dt className="text-slate-400">{k}</dt><dd className="text-slate-700 text-right">{v}</dd></div>; }
function RpmDots({ score }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => <div key={i} className={`w-2.5 h-2.5 rounded-sm ${i <= score ? (score >= 3 ? "bg-[#3CC49F]" : "bg-[#C8102E]") : "bg-[#F4F4F4]"}`} />)}
      <Mono className="ml-1.5 text-xs text-slate-500">{score}/5</Mono>
    </div>
  );
}

/* ---------- lifecycle rail (signature element) --------------------------- */
function LifecycleRail({ rec }) {
  const stages = getStages(rec);
  const curKey = currentStageKey(rec);
  const curIdx = stages.findIndex((s) => s.key === curKey);
  const done = rec.status === "Complete-Conf" || rec.status === "Complete-NConf";
  const terminated = rec.status === "Terminated";
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex items-stretch min-w-max">
        {stages.map((s, i) => {
          const past = terminated ? false : i < curIdx || done;
          const isCur = !terminated && i === curIdx && !done;
          const future = !past && !isCur;
          return (
            <div key={s.key} className="flex items-center">
              <div className="flex flex-col items-center w-[88px] text-center">
                <div className={`grid place-items-center w-7 h-7 rounded-full text-[11px] font-semibold ring-2 transition ${past ? "bg-[#3CC49F] text-[#0F4B37] ring-[#3CC49F]" : ""} ${isCur ? "text-white ring-[#C8102E]" : ""} ${future ? "bg-white text-slate-300 ring-[#C3B1F5]" : ""}`} style={isCur ? { background: "var(--brand-red)" } : {}}>
                  {past ? <CheckCircle2 size={15} /> : i + 1}
                </div>
                <div className={`mt-1.5 text-[10.5px] leading-tight ${isCur ? "text-[#C8102E] font-semibold" : past ? "text-[#4D4D4D]" : "text-slate-400"}`}>{s.label}</div>
              </div>
              {i < stages.length - 1 && <div className={`h-0.5 w-5 -mt-4 ${i < curIdx || done ? "bg-[#3CC49F]" : "bg-[#C3B1F5]"}`} />}
            </div>
          );
        })}
      </div>
      {terminated && <div className="mt-2 text-xs text-rose-600 font-medium flex items-center gap-1.5"><XCircle size={14} /> Probation terminated — lifecycle ended.</div>}
    </div>
  );
}

function pendingFor(rec, role) {
  const s = rec.status;
  if (role === "LM") { if (/-Review$/.test(s) || s === "KPI-Review" || s === "KPI-Review(Acting)") return true; }
  if (role === "DR") { if (/-DR-Acpt$/.test(s) || /Sign-Off$/.test(s)) return true; }
  if (role === "HRBP") { if (["Pending-Letter", "Pending-Letter(Acting)", "Ext-Pending-Letter"].includes(s)) return true; }
  return false;
}

/* ============================================================================
   S-01 · LINE MANAGER DASHBOARD
   ========================================================================== */
function LMDashboard({ records, onOpen, onAdd }) {
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const team = records.filter((r) => r.lm === LM_SELF);
  const filtered = team.filter((r) => (r.name + r.empId).toLowerCase().includes(q.toLowerCase()));
  const pending = team.filter((r) => pendingFor(r, "LM")).length;
  return (
    <div className="fadeUp">
      <PageHead code="S-01 · MyTeamProb" title="My Team Probation" sub={`${LM_SELF} · ${team.length} direct reports. Scope is enforced by A-08 — managers see only their own team.`} right={<Btn icon={Plus} onClick={() => setAddOpen(true)}>Initiate probation</Btn>} />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="Direct reports" value={team.length} icon={Users} />
        <Stat label="Pending my action" value={pending} icon={Bell} tone="amber" />
        <Stat label="In review cycle" value={team.filter((r) => /Mth/.test(r.status)).length} icon={ClipboardList} />
        <Stat label="Completed" value={team.filter((r) => !isActiveProbation(r.status)).length} icon={CheckCircle2} tone="emerald" />
      </div>
      <Card>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100">
          <Search size={16} className="text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or employee ID…" className="flex-1 text-sm outline-none placeholder:text-slate-400 bg-transparent" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <th className="px-4 py-2.5 font-medium">Employee</th><th className="px-4 py-2.5 font-medium">Grade</th><th className="px-4 py-2.5 font-medium">Type</th><th className="px-4 py-2.5 font-medium">Day</th><th className="px-4 py-2.5 font-medium">Status</th><th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const due = pendingFor(r, "LM");
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/70 cursor-pointer" onClick={() => onOpen(r.id)}>
                    <td className="px-4 py-3"><div className="font-medium text-slate-800 flex items-center gap-2">{r.name} {due && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}</div><Mono className="text-[11px] text-slate-400">{r.empId}</Mono></td>
                    <td className="px-4 py-3"><Tag className="bg-slate-100 text-slate-600">{r.grade}</Tag></td>
                    <td className="px-4 py-3"><Tag className={r.wf === "WF2" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}>{r.wf === "WF2" ? "Acting" : "New-hire"}</Tag></td>
                    <td className="px-4 py-3 text-slate-500"><Mono>{r.day}/{daysCap(r)}</Mono></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} sm /></td>
                    <td className="px-4 py-3 text-right"><span className={`inline-flex items-center gap-1 text-xs font-medium ${due ? "text-cyan-700" : "text-slate-400"}`}>{due ? "Action due" : "View"} <ChevronRight size={14} /></span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      {addOpen && <InitiateModal onClose={() => setAddOpen(false)} onAdd={(r) => { onAdd(r); setAddOpen(false); }} />}
    </div>
  );
}
function Stat({ label, value, icon: Icon, tone = "slate" }) {
  const tones = {
    slate: "text-[#5D3FD3] bg-[#EFE8FF]",
    amber: "text-[#9A6400] bg-[#FFF3D6]",
    emerald: "text-[#1A7D5E] bg-[#E8FAF4]",
  };
  return (
    <Card className="px-4 py-3.5 flex items-center gap-3">
      <div className={`grid place-items-center w-9 h-9 rounded-lg ${tones[tone]}`}><Icon size={18} /></div>
      <div><div className="text-xl font-semibold text-slate-900 leading-none">{value}</div><div className="text-xs text-slate-500 mt-1">{label}</div></div>
    </Card>
  );
}

/* ============================================================================
   CASE DETAIL (LM + HRBP)
   ========================================================================== */
function CaseDetail({ rec, role, onBack, onSubmitReview, onEscalate, onTerminate, onSaveKpis, onGenerate, flash }) {
  const [modal, setModal] = useState(null);
  const n = monthFromStatus(rec.status);
  const lmReviewDue = role === "LM" && /-Review$/.test(rec.status);
  const kpiDue = role === "LM" && (rec.status === "KPI-Review" || rec.status === "KPI-Review(Acting)");
  const letterDue = role === "HRBP" && ["Pending-Letter", "Pending-Letter(Acting)", "Ext-Pending-Letter"].includes(rec.status);
  const canTerminate = role === "LM" && isActiveProbation(rec.status);
  const earlyConf = role === "LM" && rec.gradeBand === "M09_M12" && rec.wf === "WF1" && /Mth[3-6]/.test(rec.status);
  return (
    <div className="fadeUp">
      <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-3"><ChevronRight size={15} className="rotate-180" /> Back</button>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{rec.name}</h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Mono className="text-xs text-slate-400">{rec.empId}</Mono>
            <Tag className="bg-slate-100 text-slate-600">{rec.grade}</Tag>
            <Tag className={rec.wf === "WF2" ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700"}>{rec.wf} · {rec.wf === "WF2" ? "Acting-Role" : "New-Hire"}</Tag>
            <StatusBadge status={rec.status} sm />
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="text-slate-400 text-xs">Employment status</div>
          <div className="font-semibold text-slate-800">{rec.employmentStatus}</div>
          {isActiveProbation(rec.status) && <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-600"><Lock size={11} /> Promotion blocked · DEP-09</div>}
        </div>
      </div>

      <Card className="px-5 py-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Probation lifecycle</div>
          <Mono className="text-[11px] text-slate-400">{rec.gradeBand === "M09_M12" ? "M09–M12 · 6 cycles" : "E08 & below · 3 cycles"}{rec.phase === "EXT" ? " · extension" : ""}</Mono>
        </div>
        <LifecycleRail rec={rec} />
      </Card>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {kpiDue && (
            <ActionPanel code="S-02 / F-02" title="Set KPIs & targets" tone="kpi" desc="KPIs are mandatory before the first review cycle and are visible to the direct report.">
              <Btn icon={ClipboardList} onClick={() => setModal("kpi")}>{rec.kpis.length ? "Edit KPIs" : "Set KPIs"}</Btn>
            </ActionPanel>
          )}
          {lmReviewDue && (
            <ActionPanel code="S-03 / F-03" title={`Submit Month ${n} review`} tone="review" desc="Score RPM 1–5 (≥3 meets expectations). On submit, the record moves to DR acceptance with daily reminders and the 7-day auto-accept timer.">
              <Btn icon={PenLine} onClick={() => setModal("review")}>Submit Month {n} review</Btn>
            </ActionPanel>
          )}
          {letterDue && <LetterGenPanel rec={rec} onGenerate={onGenerate} />}
          {!kpiDue && !lmReviewDue && !letterDue && (
            <Card className="px-5 py-6 text-center text-sm text-slate-500">{role === "LM" ? "No line-manager action is due on this record right now." : "No HRBP letter action is due on this record right now."}</Card>
          )}

          <Card className="p-5">
            <div className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2"><ClipboardList size={16} /> Review history</div>
            {rec.reviews.length === 0 ? <p className="text-sm text-slate-400">No reviews submitted yet.</p> : (
              <div className="space-y-2">
                {[...rec.reviews].sort((a, b) => a.cycle - b.cycle).map((rv) => (
                  <div key={rv.cycle} className="flex items-center gap-3 text-sm">
                    <Tag className="bg-slate-100 text-slate-600">Mth {rv.cycle}</Tag>
                    <RpmDots score={rv.rpm} />
                    <span className={`text-xs font-medium ${rv.rpm >= 3 ? "text-emerald-600" : "text-rose-600"}`}>{rv.rpm >= 3 ? "Meets expectations" : "Below threshold"}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {rec.completion && (
            <Card className="p-5">
              <div className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2"><FileSignature size={16} /> Signing completion record · A-09</div>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                {Object.entries({ "Letter": `${rec.letterId} · ${rec.letterType}`, "Signature": rec.completion.signature, "Timestamp": rec.completion.ts, "IP address": rec.completion.ip, "User agent": rec.completion.ua, "Signed PDF": "Stored in FAITH document library" }).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-3 border-b border-slate-50 py-1"><dt className="text-slate-400">{k}</dt><dd className="text-slate-700 text-right">{v}</dd></div>
                ))}
              </dl>
              {rec.completion.signatureImage && (
                <div className="mt-4 rounded-lg ring-1 ring-slate-200 bg-white p-3">
                  <div className="text-xs font-medium text-slate-400 mb-2">Captured drawn signature</div>
                  <img src={rec.completion.signatureImage} alt="Drawn signature" className="h-20 max-w-full object-contain" />
                </div>
              )}
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">Details</div>
            <dl className="space-y-2 text-sm">
              <Row k="Line manager" v={rec.lm} />
              <Row k="Joined" v={rec.joined} />
              <Row k="Day" v={<Mono>{rec.day} / {daysCap(rec)}</Mono>} />
              <Row k="Cycle" v={`${rec.currentCycle || 0} of ${rec.phase === "EXT" ? 3 : totalCycles(rec)}`} />
              {rec.acting && <><Row k="Acting grade" v={rec.acting.grade} /><Row k="Allowance" v={rec.acting.allowance} /><Row k="HOD approval" v={`${rec.acting.hodApproval || "Approved"} · ${rec.acting.approvedAt || rec.acting.start}`} /></>}
              {rec.terminationReason && <Row k="Termination" v={rec.terminationReason} />}
            </dl>
          </Card>

          <Card className="p-5">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3">KPIs & targets</div>
            {rec.kpis.length === 0 ? <p className="text-sm text-slate-400">Not set.</p> : (
              <ul className="space-y-2.5">
                {rec.kpis.map((k, i) => (
                  <li key={i} className="text-sm">
                    <div className="flex justify-between gap-2"><span className="text-slate-700">{k.name}</span><Tag className="bg-cyan-50 text-cyan-700 shrink-0">{k.weight}%</Tag></div>
                    <div className="text-xs text-slate-400 mt-0.5">{k.target}</div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {(canTerminate || earlyConf) && (
            <Card className="p-5 space-y-2">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-1">Manager actions</div>
              {earlyConf && <Btn variant="soft" size="sm" icon={Send} className="w-full" onClick={() => flash("Early confirmation request routed to HRBP (F-07 · LT-04)")}>Request early confirmation (F-07)</Btn>}
              <Btn variant="ghost" size="sm" icon={Inbox} className="w-full" onClick={() => setModal("escalate")}>Report inaccuracy (F-06)</Btn>
              {canTerminate && <Btn variant="ghost" size="sm" icon={XCircle} className="w-full text-rose-600 ring-rose-200 hover:bg-rose-50" onClick={() => setModal("terminate")}>Early termination (F-11)</Btn>}
            </Card>
          )}
        </div>
      </div>

      {modal === "kpi" && <KpiModal rec={rec} onClose={() => setModal(null)} onSave={(k) => { onSaveKpis(rec.id, k); setModal(null); }} />}
      {modal === "review" && <ReviewModal rec={rec} month={n} onClose={() => setModal(null)} onSubmit={(rpm, t) => { onSubmitReview(rec.id, rpm, t); setModal(null); }} />}
      {modal === "escalate" && <EscalateModal onClose={() => setModal(null)} onSubmit={(i, d) => { onEscalate(rec.id, i, d); setModal(null); }} />}
      {modal === "terminate" && <TerminateModal onClose={() => setModal(null)} onSubmit={(r, m) => { onTerminate(rec.id, r, m); setModal(null); }} />}
    </div>
  );
}
function ActionPanel({ code, title, desc, tone: t, children }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className={`grid place-items-center w-9 h-9 rounded-lg shrink-0 ${TONE_CLASS[t]}`}><Bell size={17} /></div>
        <div className="flex-1">
          <div className="flex items-center gap-2"><span className="font-semibold text-slate-800">{title}</span><Mono className="text-[10px] text-slate-400">{code}</Mono></div>
          <p className="text-sm text-slate-500 mt-1 mb-3">{desc}</p>
          {children}
        </div>
      </div>
    </Card>
  );
}

/* ---------- S-07 / F-05 letter generation -------------------------------- */
function LetterGenPanel({ rec, onGenerate }) {
  const opts = outcomeOptions(rec);
  const [sel, setSel] = useState(null);
  const [legal, setLegal] = useState(false);
  const selOpt = opts.find((o) => o[0] === sel);
  const needLegal = sel === "NConf";
  const ready = sel && (!needLegal || legal);
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-1"><span className="font-semibold text-slate-800">Generate outcome letter</span><Mono className="text-[10px] text-slate-400">S-07 / F-05</Mono></div>
      <p className="text-sm text-slate-500 mb-4">HRBP is the sole owner of letter generation. Selecting an outcome generates the templated letter and dispatches it to the internal e-signature screen (S-10).</p>
      <div className="grid sm:grid-cols-2 gap-2 mb-4">
        {opts.map(([code, label, lt]) => {
          const on = sel === code;
          return (
            <button key={code} onClick={() => setSel(code)} className={`flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg ring-1 text-left text-sm transition ${on ? "ring-cyan-500 bg-cyan-50" : "ring-slate-200 hover:bg-slate-50"}`}>
              <span className="font-medium text-slate-700">{label}</span>
              <Mono className={`text-[11px] ${on ? "text-cyan-700" : "text-slate-400"}`}>{lt}</Mono>
            </button>
          );
        })}
      </div>
      {needLegal && (
        <label className="flex items-start gap-2.5 p-3 mb-4 rounded-lg bg-rose-50 ring-1 ring-rose-200 cursor-pointer">
          <input type="checkbox" checked={legal} onChange={(e) => setLegal(e.target.checked)} className="mt-0.5" />
          <span className="text-sm text-rose-700"><Gavel size={13} className="inline mr-1" /> <span className="font-medium">Mandatory legal review.</span> Non-Confirmation (LT-03) cannot be generated until Legal has reviewed.</span>
        </label>
      )}
      {selOpt && (
        <div className="mb-4 rounded-lg ring-1 ring-slate-200 bg-slate-50 p-4 text-sm text-slate-600 leading-relaxed">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">Letter preview · {selOpt[2]}</div>
          <p><span className="text-slate-400">Re:</span> Probation Outcome — <span className="font-medium text-slate-800">{selOpt[1]}</span></p>
          <p className="mt-1.5">Dear {rec.name} ({rec.empId}), following completion of your {rec.gradeBand === "M09_M12" ? "6-month" : "3-month"} probation review cycle{rec.acting ? " in your acting role" : ""}, we confirm the outcome above, effective {TODAY}. {sel === "Ext" && "Your probation is extended by one fixed 3-month cycle. "}{sel === "ActingConf" && "Rewards will action your salary review and new-role benefits. "}{sel === "ActingNConf" && "You will revert to your previous role and the acting allowance will stop immediately. "}</p>
          <p className="mt-1.5 text-slate-400 text-xs">Merge fields populated from Employee Profile · signed copy stored in FAITH document library.</p>
        </div>
      )}
      <Btn icon={Send} disabled={!ready} onClick={() => onGenerate(rec.id, sel, selOpt[1], selOpt[2], legal)}>Generate & dispatch for signing</Btn>
    </Card>
  );
}

/* ============================================================================
   S-04 · DIRECT REPORT SELF-SERVICE  (+ S-05 accept, S-10 e-sign)
   ========================================================================== */
function DRHome({ records, asDr, setAsDr, onAccept, onSign }) {
  const rec = records.find((r) => r.id === asDr) || records[0];
  const acceptDue = /-DR-Acpt$/.test(rec.status);
  const signDue = /Sign-Off$/.test(rec.status);
  const drsWithAction = records.filter((r) => /-DR-Acpt$/.test(r.status) || /Sign-Off$/.test(r.status));
  return (
    <div className="fadeUp">
      <PageHead code="S-04 · MyProb" title="My Probation" sub="Direct reports see only their own record (A-08). Use the selector to step into any employee for this demo."
        right={
          <div className="relative">
            <select value={asDr} onChange={(e) => setAsDr(Number(e.target.value))} className="appearance-none text-sm bg-white ring-1 ring-slate-200 rounded-lg pl-3 pr-9 py-2 outline-none">
              {records.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.empId}</option>)}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        } />
      {drsWithAction.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <span className="text-xs text-slate-400 self-center">Needs action:</span>
          {drsWithAction.map((r) => (
            <button key={r.id} onClick={() => setAsDr(r.id)} className={`text-xs px-2.5 py-1 rounded-full ring-1 ${r.id === asDr ? "bg-cyan-50 ring-cyan-300 text-cyan-700" : "bg-white ring-slate-200 text-slate-600 hover:bg-slate-50"}`}>{r.name.split(" ")[0]} · {/Sign-Off$/.test(r.status) ? "sign" : "accept"}</button>
          ))}
        </div>
      )}
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{rec.name}</h2>
          <div className="flex items-center gap-2 mt-1"><Mono className="text-xs text-slate-400">{rec.empId}</Mono><Tag className="bg-slate-100 text-slate-600">{rec.grade}</Tag><StatusBadge status={rec.status} sm /></div>
        </div>
        <div className="text-right text-sm"><div className="text-slate-400 text-xs">Employment status</div><div className="font-semibold text-slate-800">{rec.employmentStatus}</div></div>
      </div>
      <Card className="px-5 py-4 mb-5"><LifecycleRail rec={rec} /></Card>
      {acceptDue && <DRAcceptPanel rec={rec} onAccept={onAccept} />}
      {signDue && <ESignPanel rec={rec} onSign={onSign} />}
      {!acceptDue && !signDue && (
        <div className="grid sm:grid-cols-2 gap-5">
          <Card className="p-5">
            <div className="text-sm font-semibold text-slate-800 mb-3">KPIs & targets</div>
            {rec.kpis.length ? <ul className="space-y-2">{rec.kpis.map((k, i) => <li key={i} className="text-sm text-slate-600 flex justify-between gap-2"><span>{k.name}</span><Tag className="bg-cyan-50 text-cyan-700">{k.weight}%</Tag></li>)}</ul> : <p className="text-sm text-slate-400">Awaiting KPI setup by your manager.</p>}
          </Card>
          <Card className="p-5">
            <div className="text-sm font-semibold text-slate-800 mb-3">Review history</div>
            {rec.reviews.length ? <div className="space-y-2">{[...rec.reviews].sort((a, b) => a.cycle - b.cycle).map((rv) => <div key={rv.cycle} className="flex items-center gap-2 text-sm"><Tag className="bg-slate-100 text-slate-600">Mth {rv.cycle}</Tag><RpmDots score={rv.rpm} /></div>)}</div> : <p className="text-sm text-slate-400">No reviews yet.</p>}
          </Card>
        </div>
      )}
    </div>
  );
}
function DRAcceptPanel({ rec, onAccept }) {
  const n = monthFromStatus(rec.status);
  const rv = rec.reviews.find((v) => v.cycle === n);
  return (
    <ActionPanel code="S-05 / F-04" title={`Acknowledge your Month ${n} review`} tone="accept" desc="Daily reminders continue until you accept. If no action is taken within 7 days, the system auto-accepts (A-02) and logs the actor as System.">
      <div className="rounded-lg ring-1 ring-slate-200 bg-slate-50 p-4 mb-3">
        <div className="flex items-center justify-between mb-2"><span className="text-sm font-medium text-slate-700">Manager assessment</span><RpmDots score={rv ? rv.rpm : 3} /></div>
        <p className="text-sm text-slate-500">{rv && rv.rec ? rv.rec : "Performance against your KPIs for this cycle."}</p>
      </div>
      <div className="flex items-center gap-3">
        <Btn icon={CheckCircle2} onClick={() => onAccept(rec.id, rec.name)}>Accept review</Btn>
        <span className="text-xs text-amber-600 flex items-center gap-1.5"><Clock size={13} /> Auto-accepts in 7 days · {rec.reminders || 0} reminders sent</span>
      </div>
    </ActionPanel>
  );
}

/* ---------- S-10 / F-09 internal e-signature ----------------------------- */
function ESignPanel({ rec, onSign }) {
  const [scrolled, setScrolled] = useState(false);
  const [ack, setAck] = useState(false);
  const [method, setMethod] = useState("typed");
  const [typed, setTyped] = useState("");
  const [drawn, setDrawn] = useState(false);
  const [drawnImage, setDrawnImage] = useState("");
  const ready = scrolled && ack && (method === "typed" ? typed.trim().length > 1 : drawn);
  const outcomeLabel = { Conf: "Confirmation", EarlyConf: "Early Confirmation", Ext: "Extension", NConf: "Non-Confirmation", ActingConf: "Acting Confirmation", ActingNConf: "Acting Non-Confirmation" }[rec.outcome] || "Outcome";
  function onScroll(e) { const el = e.target; if (el.scrollTop + el.clientHeight >= el.scrollHeight - 12) setScrolled(true); }
  return (
    <Card className="p-5 fadeUp">
      <div className="flex items-center gap-2 mb-1"><FileSignature size={18} className="text-violet-600" /><span className="font-semibold text-slate-800">Sign your probation letter</span><Mono className="text-[10px] text-slate-400">S-10 / F-09 / A-10</Mono></div>
      <p className="text-sm text-slate-500 mb-4">Everything happens inside FAITH — no third-party signing tool. Scroll to the end of the letter to enable signing.</p>
      <div onScroll={onScroll} className="h-56 overflow-y-auto rounded-lg ring-1 ring-slate-200 bg-white p-5 text-sm text-slate-600 leading-relaxed">
        <div className="text-center mb-4"><div className="font-semibold text-slate-800">PROBATION OUTCOME — {outcomeLabel.toUpperCase()}</div><Mono className="text-[11px] text-slate-400">{rec.letterId} · {rec.letterType}</Mono></div>
        <p>Dear {rec.name},</p>
        <p className="mt-2">Employee ID: {rec.empId} · Grade: {rec.grade}</p>
        <p className="mt-2">This letter confirms the outcome of your {rec.gradeBand === "M09_M12" ? "six-month" : "three-month"} probation period{rec.acting ? " in your acting assignment" : ""}, following completion of all scheduled monthly performance reviews and your acknowledgements.</p>
        <p className="mt-2">Outcome: <span className="font-medium text-slate-800">{outcomeLabel}</span>, effective {TODAY}.</p>
        <p className="mt-2">{rec.outcome === "Ext" && "Your probation will be extended by a single fixed three-month cycle. A further extension is not available; the subsequent outcome will be confirmation or non-confirmation only."}{rec.outcome === "NConf" && "Your employment will not be confirmed. Please refer to the notice and final working day clauses below. This outcome has been subject to mandatory legal review."}{["Conf", "EarlyConf"].includes(rec.outcome) && "We are pleased to confirm your employment. Your status in FAITH will update automatically upon signing."}{rec.outcome === "ActingConf" && "Your acting role is confirmed. Rewards will action your salary review and new-role benefits."}{rec.outcome === "ActingNConf" && "Your acting assignment will not be confirmed. You will revert to your previous role and the acting allowance will stop immediately."}</p>
        <p className="mt-2 text-slate-400">By signing below you acknowledge that you have read and understood this letter in full. A completion record — timestamp, employee ID, letter version, and IP address — will be captured for compliance.</p>
        <p className="mt-6 text-slate-400 text-xs">— End of letter —</p>
      </div>
      {!scrolled && <div className="mt-2 text-xs text-amber-600 flex items-center gap-1.5"><ChevronDown size={13} /> Scroll to the bottom of the letter to continue.</div>}
      <div className={`mt-4 space-y-3 transition ${scrolled ? "" : "opacity-40 pointer-events-none"}`}>
        <label className="flex items-start gap-2.5 cursor-pointer"><input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5" /><span className="text-sm text-slate-700">I confirm I have read and understood the full letter.</span></label>
        <div className="flex gap-2">
          {[["typed", "Type name"], ["drawn", "Draw signature"]].map(([m, l]) => <button key={m} onClick={() => setMethod(m)} className={`text-xs px-3 py-1.5 rounded-lg ring-1 ${method === m ? "bg-violet-50 ring-violet-300 text-violet-700" : "ring-slate-200 text-slate-600"}`}>{l}</button>)}
        </div>
        {method === "typed" ? (
          <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type your full name" className="w-full text-sm rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-violet-400" style={{ fontFamily: "'Brush Script MT', cursive", fontSize: "18px" }} />
        ) : (
          <SignaturePad
            value={drawnImage}
            onChange={(image, hasInk) => { setDrawnImage(image); setDrawn(hasInk); }}
          />
        )}
        <Btn icon={FileSignature} disabled={!ready} onClick={() => onSign(rec.id, { method, typed, image: drawnImage })}>Sign & acknowledge</Btn>
      </div>
    </Card>
  );
}

/* ============================================================================
   S-06 · HRBP PIPELINE
   ========================================================================== */
function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = "#4D4D4D";
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
      img.src = value;
    }
  }, [value]);

  function point(e) {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function begin(e) {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const p = point(e);
    drawingRef.current = true;
    canvas.setPointerCapture(e.pointerId);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }

  function move(e) {
    if (!drawingRef.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const p = point(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function end(e) {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
    onChange(canvas.toDataURL("image/png"), true);
  }

  function clear() {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    onChange("", false);
  }

  return (
    <div className="rounded-lg ring-1 ring-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500"><PenLine size={14} /> Draw inside the box</div>
        <button type="button" onClick={clear} className="text-xs font-medium text-slate-500 hover:text-slate-800">Clear</button>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={begin}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        className="block h-28 w-full cursor-crosshair touch-none bg-white"
        aria-label="Drawn signature field"
      />
    </div>
  );
}

function HRBPPipeline({ records, onOpen }) {
  const TABS = [["all", "All cases"], ["action", "Needs my action"], ["sla", "SLA at risk"], ["ext", "Extended"], ["sign", "Awaiting sign-off"]];
  const [tab, setTab] = useState("all");
  const f = records.filter((r) => {
    if (tab === "action") return ["Pending-Letter", "Pending-Letter(Acting)", "Ext-Pending-Letter"].includes(r.status);
    if (tab === "sla") return r.slaBreached || ((r.slaDays || 0) >= 4 && r.status.includes("Pending-Letter"));
    if (tab === "ext") return r.phase === "EXT";
    if (tab === "sign") return /Sign-Off$/.test(r.status);
    return true;
  });
  return (
    <div className="fadeUp">
      <PageHead code="S-06 · HRBP Pipeline" title="Probation Pipeline" sub="Organisation-wide visibility across all line managers and both workflows. HRBP is the sole owner of letter generation." />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <Stat label="Active probations" value={records.filter((r) => isActiveProbation(r.status)).length} icon={Users} />
        <Stat label="Letters pending" value={records.filter((r) => r.status.includes("Pending-Letter")).length} icon={FileText} tone="amber" />
        <Stat label="SLA breached" value={records.filter((r) => r.slaBreached).length} icon={AlertTriangle} tone="amber" />
        <Stat label="Awaiting signature" value={records.filter((r) => /Sign-Off$/.test(r.status)).length} icon={PenLine} />
      </div>
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {TABS.map(([k, l]) => <button key={k} onClick={() => setTab(k)} className={`text-sm px-3 py-1.5 rounded-lg font-medium transition ${tab === k ? "text-white" : "text-slate-600 bg-white ring-1 ring-slate-200 hover:bg-slate-50"}`} style={tab === k ? { background: "var(--brand)" } : {}}>{l}</button>)}
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
              <th className="px-4 py-2.5 font-medium">Employee</th><th className="px-4 py-2.5 font-medium">LM</th><th className="px-4 py-2.5 font-medium">Grade</th><th className="px-4 py-2.5 font-medium">Status</th><th className="px-4 py-2.5 font-medium">SLA</th><th className="px-4 py-2.5 font-medium text-right">Action</th>
            </tr></thead>
            <tbody>
              {f.map((r) => {
                const letterDue = ["Pending-Letter", "Pending-Letter(Acting)", "Ext-Pending-Letter"].includes(r.status);
                return (
                  <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/70 cursor-pointer" onClick={() => onOpen(r.id)}>
                    <td className="px-4 py-3"><div className="font-medium text-slate-800">{r.name}</div><Mono className="text-[11px] text-slate-400">{r.empId}</Mono></td>
                    <td className="px-4 py-3 text-slate-500">{r.lm}</td>
                    <td className="px-4 py-3"><Tag className="bg-slate-100 text-slate-600">{r.grade}</Tag></td>
                    <td className="px-4 py-3"><StatusBadge status={r.status} sm /></td>
                    <td className="px-4 py-3">{r.status.includes("Pending-Letter") ? (r.slaBreached ? <Tag className="bg-rose-100 text-rose-700">BREACHED</Tag> : <Mono className="text-xs text-slate-500">{r.slaDays || 0}/5 d</Mono>) : <span className="text-slate-300">—</span>}</td>
                    <td className="px-4 py-3 text-right"><span className={`inline-flex items-center gap-1 text-xs font-medium ${letterDue ? "text-cyan-700" : "text-slate-400"}`}>{letterDue ? "Generate letter" : "View"} <ChevronRight size={14} /></span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================================
   S-08 · SLA TRACKER
   ========================================================================== */
function SLATracker({ records }) {
  const pending = records.filter((r) => r.status.includes("Pending-Letter")).sort((a, b) => (b.slaBreached ? 1 : 0) - (a.slaBreached ? 1 : 0));
  return (
    <div className="fadeUp">
      <PageHead code="S-08 · SLA Tracker" title="Letter generation SLA" sub="HRBP has 5 business days to generate the outcome letter once notified (A-04). Breaches are flagged but do not block generation." />
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100"><th className="px-4 py-2.5 font-medium">Employee</th><th className="px-4 py-2.5 font-medium">LM</th><th className="px-4 py-2.5 font-medium">Days elapsed</th><th className="px-4 py-2.5 font-medium">SLA</th></tr></thead>
            <tbody>
              {pending.length === 0 && <tr><td colSpan={4} className="px-4 py-10 text-center text-slate-400">No letters pending generation.</td></tr>}
              {pending.map((r) => (
                <tr key={r.id} className={`border-b border-slate-50 ${r.slaBreached ? "bg-rose-50/40" : ""}`}>
                  <td className="px-4 py-3"><div className="font-medium text-slate-800">{r.name}</div><Mono className="text-[11px] text-slate-400">{r.empId}</Mono></td>
                  <td className="px-4 py-3 text-slate-500">{r.lm}</td>
                  <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full ${r.slaBreached ? "bg-rose-500" : "bg-cyan-500"}`} style={{ width: `${Math.min(100, ((r.slaDays || 0) / 5) * 100)}%` }} /></div><Mono className="text-xs text-slate-500">{r.slaDays || 0}/5 d</Mono></div></td>
                  <td className="px-4 py-3">{r.slaBreached ? <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-600"><AlertTriangle size={13} /> Breached · N-07 sent</span> : <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 size={13} /> Within SLA</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

/* ============================================================================
   S-09 · AUDIT TRAIL
   ========================================================================== */
const EVENT_META = {
  create: ["Created", "text-slate-600 bg-slate-100"], trigger: ["Trigger", "text-blue-600 bg-blue-50"],
  schedule: ["Scheduler", "text-blue-600 bg-blue-50"], "review-submit": ["Review", "text-blue-600 bg-blue-50"],
  accept: ["Acceptance", "text-cyan-600 bg-cyan-50"], "letter-gen": ["Letter", "text-indigo-600 bg-indigo-50"],
  dispatch: ["Dispatch", "text-violet-600 bg-violet-50"], sign: ["Signed", "text-violet-600 bg-violet-50"],
  "emp-update": ["Status", "text-emerald-600 bg-emerald-50"], "sla-start": ["SLA", "text-amber-600 bg-amber-50"],
  "sla-breach": ["SLA breach", "text-rose-600 bg-rose-50"], escalation: ["Escalation", "text-amber-600 bg-amber-50"],
  terminate: ["Terminated", "text-rose-600 bg-rose-50"], notify: ["Notify", "text-slate-600 bg-slate-100"], kpi: ["KPI", "text-slate-600 bg-slate-100"],
};
function AuditTrail({ audit }) {
  const [q, setQ] = useState("");
  const f = audit.filter((e) => (e.empId + e.detail + e.actor).toLowerCase().includes(q.toLowerCase()));
  function exportCsv() {
    const rows = [["Timestamp", "Employee", "Event", "Detail", "Actor", "Prev", "New"], ...f.map((e) => [e.ts, e.empId, e.type, e.detail, e.actor, e.prev, e.next])];
    downloadCSV("faith-audit-trail.csv", rows);
  }
  return (
    <div className="fadeUp">
      <PageHead code="S-09 · Audit Trail" title="Compliance audit trail" sub="Append-only, read-only (A-08). Every status change, submission, signing event, and reminder is traceable. Retention 7 years (pending Legal — OI-05)." right={<Btn icon={Download} variant="ghost" onClick={exportCsv}>Export CSV</Btn>} />
      <Card className="p-0">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100"><Search size={16} className="text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by employee, actor, or detail…" className="flex-1 text-sm outline-none bg-transparent placeholder:text-slate-400" /></div>
        <div className="divide-y divide-slate-50 max-h-[560px] overflow-y-auto">
          {f.map((e) => {
            const meta = EVENT_META[e.type] || ["Event", "text-slate-600 bg-slate-100"];
            return (
              <div key={e.id} className="flex items-start gap-3 px-4 py-3">
                <span className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded ${meta[1]}`} style={{ fontFamily: "var(--mono)" }}>{meta[0]}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-slate-700">{e.detail}</div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 flex-wrap">
                    <Mono>{e.ts}</Mono> · <Mono>{e.empId}</Mono> · {e.actor}
                    {e.prev && e.next && <span className="inline-flex items-center gap-1">· <Mono>{e.prev}</Mono><ArrowRight size={10} /><Mono>{e.next}</Mono></span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ============================================================================
   SYSTEM CONSOLE · A-01 / A-02 / A-04
   ========================================================================== */
function SystemConsole({ onScheduler, onAutoAccept, onSla, records, templates, onUploadTemplate, onRemoveTemplate }) {

  const actions = [
    { code: "A-01", title: "Review cycle scheduler", desc: "Daily clock job. Fires Day-31 (Month 1) and Day-61 (Month 2) triggers; chains Months 3–6 on prior acceptance.", btn: "Run scheduler", icon: RefreshCw, fn: onScheduler, count: records.filter((r) => r.status === "KPI-Review" && r.kpis.length).length, countLabel: "armed for Day-31" },
    { code: "A-02", title: "7-day auto-accept", desc: "If a direct report does not acknowledge within 7 days, the system auto-accepts and logs the actor as System.", btn: "Run auto-accept", icon: Clock, fn: onAutoAccept, count: records.filter((r) => /-DR-Acpt$/.test(r.status)).length, countLabel: "open windows" },
    { code: "A-04", title: "HRBP 5-day SLA check", desc: "Flags letter-generation tasks past 5 business days and dispatches the N-07 urgent reminder.", btn: "Run SLA check", icon: AlertTriangle, fn: onSla, count: records.filter((r) => r.status.includes("Pending-Letter") && (r.slaDays || 0) >= 5 && !r.slaBreached).length, countLabel: "due to breach" },
  ];
  return (
    <div className="fadeUp">
      <PageHead code="System automations" title="System Console" sub="In production these run automatically (cron + event-driven). Here they're manual so you can watch the invisible automation layer move records and write to the audit log." />
      <div className="grid md:grid-cols-3 gap-4">
        {actions.map((a) => (
          <Card key={a.code} className="p-5 flex flex-col">
            <div className="flex items-center justify-between mb-3"><div className="grid place-items-center w-10 h-10 rounded-lg bg-slate-100 text-slate-600"><a.icon size={20} /></div><Mono className="text-[11px] font-semibold text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded">{a.code}</Mono></div>
            <div className="font-semibold text-slate-800">{a.title}</div>
            <p className="text-sm text-slate-500 mt-1 mb-3 flex-1">{a.desc}</p>
            <div className="flex items-center justify-between"><Mono className="text-xs text-slate-400">{a.count} {a.countLabel}</Mono><Btn size="sm" icon={Play} onClick={a.fn}>{a.btn}</Btn></div>
          </Card>
        ))}
      </div>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3"><div className="text-sm font-semibold text-slate-800">HRBP Settings</div><Mono className="text-[11px] text-slate-400">Letter templates</Mono></div>
          <p className="text-sm text-slate-500 mb-4">Upload or remove the letter templates used for Confirmations, Non-Confirmations and Extensions. Files are stored in-memory for this prototype.</p>
          <div className="space-y-3">
              {[["Conf","Confirmation"],["NConf","Non-Confirmation"],["Ext","Extension"]].map(([k,label]) => (
              <div key={k} className="flex items-center gap-3 justify-between">
                <div>
                  <div className="text-sm font-medium">{label}</div>
                  <div className="text-xs text-slate-500">Template code: {k}</div>
                </div>
                <div className="flex items-center gap-2">
                  {templates && templates[k] ? (
                    <>
                      <a href={templates[k].url} download={templates[k].name} target="_blank" rel="noreferrer" className="text-sm text-slate-700 hover:underline">{templates[k].name}</a>
                      <input id={`file-${k}`} type="file" className="hidden" onChange={(e) => onUploadTemplate(k, e.target.files[0])} />
                      <label htmlFor={`file-${k}`} className="text-xs text-slate-500 underline cursor-pointer">Replace</label>
                      <button onClick={() => onRemoveTemplate(k)} className="ml-2 text-xs text-white bg-[#C8102E] px-2 py-1 rounded">Remove</button>
                    </>
                  ) : (
                    <>
                      <input id={`file-${k}`} type="file" className="hidden" onChange={(e) => onUploadTemplate(k, e.target.files[0])} />
                      <label htmlFor={`file-${k}`} className="text-sm text-white bg-[#5D3FD3] px-3 py-1 rounded cursor-pointer">Upload</label>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3"><div className="text-sm font-semibold text-slate-800">Template preview</div><Mono className="text-[11px] text-slate-400">Download / inspect</Mono></div>
          <div className="text-sm text-slate-500 mb-3">Quick access to the currently uploaded templates. Use these files when generating letters in `Pipeline`.</div>
          <div className="space-y-3">
            {Object.entries(templates).map(([k,v]) => (
              <div key={k} className="flex items-center justify-between">
                <div className="text-sm">{k}</div>
                <div>
                  {v ? <a href={v.url} download={v.name} target="_blank" rel="noreferrer" className="text-sm text-slate-700 hover:underline">Download</a> : <span className="text-xs text-slate-400">No template</span>}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ==========================================================================
   HRBP Templates / Settings (separate page)
   ========================================================================== */
function HRBPTemplates({ templates, onUploadTemplate, onRemoveTemplate }) {
  const [activeTab, setActiveTab] = useState("documents");
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Internal config state for demo
  const [config, setConfig] = useState({
    autoAccept: true,
    hodVerification: true,
    slaDays: 5,
    notifications: "daily"
  });

  const updateConfig = (k, v) => {
    setConfig({ ...config, [k]: v });
    setHasChanges(true);
  };

  const save = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); setHasChanges(false); }, 800);
  };

  return (
    <div className="fadeUp">
      <PageHead code="A-05" title="Settings / Documents" sub="Global configuration and template repository for the FAITH probation engine." />
      
      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6 shadow-sm border border-slate-200">
        <button onClick={() => setActiveTab("documents")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'documents' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <FileText size={16} /> Document Center
        </button>
        <button onClick={() => setActiveTab("settings")} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'settings' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
          <Settings size={16} /> Workflow Config
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {activeTab === "documents" ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              {[['Conf','Acceptance', '#3CC49F'],['Ext','Extension', '#FFB84D'],['NConf','Rejection', '#C8102E']].map(([k,label, color]) => (
                <Card key={k} className="p-0 overflow-hidden border-l-4" style={{ borderColor: color }}>
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="font-semibold text-slate-800">{label} Templates</div>
                    <div className="flex items-center gap-2">
                      <input id={`tpl-${k}`} type="file" className="hidden" onChange={(e) => { onUploadTemplate(k, e.target.files[0]); setHasChanges(true); }} />
                      <label htmlFor={`tpl-${k}`} className="text-sm text-white bg-[#5D3FD3] px-3 py-1.5 rounded-lg cursor-pointer hover:opacity-90 transition shadow-sm flex items-center gap-1">
                        <Upload size={14} /> Upload
                      </label>
                    </div>
                  </div>
                  <div className="divide-y divide-slate-100 min-h-[60px]">
                    {templates && templates[k] ? (
                      <div className="px-5 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-sm font-medium"><FileText size={16} className="text-slate-400" /> {templates[k].name}</div>
                        <button onClick={() => { onRemoveTemplate(k); setHasChanges(true); }} className="text-slate-300 hover:text-rose-600 p-2"><Trash2 size={16} /></button>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-slate-400 italic">No template uploaded</div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-300">
              <Card className="p-6">
                <div className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-50 flex items-center gap-2"><ShieldCheck size={18} className="text-indigo-600" /> Automation Logic</div>
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-700">7-Day Auto-Acceptance</div>
                      <div className="text-xs text-slate-500">Enable automatic system signing if DR doesn't act within SLA.</div>
                    </div>
                    <button onClick={() => updateConfig('autoAccept', !config.autoAccept)} className={`w-10 h-5 rounded-full relative transition ${config.autoAccept ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${config.autoAccept ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                    <div>
                      <div className="text-sm font-medium text-slate-700">HOD Verification</div>
                      <div className="text-xs text-slate-500">Require Head of Dept approval for all Acting Role outcomes.</div>
                    </div>
                    <button onClick={() => updateConfig('hodVerification', !config.hodVerification)} className={`w-10 h-5 rounded-full relative transition ${config.hodVerification ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${config.hodVerification ? 'left-[22px]' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="font-semibold text-slate-800 mb-4 pb-2 border-b border-slate-50 flex items-center gap-2"><Bell size={18} className="text-indigo-600" /> SLA & Alerts</div>
                <div className="space-y-5">
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-2">Letter Generation SLA: {config.slaDays} Days</div>
                    <input type="range" min="3" max="10" value={config.slaDays} onChange={(e) => updateConfig('slaDays', parseInt(e.target.value))} className="w-full accent-indigo-600" />
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-50 pt-4 text-sm">
                    <span className="text-slate-700">Audit Summary Frequency</span>
                    <select value={config.notifications} onChange={(e) => updateConfig('notifications', e.target.value)} className="bg-slate-100 border-none rounded-md px-2 py-1 text-xs outline-none">
                      <option value="none">None</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 font-semibold mb-3">
              <AlertCircle size={16} className="text-amber-500" />
              <span>Pending Changes</span>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">Changes across all tabs are staged until you confirm. Staging allows bulk updates to the workflow engine.</p>
            <Btn className="w-full" disabled={!hasChanges || saving} onClick={save}>
              {saving ? "Saving..." : "Confirm All Changes"}
            </Btn>
            {!hasChanges && <div className="text-[10px] text-slate-400 text-center mt-2 font-medium">System up-to-date</div>}
          </Card>
          
          <Card className="p-5 bg-gradient-to-br from-indigo-500 to-violet-600 border-0 text-white">
            <div className="font-semibold mb-1">Blob Storage</div>
            <div className="text-xs text-white/80 mb-4">42.8 MB of 500 MB used.</div>
            <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden mb-3"><div className="h-full bg-white w-[8%]" /></div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   S-12 · REPORTS & ANALYTICS
   ========================================================================== */
function statusGroup(s) {
  if (s === "Complete-Conf") return "Confirmed";
  if (s === "Complete-NConf") return "Not Confirmed";
  if (s === "Terminated") return "Terminated";
  if (s.includes("Pending-Letter")) return "Pending Letter";
  if (/Sign-Off$/.test(s)) return "Awaiting Sign-Off";
  if (/Letter$/.test(s)) return "Letter Issued";
  return "In Review";
}
function ReportShell({ code, title, onExport, children }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="text-sm font-semibold text-slate-800 flex items-center gap-2"><Mono className="text-[11px] text-cyan-700">{code}</Mono> {title}</div>
        <div className="flex gap-2"><Btn size="sm" variant="ghost" icon={Download} onClick={() => onExport("csv")}>Excel/CSV</Btn><Btn size="sm" variant="ghost" icon={FileText} onClick={() => onExport("pdf")}>PDF</Btn></div>
      </div>
      {children}
    </Card>
  );
}
function Reports({ records, role, onReportExport }) {
  const scoped = role === "LM" ? records.filter((r) => r.lm === LM_SELF) : records;
  const aggregate = role === "LEAD";
  const allReports = [["R-01", "Probation Status Summary", true], ["R-02", "Overdue / At-Risk", role !== "LEAD"], ["R-03", "Outcome Summary", true], ["R-04", "RPM Score Trends", role !== "LEAD"], ["R-05", "Acting Probation Pipeline", true]].filter((r) => r[2]);
  const [sel, setSel] = useState(allReports[0][0]);
  useEffect(() => { if (!allReports.find((r) => r[0] === sel)) setSel(allReports[0][0]); }, [role]);
  const eff = allReports.find((r) => r[0] === sel) ? sel : allReports[0][0];
  const scopeLabel = role === "LM" ? "Own team only" : role === "LEAD" ? "Aggregate · no employee names" : "Organisation-wide";
  return (
    <div className="fadeUp">
      <PageHead code="S-12 · Reports & Analytics" title="Reports & Analytics" sub={`Access scope: ${scopeLabel} (A-11 injects role scope at query time). Leadership cannot see R-02 / R-04 or any individual names.`} />
      <div className="flex flex-wrap gap-1.5 mb-5">
        {allReports.map(([code, name]) => (
          <button key={code} onClick={() => setSel(code)} className={`text-sm px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-2 ${sel === code ? "text-white" : "text-slate-600 bg-white ring-1 ring-slate-200 hover:bg-slate-50"}`} style={sel === code ? { background: "var(--brand)" } : {}}>
            <Mono className={`text-[10px] ${sel === code ? "text-white/60" : "text-slate-400"}`}>{code}</Mono>{name}
          </button>
        ))}
      </div>
      {eff === "R-01" && <R01 records={scoped} aggregate={aggregate} onReportExport={onReportExport} role={role} />}
      {eff === "R-02" && <R02 records={scoped} onReportExport={onReportExport} role={role} />}
      {eff === "R-03" && <R03 records={scoped} onReportExport={onReportExport} role={role} />}
      {eff === "R-04" && <R04 records={scoped} onReportExport={onReportExport} role={role} />}
      {eff === "R-05" && <R05 records={scoped} aggregate={aggregate} onReportExport={onReportExport} role={role} />}
    </div>
  );
}
function exportReport(format, code, rows, filename, role, onReportExport) {
  onReportExport?.(role, code, format, Math.max(0, rows.length - 1));
  if (format === "pdf") {
    window.print();
    return;
  }
  downloadCSV(filename, rows);
}
function R01({ records, aggregate, role, onReportExport }) {
  const groups = {};
  records.forEach((r) => { const g = statusGroup(r.status); groups[g] = (groups[g] || 0) + 1; });
  const data = Object.entries(groups).map(([name, value]) => ({ name, value }));
  const byGrade = [{ name: "E08 & below", value: records.filter((r) => r.gradeBand === "E08_below").length }, { name: "M09–M12", value: records.filter((r) => r.gradeBand === "M09_M12").length }];
  function exp(format) { exportReport(format, "R-01", [["Status group", "Count"], ...data.map((d) => [d.name, d.value])], "R01-status-summary.csv", role, onReportExport); }
  return (
    <ReportShell code="R-01" title="Probation Status Summary" onExport={exp}>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#6E6E6E" }} interval={0} angle={-12} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11, fill: "#9D9990" }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#5D3FD3" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">By grade band</div>
          {byGrade.map((g) => <div key={g.name} className="flex items-center justify-between py-2 border-b border-slate-50 text-sm"><span className="text-slate-600">{g.name}</span><span className="font-semibold text-slate-800">{g.value}</span></div>)}
          <div className="flex items-center justify-between py-2 text-sm"><span className="text-slate-600">Total {aggregate ? "(aggregate)" : ""}</span><span className="font-semibold text-slate-800">{records.length}</span></div>
        </div>
      </div>
    </ReportShell>
  );
}
function R02({ records, role, onReportExport }) {
  const rows = records.filter((r) => r.slaBreached || r.reminders >= 3);
  function exp(format) { exportReport(format, "R-02", [["Employee", "LM", "Status", "Issue"], ...rows.map((r) => [r.name, r.lm, r.status, r.slaBreached ? "SLA breach" : "Reminders >=3"])], "R02-overdue.csv", role, onReportExport); }
  return (
    <ReportShell code="R-02" title="Overdue / At-Risk" onExport={exp}>
      {rows.length === 0 ? <Empty icon={CheckCircle2} title="Nothing overdue" sub="No SLA breaches or stalled acceptances in scope." /> : (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100"><th className="py-2 font-medium">Employee</th><th className="py-2 font-medium">LM</th><th className="py-2 font-medium">Status</th><th className="py-2 font-medium">Issue</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id} className="border-b border-slate-50"><td className="py-2.5 font-medium text-slate-700">{r.name}</td><td className="py-2.5 text-slate-500">{r.lm}</td><td className="py-2.5"><StatusBadge status={r.status} sm /></td><td className="py-2.5">{r.slaBreached ? <Tag className="bg-rose-100 text-rose-700">SLA breach</Tag> : <Tag className="bg-amber-100 text-amber-700">Reminders 3+</Tag>}</td></tr>)}</tbody>
        </table>
      )}
    </ReportShell>
  );
}
const PIE_COLORS = ["#3CC49F", "#FFB84D", "#C8102E", "#5D3FD3", "#409CFF", "#FF9E3D"];
function R03({ records, role, onReportExport }) {
  const outcomes = { Confirmed: 0, Extension: 0, "Not Confirmed": 0, "Early Confirmation": 0 };
  records.forEach((r) => {
    if (r.status === "Complete-Conf") outcomes[r.outcome === "EarlyConf" ? "Early Confirmation" : "Confirmed"]++;
    else if (r.status === "Complete-NConf") outcomes["Not Confirmed"]++;
    else if (r.phase === "EXT") outcomes["Extension"]++;
  });
  const data = Object.entries(outcomes).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  function exp(format) { exportReport(format, "R-03", [["Outcome", "Count"], ...data.map((d) => [d.name, d.value])], "R03-outcomes.csv", role, onReportExport); }
  return (
    <ReportShell code="R-03" title="Outcome Summary" onExport={exp}>
      {data.length === 0 ? <Empty icon={BarChart3} title="No decided outcomes yet" sub="Outcomes appear once letters are signed." /> : (
        <div className="grid sm:grid-cols-2 gap-6 items-center">
          <div className="h-56"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={48} outerRadius={80} paddingAngle={2}>{data.map((d, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          <div>{data.map((d, i) => <div key={d.name} className="flex items-center gap-2.5 py-2 border-b border-slate-50 text-sm"><span className="w-3 h-3 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} /><span className="text-slate-600 flex-1">{d.name}</span><span className="font-semibold text-slate-800">{d.value}</span></div>)}</div>
        </div>
      )}
    </ReportShell>
  );
}
function R04({ records, role, onReportExport }) {
  const data = [1, 2, 3, 4, 5, 6].map((c) => {
    const vals = records.flatMap((r) => r.reviews.filter((v) => v.cycle === c).map((v) => v.rpm));
    return { cycle: `Mth ${c}`, avg: vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2) : null };
  }).filter((d) => d.avg !== null);
  const belowTotal = records.flatMap((r) => r.reviews).filter((v) => v.rpm < 3).length;
  function exp(format) { exportReport(format, "R-04", [["Cycle", "Avg RPM"], ...data.map((d) => [d.cycle, d.avg])], "R04-rpm-trends.csv", role, onReportExport); }
  return (
    <ReportShell code="R-04" title="RPM Score Trends" onExport={exp}>
      <div className="flex items-center gap-2 mb-3 text-sm"><Tag className="bg-rose-50 text-rose-600">Below-threshold reviews: {belowTotal}</Tag></div>
      <div className="h-60"><ResponsiveContainer width="100%" height="100%"><LineChart data={data} margin={{ top: 8, right: 12, bottom: 8, left: -16 }}><CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" vertical={false} /><XAxis dataKey="cycle" tick={{ fontSize: 11, fill: "#6E6E6E" }} /><YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: "#9D9990" }} /><Tooltip /><Line type="monotone" dataKey="avg" stroke="#409CFF" strokeWidth={2.5} dot={{ r: 4, fill: "#409CFF", stroke: "#ffffff", strokeWidth: 2 }} name="Avg RPM" /></LineChart></ResponsiveContainer></div>
    </ReportShell>
  );
}
function R05({ records, aggregate, role, onReportExport }) {
  const acting = records.filter((r) => r.wf === "WF2");
  function exp(format) { exportReport(format, "R-05", [["Employee", "Acting grade", "Allowance", "Cycle", "Status"], ...acting.map((r) => [aggregate ? "—" : r.name, r.acting && r.acting.grade, r.acting && r.acting.allowance, `${r.currentCycle}/${totalCycles(r)}`, r.status])], "R05-acting-pipeline.csv", role, onReportExport); }
  return (
    <ReportShell code="R-05" title="Acting Probation Pipeline" onExport={exp}>
      {acting.length === 0 ? <Empty icon={Briefcase} title="No acting probations" sub="WF2 acting-role cases appear here." /> : (
        <table className="w-full text-sm">
          <thead><tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">{!aggregate && <th className="py-2 font-medium">Employee</th>}<th className="py-2 font-medium">Acting grade</th><th className="py-2 font-medium">Allowance</th><th className="py-2 font-medium">Cycle</th><th className="py-2 font-medium">Status</th></tr></thead>
          <tbody>{acting.map((r) => <tr key={r.id} className="border-b border-slate-50">{!aggregate && <td className="py-2.5 font-medium text-slate-700">{r.name}</td>}<td className="py-2.5"><Tag className="bg-violet-50 text-violet-700">{r.acting && r.acting.grade}</Tag></td><td className="py-2.5 text-slate-600">{r.acting && r.acting.allowance}</td><td className="py-2.5"><Mono className="text-slate-500">{r.currentCycle}/{totalCycles(r)}</Mono></td><td className="py-2.5"><StatusBadge status={r.status} sm /></td></tr>)}</tbody>
        </table>
      )}
      {aggregate && <p className="text-xs text-slate-400 mt-3">Leadership view shows counts, grades, and outcome status only — employee names are withheld (BR-26).</p>}
    </ReportShell>
  );
}

/* ============================================================================
   MODALS
   ========================================================================== */
function Modal({ title, code, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" style={{ background: "rgba(15,23,42,.45)" }} onClick={onClose}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-lg"} max-h-[88vh] overflow-y-auto fadeUp`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 sticky top-0 bg-white">
          <div className="flex items-center gap-2"><span className="font-semibold text-slate-800">{title}</span>{code && <Mono className="text-[10px] text-slate-400">{code}</Mono>}</div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
function Field({ label, children }) { return <label className="block"><div className="text-xs font-medium text-slate-500 mb-1">{label}</div>{children}</label>; }
const inputCls = "w-full text-sm rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-cyan-400";

function InitiateModal({ onClose, onAdd }) {
  const [name, setName] = useState("");
  const [empId, setEmpId] = useState("");
  const [grade, setGrade] = useState("E08");
  const [wf, setWf] = useState("WF1");
  const [actingGrade, setActingGrade] = useState("M09");
  const [hodApproved, setHodApproved] = useState(false);
  const gradeBand = ["M09", "M10", "M11", "M12"].includes(grade) ? "M09_M12" : "E08_below";
  const ready = name.trim() && empId.trim() && (wf !== "WF2" || hodApproved);
  function submit() {
    const rec = { name, empId, grade, gradeBand, wf, joined: TODAY };
    if (wf === "WF2") rec.acting = { grade: actingGrade, allowance: "RM 1,500 / mo", start: TODAY, hodApproval: "Approved", hod: "HOD", approvedAt: TODAY };
    onAdd(rec);
  }
  return (
    <Modal title="Initiate probation" code="F-01 / F-10" onClose={onClose}>
      <div className="space-y-3">
        <div className="flex gap-2">
          {[["WF1", "New-hire (F-01)"], ["WF2", "Acting-role (F-10)"]].map(([v, l]) => <button key={v} onClick={() => setWf(v)} className={`flex-1 text-sm px-3 py-2 rounded-lg ring-1 font-medium ${wf === v ? "ring-cyan-500 bg-cyan-50 text-cyan-700" : "ring-slate-200 text-slate-600"}`}>{l}</button>)}
        </div>
        <Field label="Employee name"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Full name" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Employee ID"><input value={empId} onChange={(e) => setEmpId(e.target.value)} className={inputCls} placeholder="EMP-XXXX" /></Field>
          <Field label="Grade"><select value={grade} onChange={(e) => setGrade(e.target.value)} className={inputCls}>{["E06", "E07", "E08", "M09", "M10", "M11", "M12"].map((g) => <option key={g}>{g}</option>)}</select></Field>
        </div>
        {wf === "WF2" && (
          <div className="space-y-3">
            <Field label="Acting grade"><select value={actingGrade} onChange={(e) => setActingGrade(e.target.value)} className={inputCls}>{["M09", "M10", "M11", "M12"].map((g) => <option key={g}>{g}</option>)}</select></Field>
            <label className="flex items-start gap-2.5 rounded-lg bg-violet-50 ring-1 ring-violet-200 p-3 cursor-pointer">
              <input type="checkbox" checked={hodApproved} onChange={(e) => setHodApproved(e.target.checked)} className="mt-0.5" />
              <span className="text-sm text-violet-800">HOD approval received for acting placement (N-13). F-10 cannot activate without this approval.</span>
            </label>
          </div>
        )}
        <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3 text-xs text-slate-500">
          A-06 derives the cycle: <span className="font-medium text-slate-700">{gradeBand === "M09_M12" ? "6 months / 6 review cycles" : "3 months / 3 review cycles"}</span>. Duration and review count are read-only system outputs.
        </div>
        <div className="flex justify-end gap-2 pt-1"><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn disabled={!ready} onClick={submit}>Initiate</Btn></div>
      </div>
    </Modal>
  );
}
function KpiModal({ rec, onClose, onSave }) {
  const [kpis, setKpis] = useState(rec.kpis.length ? rec.kpis : [{ name: "", target: "", weight: 100 }]);
  const total = kpis.reduce((a, k) => a + (Number(k.weight) || 0), 0);
  const valid = kpis.length >= 1 && kpis.every((k) => k.name.trim()) && total === 100;
  function upd(i, key, val) { setKpis((k) => k.map((row, j) => (j === i ? { ...row, [key]: val } : row))); }
  return (
    <Modal title="Set KPIs & targets" code="S-02 / F-02" onClose={onClose} wide>
      <p className="text-sm text-slate-500 mb-4">Minimum one KPI, maximum ten. Weights must total 100%. KPIs are visible to the direct report.</p>
      <div className="space-y-2.5">
        {kpis.map((k, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-start">
            <input value={k.name} onChange={(e) => upd(i, "name", e.target.value)} placeholder="KPI name" className={`col-span-5 ${inputCls}`} />
            <input value={k.target} onChange={(e) => upd(i, "target", e.target.value)} placeholder="Target" className={`col-span-4 ${inputCls}`} />
            <input type="number" value={k.weight} onChange={(e) => upd(i, "weight", e.target.value)} className={`col-span-2 ${inputCls}`} />
            <button onClick={() => setKpis((x) => x.filter((_, j) => j !== i))} disabled={kpis.length === 1} className="col-span-1 grid place-items-center h-9 text-slate-400 hover:text-rose-500 disabled:opacity-30"><X size={16} /></button>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-3">
        <Btn variant="ghost" size="sm" icon={Plus} disabled={kpis.length >= 10} onClick={() => setKpis((k) => [...k, { name: "", target: "", weight: 0 }])}>Add KPI</Btn>
        <span className={`text-sm font-medium ${total === 100 ? "text-emerald-600" : "text-rose-600"}`}>Total weight: {total}%</span>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100"><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn disabled={!valid} onClick={() => onSave(kpis)}>Save KPIs</Btn></div>
    </Modal>
  );
}
function ReviewModal({ rec, month, onClose, onSubmit }) {
  const [rpm, setRpm] = useState(3);
  const [comments, setComments] = useState("");
  const [recmd, setRecmd] = useState("Confirm");
  const valid = comments.trim().length >= 20;
  return (
    <Modal title={`Month ${month} performance review`} code="S-03 / F-03" onClose={onClose} wide>
      <div className="text-sm text-slate-500 mb-4">{rec.name} · {rec.empId} · cycle {month} of {rec.phase === "EXT" ? 3 : totalCycles(rec)}</div>
      <div className="space-y-4">
        <Field label="RPM rating (1–5 · ≥3 meets expectations)">
          <div className="flex gap-2">{[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRpm(n)} className={`w-11 h-11 rounded-lg font-semibold text-sm ring-1 transition ${rpm === n ? "text-white ring-transparent" : "ring-slate-200 text-slate-500 hover:bg-slate-50"}`} style={rpm === n ? { background: n >= 3 ? "#2BAF70" : "#D62828" } : {}}>{n}</button>)}</div>
        </Field>
        <Field label="Performance comments (min 20 chars)"><textarea value={comments} onChange={(e) => setComments(e.target.value)} rows={3} className={inputCls} placeholder="Assessment against KPIs…" /></Field>
        <Field label="Recommendation"><select value={recmd} onChange={(e) => setRecmd(e.target.value)} className={inputCls}><option>Confirm</option><option>Extend</option><option>Non-Confirm</option><option>Continue monitoring</option></select></Field>
        <div className="rounded-lg bg-slate-50 ring-1 ring-slate-200 p-3 text-xs text-slate-500">On submit, the record moves to <span className="font-medium text-slate-700">DR acceptance</span> with daily reminders (N-04) and a 7-day auto-accept timer (A-02). Draft saves do not advance the workflow (BR-10).</div>
      </div>
      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100"><Btn variant="ghost" onClick={onClose}>Save draft</Btn><Btn disabled={!valid} onClick={() => onSubmit(rpm, comments)}>Submit review</Btn></div>
    </Modal>
  );
}
function EscalateModal({ onClose, onSubmit }) {
  const [issue, setIssue] = useState("Incorrect direct report");
  const [desc, setDesc] = useState("");
  const valid = desc.trim().length >= 20;
  return (
    <Modal title="Report inaccuracy" code="F-06" onClose={onClose}>
      <div className="space-y-3">
        <Field label="Issue type"><select value={issue} onChange={(e) => setIssue(e.target.value)} className={inputCls}><option>Incorrect direct report</option><option>Missing direct report</option><option>Wrong grade / probation type</option><option>Other</option></select></Field>
        <Field label="Description (min 20 chars)"><textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className={inputCls} placeholder="Describe the issue for HRBP…" /></Field>
        <div className="flex justify-end gap-2 pt-1"><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn disabled={!valid} icon={Send} onClick={() => onSubmit(issue, desc)}>Send to HRBP</Btn></div>
      </div>
    </Modal>
  );
}
function TerminateModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("Resignation");
  const [remarks, setRemarks] = useState("");
  return (
    <Modal title="Early termination" code="F-11" onClose={onClose}>
      <div className="rounded-lg bg-rose-50 ring-1 ring-rose-200 p-3 text-sm text-rose-700 mb-3"><AlertTriangle size={14} className="inline mr-1" /> This is terminal. The status becomes Prob-Terminated and all pending tasks and reminders are cancelled.</div>
      <div className="space-y-3">
        <Field label="Reason"><select value={reason} onChange={(e) => setReason(e.target.value)} className={inputCls}><option>Resignation</option><option>Abandonment</option><option>Mutual Agreement</option></select></Field>
        <Field label="Supporting remarks (optional)"><textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={2} className={inputCls} /></Field>
        <div className="flex justify-end gap-2 pt-1"><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn variant="danger" icon={XCircle} onClick={() => onSubmit(reason, remarks)}>Terminate probation</Btn></div>
      </div>
    </Modal>
  );
}

/* ============================================================================
   ABOUT
   ========================================================================== */
function About() {
  const map = [
    ["S-01 · MyTeamProb", "Line Manager dashboard — own team only (A-08)"],
    ["S-02 / F-02", "KPI & target setting before cycle 1"],
    ["S-03 / F-03", "Monthly review submit (RPM 1–5)"],
    ["S-04 / S-05 / F-04", "DR self-service + review acceptance"],
    ["S-06", "HRBP organisation-wide pipeline"],
    ["S-07 / F-05", "Letter generation (LT-01…06) + legal gate"],
    ["S-08 / A-04", "5-business-day HRBP SLA"],
    ["S-09 / A-08", "Append-only audit trail + export"],
    ["S-10 / F-09 / A-10", "Internal e-signature (replaces DocuSign)"],
    ["S-12 / A-11", "Reports R-01…R-05, role-scoped"],
    ["A-01 / A-02", "Review scheduler + 7-day auto-accept"],
    ["A-05 / A-06", "Employment status + grade rule engine"],
  ];
  return (
    <div className="fadeUp max-w-3xl">
      <PageHead code="Prototype" title="About this prototype" sub="A clickable front-end model of the FAITH Probation module, built from the BRD, FRD, and Project Charter (all v2.1, May 2026)." />
      <Card className="p-5 mb-5">
        <div className="text-sm font-semibold text-slate-800 mb-2">What it demonstrates</div>
        <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-5">
          <li>Role-based access (switch top-right): LM sees own team, DR sees own record, HRBP is org-wide, Leadership sees aggregates with no names.</li>
          <li>Grade-differentiated cycles — E08 &amp; below run 3 months/3 cycles; M09–M12 run 6 months/6 cycles.</li>
          <li>Both workflows — WF1 new-hire and WF2 acting-role (with acting grade, allowance, and LT-05/06 outcomes).</li>
          <li>The full lifecycle: KPI → monthly reviews → DR acceptance → outcome letter → internal e-signature → automatic employment-status update.</li>
          <li>Extension as a single 3-month loop, early termination, the promotion gate (DEP-09), the 5-day letter SLA, and the append-only audit trail.</li>
          <li>The System Console (HRBP role) exposes the automations (A-01/A-02/A-04) as manual buttons so the invisible layer is visible.</li>
        </ul>
      </Card>
      <Card className="p-5 mb-5">
        <div className="text-sm font-semibold text-slate-800 mb-3">Component coverage</div>
        <div className="grid sm:grid-cols-2 gap-x-6 gap-y-2">
          {map.map(([c, d]) => <div key={c} className="flex items-start gap-2 text-sm"><Mono className="text-[11px] text-cyan-700 shrink-0 mt-0.5">{c.split(" ")[0]}</Mono><span className="text-slate-600">{d}</span></div>)}
        </div>
      </Card>
      <Card className="p-5 ring-amber-200">
        <div className="text-sm font-semibold text-slate-800 mb-2 flex items-center gap-2"><AlertTriangle size={15} className="text-amber-500" /> What it is not</div>
        <p className="text-sm text-slate-600">This is a prototype, not the production system. There is no backend, real authentication, notification engine, document store, or persistence — refreshing resets the data. It is a faithful model of the workflow logic and screens to validate behaviour and accelerate the real FAITH build, not a deployable application. Open items from the FRD (OI-05 retention, OI-11 legal sign-off on the e-signature, OI-12 typed vs drawn signature) remain real decisions for the build.</p>
      </Card>
    </div>
  );
}
