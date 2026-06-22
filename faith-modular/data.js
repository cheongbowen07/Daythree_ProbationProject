import { TODAY, LM_SELF, HRBP_SELF } from "./constants";

export function defaultKpis() {
  return [
    { name: "Role onboarding & systems proficiency", target: "Independent in core tools", weight: 30 },
    { name: "Quality of work output", target: "Meets team quality bar", weight: 40 },
    { name: "Collaboration & communication", target: "Positive peer feedback", weight: 30 },
  ];
}

export function seedRecords() {
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
export function tnow(seq) { const mm = String(34 - (seq % 34)).padStart(2, "0"); return `19 Jun 2026 · 09:${mm} MYT`; }
export function ev(actor, type, detail, empId, prev = "", next = "") {
  _aid += 1;
  return { id: _aid, ts: tnow(_aid), actor, type, detail, empId, prev, next };
}

export function seedAudit() {
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