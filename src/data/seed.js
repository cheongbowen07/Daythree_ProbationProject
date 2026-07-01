import { LM_SELF, HRBP_SELF, HOD_DEPT } from "../constants";

const OPS_LMS = [LM_SELF, "Priya Nair"];
function dept(lm) { return OPS_LMS.includes(lm) ? HOD_DEPT : "Technology"; }

function daysElapsed(joinedStr) {
  const joined = new Date(joinedStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  joined.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today - joined) / (1000 * 60 * 60 * 24)));
}

export function defaultKpis() {
  // SMART / discrete KPIs — each has a measurable numeric target. The DR's
  // actual achieved value is recorded at review time; RPM is derived from it.
  return [
    { name: "Onboarding & systems proficiency", desc: "Core onboarding checklist items completed", target: 20, unit: "tasks",    actual: 0, weight: 30 },
    { name: "Quality work output delivered",    desc: "Work items meeting the team quality bar",    target: 40, unit: "items",    actual: 0, weight: 40 },
    { name: "Collaboration & communication",    desc: "Stakeholder / peer touchpoints",             target: 15, unit: "sessions", actual: 0, weight: 30 },
  ];
}

const POSITIONS = {
  E06: "Executive", E07: "Senior Executive", E08: "Assistant Manager",
  M09: "Manager", M10: "Senior Manager", M11: "Principal Manager", M12: "Head of Unit",
};

export function seedRecords() {
  const raw = [
    { id: 1,  name: "Aisha Rahman",  empId: "EMP-1042", grade: "E08", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF,      joined: "17 Mar 2026", status: "LM-Outcome",              phase: "NEW", currentCycle: 3, employmentStatus: "Probation",           email: "aisha.rahman@faith.my",   phone: "+60 12-334 5678", position: POSITIONS["E08"], reviews: [{ cycle: 1, rpm: 8 }, { cycle: 2, rpm: 6 }, { cycle: 3, rpm: 8 }], reminders: 2, kpis: defaultKpis() },
    { id: 2,  name: "Bryan Koh",     empId: "EMP-1071", grade: "E07", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF,      joined: "14 May 2026", status: "Mth1-DR-Acpt",           phase: "NEW", currentCycle: 1, employmentStatus: "Probation",           email: "bryan.koh@faith.my",      phone: "+60 11-223 4567", position: POSITIONS["E07"], reviews: [{ cycle: 1, rpm: 8, rec: "On track against onboarding KPIs.", actor: LM_SELF }], reminders: 4, kpis: defaultKpis() },
    { id: 3,  name: "Chandra Devi",  empId: "EMP-0915", grade: "M11", gradeBand: "M09_M12",   wf: "WF1", lm: LM_SELF,      joined: "15 Mar 2026", status: "Mth3-DR-Acpt",           phase: "NEW", currentCycle: 3, employmentStatus: "Probation",           email: "chandra.devi@faith.my",   phone: "+60 12-456 7890", position: POSITIONS["M11"], reviews: [{ cycle: 1, rpm: 8 }, { cycle: 2, rpm: 6 }, { cycle: 3, rpm: 8 }], reminders: 2, kpis: defaultKpis() },
    { id: 4,  name: "Daniel Wong",   empId: "EMP-1100", grade: "E08", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF,      joined: "19 Mar 2026", status: "HRBP-Ack",               phase: "NEW", currentCycle: 3, employmentStatus: "Probation",           email: "daniel.wong@faith.my",    phone: "+60 16-778 9012", position: POSITIONS["E08"], outcome: "Conf", reviews: [{ cycle: 1, rpm: 6 }, { cycle: 2, rpm: 8 }, { cycle: 3, rpm: 8 }], kpis: defaultKpis() },
    { id: 5,  name: "Elena Garcia",  empId: "EMP-1003", grade: "E06", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF,      joined: "12 Mar 2026", status: "Pending-NConf-Sign-Off",  phase: "NEW", currentCycle: 3, employmentStatus: "Probation",           email: "elena.garcia@faith.my",   phone: "+60 17-889 0123", position: POSITIONS["E06"], outcome: "NConf", letterType: "LT-03", letterId: "LTR-2041", letterGeneratedAt: "2026-06-24T02:30:00.000Z", legalReviewed: true, reviews: [{ cycle: 1, rpm: 4 }, { cycle: 2, rpm: 4 }, { cycle: 3, rpm: 2 }], reminders: 3, kpis: defaultKpis() },
    { id: 6,  name: "Faiz Osman",    empId: "EMP-0880", grade: "M12", gradeBand: "M09_M12",   wf: "WF1", lm: "Priya Nair", joined: "23 Dec 2025", status: "Mth6-DR-Acpt",           phase: "NEW", currentCycle: 6, employmentStatus: "Probation",           email: "faiz.osman@faith.my",     phone: "+60 13-990 1234", position: POSITIONS["M12"], reviews: [{ cycle: 1, rpm: 10 }, { cycle: 2, rpm: 8 }, { cycle: 3, rpm: 10 }, { cycle: 4, rpm: 10 }, { cycle: 5, rpm: 8 }, { cycle: 6, rpm: 10 }], reminders: 1, kpis: defaultKpis() },
    { id: 7,  name: "Grace Lim",     empId: "EMP-1150", grade: "E08", gradeBand: "E08_below", wf: "WF2", lm: LM_SELF,      joined: "16 Apr 2026", status: "Mth2-Review",            phase: "NEW", currentCycle: 2, employmentStatus: "Acting probation",    email: "grace.lim@faith.my",      phone: "+60 14-001 2345", position: POSITIONS["E08"], acting: { grade: "M09", allowance: "RM 1,200 / mo", start: "16 Apr 2026" }, reviews: [{ cycle: 1, rpm: 8 }], kpis: defaultKpis() },
    { id: 8,  name: "Hassan Ali",    empId: "EMP-0790", grade: "M11", gradeBand: "M09_M12",   wf: "WF2", lm: "David Tan",  joined: "16 Mar 2026", status: "Mth3-DR-Acpt",           phase: "NEW", currentCycle: 3, employmentStatus: "Acting probation",    email: "hassan.ali@faith.my",     phone: "+60 19-112 3456", position: POSITIONS["M11"], acting: { grade: "M12", allowance: "RM 2,500 / mo", start: "16 Mar 2026" }, reviews: [{ cycle: 1, rpm: 8 }, { cycle: 2, rpm: 8 }, { cycle: 3, rpm: 6 }], reminders: 2, kpis: defaultKpis() },
    { id: 9,  name: "Ivy Chong",     empId: "EMP-0701", grade: "E08", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF,      joined: "19 Feb 2026", status: "Complete-Conf",           phase: "NEW", currentCycle: 3, employmentStatus: "Confirmed",           email: "ivy.chong@faith.my",      phone: "+60 12-223 4567", position: POSITIONS["E08"], outcome: "Conf", reviews: [{ cycle: 1, rpm: 8 }, { cycle: 2, rpm: 10 }, { cycle: 3, rpm: 8 }], kpis: defaultKpis() },
    { id: 11, name: "Karen Soh",     empId: "EMP-0512", grade: "E08", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF,      joined: "01 Mar 2026", status: "Ext-Mth1-Review",         phase: "EXT", currentCycle: 1, employmentStatus: "Probation (extended)", email: "karen.soh@faith.my",      phone: "+60 16-445 6789", position: POSITIONS["E08"], reviews: [{ cycle: 1, rpm: 6 }, { cycle: 2, rpm: 4 }, { cycle: 3, rpm: 6 }], kpis: defaultKpis() },
    { id: 12, name: "Leon Tan",      empId: "EMP-0489", grade: "M10", gradeBand: "M09_M12",   wf: "WF1", lm: "Marcus Lee",  joined: "13 Dec 2025", status: "Pending-Letter",          phase: "NEW", currentCycle: 6, employmentStatus: "Probation",           email: "leon.tan@faith.my",       phone: "+60 17-556 7890", position: POSITIONS["M10"], outcome: "Conf", slaDays: 4, slaBreached: true, reviews: [{ cycle: 1, rpm: 8 }, { cycle: 2, rpm: 8 }, { cycle: 3, rpm: 6 }, { cycle: 4, rpm: 8 }, { cycle: 5, rpm: 8 }, { cycle: 6, rpm: 8 }], kpis: defaultKpis() },
    { id: 13, name: "Mei Ling",      empId: "EMP-1200", grade: "E08", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF,      joined: "07 Jun 2026", status: "KPI-Review",             phase: "NEW", currentCycle: 0, employmentStatus: "Probation",           email: "mei.ling@faith.my",       phone: "+60 18-667 8901", position: POSITIONS["E08"], reviews: [], kpis: [] },
    { id: 14, name: "Nadia Ismail",  empId: "EMP-1215", grade: "E07", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF,      joined: "10 Apr 2026", status: "Mth2-Review",            phase: "NEW", currentCycle: 2, employmentStatus: "Probation",           email: "nadia.ismail@faith.my",   phone: "+60 12-778 1122", position: POSITIONS["E07"], reviews: [{ cycle: 1, rpm: 6 }], kpis: defaultKpis() },
    { id: 15, name: "Omar Sied",     empId: "EMP-0834", grade: "M10", gradeBand: "M09_M12",   wf: "WF1", lm: LM_SELF,      joined: "05 Feb 2026", status: "Mth4-DR-Acpt",           phase: "NEW", currentCycle: 4, employmentStatus: "Probation",           email: "omar.sied@faith.my",      phone: "+60 13-201 3344", position: POSITIONS["M10"], reviews: [{ cycle: 1, rpm: 8 }, { cycle: 2, rpm: 6 }, { cycle: 3, rpm: 8 }, { cycle: 4, rpm: 6 }], reminders: 1, kpis: defaultKpis() },
    { id: 16, name: "Priya Menon",   empId: "EMP-1230", grade: "E06", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF,      joined: "20 Jun 2026", status: "KPI-Review",             phase: "NEW", currentCycle: 0, employmentStatus: "Probation",           email: "priya.menon@faith.my",    phone: "+60 11-455 6677", position: POSITIONS["E06"], reviews: [], kpis: [] },
    { id: 17, name: "Quentin Lee",   empId: "EMP-1198", grade: "E08", gradeBand: "E08_below", wf: "WF2", lm: LM_SELF,      joined: "01 Jun 2026", status: "Mth1-Review",            phase: "NEW", currentCycle: 1, employmentStatus: "Acting probation",    email: "quentin.lee@faith.my",    phone: "+60 16-889 9001", position: POSITIONS["E08"], acting: { grade: "M09", allowance: "RM 1,000 / mo", start: "01 Jun 2026" }, reviews: [], kpis: defaultKpis() },
    { id: 18, name: "Rina Abdullah", empId: "EMP-0667", grade: "M09", gradeBand: "M09_M12",   wf: "WF1", lm: LM_SELF,      joined: "10 Jan 2026", status: "Mth5-Review",            phase: "NEW", currentCycle: 5, employmentStatus: "Probation",           email: "rina.abdullah@faith.my",  phone: "+60 12-667 2233", position: POSITIONS["M09"], reviews: [{ cycle: 1, rpm: 8 }, { cycle: 2, rpm: 8 }, { cycle: 3, rpm: 6 }, { cycle: 4, rpm: 8 }], reminders: 1, kpis: defaultKpis() },
    { id: 19, name: "Samuel Tan",    empId: "EMP-0588", grade: "E08", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF,      joined: "15 Jan 2026", status: "Complete-NConf",         phase: "NEW", currentCycle: 3, employmentStatus: "Not Confirmed",       email: "samuel.tan@faith.my",     phone: "+60 17-112 8899", position: POSITIONS["E08"], outcome: "NConf", reviews: [{ cycle: 1, rpm: 4 }, { cycle: 2, rpm: 4 }, { cycle: 3, rpm: 2 }], kpis: defaultKpis() },
    { id: 20, name: "Tariq Hassan",  empId: "EMP-0772", grade: "M11", gradeBand: "M09_M12",   wf: "WF1", lm: "David Tan",  joined: "01 Mar 2026", status: "Mth2-DR-Acpt",           phase: "NEW", currentCycle: 2, employmentStatus: "Probation",           email: "tariq.hassan@faith.my",   phone: "+60 19-334 5566", position: POSITIONS["M11"], reviews: [{ cycle: 1, rpm: 8 }, { cycle: 2, rpm: 6 }], reminders: 2, kpis: defaultKpis() },
    { id: 21, name: "Uma Devi",      empId: "EMP-0921", grade: "E07", gradeBand: "E08_below", wf: "WF1", lm: LM_SELF,      joined: "01 Mar 2026", status: "Pending-Letter",         phase: "NEW", currentCycle: 3, employmentStatus: "Probation",           email: "uma.devi@faith.my",       phone: "+60 14-556 7788", position: POSITIONS["E07"], outcome: "Conf", slaDays: 1, reviews: [{ cycle: 1, rpm: 8 }, { cycle: 2, rpm: 8 }, { cycle: 3, rpm: 8 }], kpis: defaultKpis() },
  ];
  // Backfill per-KPI actuals on each seeded review so the demo shows worked
  // achievement numbers. Actuals are set uniformly to reproduce the review's
  // RPM (RPM ≈ achievement% / 10), capped at the target.
  const snapshotFor = (rec, rpm) =>
    (rec.kpis || []).map((k) => {
      const target = Number(k.target) || 0;
      return { ...k, actual: Math.min(target, Math.round((target * rpm) / 10)) };
    });
  return raw.map((r) => ({
    ...r,
    day: daysElapsed(r.joined),
    dept: dept(r.lm),
    reviews: (r.reviews || []).map((v) => ({
      ...v,
      kpisSnapshot: v.kpisSnapshot || snapshotFor(r, v.rpm),
    })),
  }));
}

let _aid = 0;
const TIMESTAMPS = [
  "09 Jan 2026 · 08:02 MYT",
  "10 Jan 2026 · 09:15 MYT",
  "15 Jan 2026 · 11:30 MYT",
  "19 Feb 2026 · 08:00 MYT",
  "01 Mar 2026 · 09:05 MYT",
  "01 Mar 2026 · 09:47 MYT",
  "15 Mar 2026 · 08:01 MYT",
  "16 Mar 2026 · 08:00 MYT",
  "17 Mar 2026 · 08:00 MYT",
  "19 Mar 2026 · 08:00 MYT",
  "05 Apr 2026 · 14:20 MYT",
  "10 Apr 2026 · 08:00 MYT",
  "16 Apr 2026 · 08:00 MYT",
  "14 May 2026 · 08:00 MYT",
  "20 May 2026 · 10:10 MYT",
  "28 May 2026 · 11:45 MYT",
  "01 Jun 2026 · 08:00 MYT",
  "07 Jun 2026 · 08:00 MYT",
  "07 Jun 2026 · 08:03 MYT",
  "20 Jun 2026 · 08:00 MYT",
  "20 Jun 2026 · 08:04 MYT",
  "22 Jun 2026 · 09:00 MYT",
  "22 Jun 2026 · 09:32 MYT",
  "23 Jun 2026 · 10:15 MYT",
  "23 Jun 2026 · 10:47 MYT",
  "23 Jun 2026 · 11:00 MYT",
  "24 Jun 2026 · 08:30 MYT",
  "24 Jun 2026 · 09:00 MYT",
  "24 Jun 2026 · 09:15 MYT",
  "24 Jun 2026 · 14:00 MYT",
  "25 Jun 2026 · 08:00 MYT",
  "25 Jun 2026 · 08:05 MYT",
  "26 Jun 2026 · 09:20 MYT",
  "26 Jun 2026 · 09:45 MYT",
  "27 Jun 2026 · 10:00 MYT",
  "27 Jun 2026 · 14:30 MYT",
  "28 Jun 2026 · 08:00 MYT",
  "28 Jun 2026 · 09:00 MYT",
  "28 Jun 2026 · 11:15 MYT",
  "29 Jun 2026 · 09:30 MYT",
  "29 Jun 2026 · 10:00 MYT",
  "29 Jun 2026 · 14:00 MYT",
  "30 Jun 2026 · 08:00 MYT",
  "30 Jun 2026 · 09:00 MYT",
  "30 Jun 2026 · 09:45 MYT",
];
function tnow(seq) { return TIMESTAMPS[seq % TIMESTAMPS.length]; }

export function ev(actor, type, detail, empId, prev = "", next = "") {
  _aid += 1;
  return { id: _aid, ts: TIMESTAMPS[_aid % TIMESTAMPS.length], actor, type, detail, empId, prev, next };
}

export function seedAudit() {
  _aid = 0;
  return [
    // ── Rina Abdullah EMP-0667 — onboarding & multi-cycle journey ──
    ev("System",    "create",        "Probation record created on employee joining",                     "EMP-0667", "—",              "KPI-Review"),
    ev("System",    "trigger",       "N-09 sent to Marcus Lee — new joiner KPI setup required",          "EMP-0667"),
    ev(LM_SELF,     "review-submit", "Month 1 review submitted (RPM 8)",                                 "EMP-0667", "Mth1-Review",    "Mth1-DR-Acpt"),
    ev("System",    "schedule",      "N-04 daily reminder dispatched to DR · A-02 7-day timer started",  "EMP-0667"),
    ev("Rina Abdullah","accept",     "Month 1 DR acceptance",                                            "EMP-0667", "Mth1-DR-Acpt",   "Mth2-Review"),
    ev("System",    "trigger",       "Month 2 review trigger sent to LM",                                "EMP-0667"),
    ev(LM_SELF,     "review-submit", "Month 2 review submitted (RPM 8)",                                 "EMP-0667", "Mth2-Review",    "Mth2-DR-Acpt"),
    ev("System",    "schedule",      "N-04 daily reminder dispatched to DR",                             "EMP-0667"),
    ev("Rina Abdullah","accept",     "Month 2 DR acceptance",                                            "EMP-0667", "Mth2-DR-Acpt",   "Mth3-Review"),
    ev(LM_SELF,     "kpi",           "Month 3 KPI targets revised — Stakeholder touchpoints updated to 18", "EMP-0667"),
    ev("System",    "notify",        "N-01 to Rina Abdullah — Month 3 KPI targets updated by LM",        "EMP-0667"),
    ev(LM_SELF,     "review-submit", "Month 3 review submitted (RPM 6)",                                 "EMP-0667", "Mth3-Review",    "Mth3-DR-Acpt"),
    ev("Rina Abdullah","accept",     "Month 3 DR acceptance",                                            "EMP-0667", "Mth3-DR-Acpt",   "Mth4-Review"),
    ev(LM_SELF,     "review-submit", "Month 4 review submitted (RPM 8)",                                 "EMP-0667", "Mth4-Review",    "Mth4-DR-Acpt"),
    ev("Rina Abdullah","accept",     "Month 4 DR acceptance",                                            "EMP-0667", "Mth4-DR-Acpt",   "Mth5-Review"),

    // ── Ivy Chong EMP-0701 — confirmed, with sign event ──
    ev("System",    "create",        "Probation record created on employee joining",                     "EMP-0701", "—",              "KPI-Review"),
    ev(LM_SELF,     "review-submit", "Month 1 review submitted (RPM 8)",                                 "EMP-0701", "Mth1-Review",    "Mth1-DR-Acpt"),
    ev("Ivy Chong", "accept",        "Month 1 DR acceptance",                                            "EMP-0701", "Mth1-DR-Acpt",   "Mth2-Review"),
    ev(LM_SELF,     "review-submit", "Month 2 review submitted (RPM 10)",                                "EMP-0701", "Mth2-Review",    "Mth2-DR-Acpt"),
    ev("Ivy Chong", "accept",        "Month 2 DR acceptance",                                            "EMP-0701", "Mth2-DR-Acpt",   "Mth3-Review"),
    ev(LM_SELF,     "review-submit", "Month 3 review submitted (RPM 8)",                                 "EMP-0701", "Mth3-Review",    "Mth3-DR-Acpt"),
    ev("Ivy Chong", "accept",        "Final cycle acceptance",                                           "EMP-0701", "Mth3-DR-Acpt",   "LM-Outcome"),
    ev("System",    "trigger",       "N-15 to LM — outcome decision required (Confirm / Extend / Not Confirm)", "EMP-0701"),
    ev(LM_SELF,     "outcome-set",   "Outcome set: Confirmed",                                           "EMP-0701", "LM-Outcome",     "HRBP-Ack"),
    ev(HRBP_SELF,   "hrbp-ack",     "HRBP acknowledged outcome — letter generation initiated",           "EMP-0701", "HRBP-Ack",       "Pending-Letter"),
    ev(HRBP_SELF,   "letter-gen",   "Confirmation letter generated (LT-01)",                             "EMP-0701", "Pending-Letter", "Conf-Letter"),
    ev(HRBP_SELF,   "dispatch",     "Letter dispatched to S-10 · N-08 sent to DR",                       "EMP-0701", "Conf-Letter",    "Pending-Conf-Sign-Off"),
    ev("Ivy Chong", "sign",         "Confirmation letter signed by DR",                                  "EMP-0701", "Pending-Conf-Sign-Off", "Complete-Conf"),
    ev("System",    "emp-update",   "Employment status updated → Confirmed",                             "EMP-0701", "Probation",      "Confirmed"),

    // ── Samuel Tan EMP-0588 — not confirmed path ──
    ev("System",    "create",        "Probation record created on employee joining",                     "EMP-0588", "—",              "KPI-Review"),
    ev(LM_SELF,     "review-submit", "Month 1 review submitted (RPM 4)",                                 "EMP-0588", "Mth1-Review",    "Mth1-DR-Acpt"),
    ev("System",    "notify",        "N-03 performance caution sent to DR",                              "EMP-0588"),
    ev("Samuel Tan","accept",        "Month 1 DR acceptance",                                            "EMP-0588", "Mth1-DR-Acpt",   "Mth2-Review"),
    ev(LM_SELF,     "review-submit", "Month 2 review submitted (RPM 4)",                                 "EMP-0588", "Mth2-Review",    "Mth2-DR-Acpt"),
    ev("Samuel Tan","accept",        "Month 2 DR acceptance",                                            "EMP-0588", "Mth2-DR-Acpt",   "Mth3-Review"),
    ev(LM_SELF,     "review-submit", "Month 3 review submitted (RPM 2)",                                 "EMP-0588", "Mth3-Review",    "Mth3-DR-Acpt"),
    ev("Samuel Tan","accept",        "Final cycle acceptance",                                           "EMP-0588", "Mth3-DR-Acpt",   "LM-Outcome"),
    ev(LM_SELF,     "outcome-set",   "Outcome set: Not Confirmed",                                       "EMP-0588", "LM-Outcome",     "HRBP-Ack"),
    ev(HRBP_SELF,   "hrbp-ack",     "HRBP acknowledged Not Confirmation outcome",                        "EMP-0588", "HRBP-Ack",       "Pending-Letter"),
    ev(HRBP_SELF,   "letter-gen",   "Non-Confirmation letter generated · legal review passed (LT-03)",   "EMP-0588", "Pending-Letter", "NConf-Letter"),
    ev(HRBP_SELF,   "dispatch",     "Letter dispatched · N-08 to DR",                                    "EMP-0588", "NConf-Letter",   "Pending-NConf-Sign-Off"),
    ev("Samuel Tan","sign",         "Non-Confirmation letter signed by DR",                              "EMP-0588", "Pending-NConf-Sign-Off", "Complete-NConf"),
    ev("System",    "emp-update",   "Employment status updated → Not Confirmed",                         "EMP-0588", "Probation",      "Not Confirmed"),

    // ── Karen Soh EMP-0512 — extension path ──
    ev("System",    "create",        "Probation record created on employee joining",                     "EMP-0512", "—",              "KPI-Review"),
    ev(LM_SELF,     "review-submit", "Month 1 review submitted (RPM 6)",                                 "EMP-0512", "Mth1-Review",    "Mth1-DR-Acpt"),
    ev("Karen Soh", "accept",        "Month 1 DR acceptance",                                            "EMP-0512", "Mth1-DR-Acpt",   "Mth2-Review"),
    ev(LM_SELF,     "review-submit", "Month 2 review submitted (RPM 4)",                                 "EMP-0512", "Mth2-Review",    "Mth2-DR-Acpt"),
    ev("Karen Soh", "accept",        "Month 2 DR acceptance",                                            "EMP-0512", "Mth2-DR-Acpt",   "Mth3-Review"),
    ev(LM_SELF,     "review-submit", "Month 3 review submitted (RPM 6)",                                 "EMP-0512", "Mth3-Review",    "Mth3-DR-Acpt"),
    ev("Karen Soh", "accept",        "Final cycle acceptance",                                           "EMP-0512", "Mth3-DR-Acpt",   "LM-Outcome"),
    ev(LM_SELF,     "outcome-set",   "Outcome set: Extend probation (1 month)",                          "EMP-0512", "LM-Outcome",     "HRBP-Ack"),
    ev(HRBP_SELF,   "hrbp-ack",     "HRBP acknowledged extension — extension period started",            "EMP-0512", "HRBP-Ack",       "Ext-Mth1-Review"),
    ev("System",    "notify",        "N-12 extension notice sent to DR",                                 "EMP-0512"),

    // ── Daniel Wong EMP-1100 — HRBP return then re-ack ──
    ev("System",    "create",        "Probation record created on employee joining",                     "EMP-1100", "—",              "KPI-Review"),
    ev(LM_SELF,     "review-submit", "Month 1 review submitted (RPM 6)",                                 "EMP-1100", "Mth1-Review",    "Mth1-DR-Acpt"),
    ev("Daniel Wong","accept",       "Month 1 DR acceptance",                                            "EMP-1100", "Mth1-DR-Acpt",   "Mth2-Review"),
    ev(LM_SELF,     "review-submit", "Month 2 review submitted (RPM 8)",                                 "EMP-1100", "Mth2-Review",    "Mth2-DR-Acpt"),
    ev("Daniel Wong","accept",       "Month 2 DR acceptance",                                            "EMP-1100", "Mth2-DR-Acpt",   "Mth3-Review"),
    ev(LM_SELF,     "review-submit", "Month 3 review submitted (RPM 8)",                                 "EMP-1100", "Mth3-Review",    "Mth3-DR-Acpt"),
    ev("Daniel Wong","accept",       "Final cycle acceptance",                                           "EMP-1100", "Mth3-DR-Acpt",   "LM-Outcome"),
    ev(LM_SELF,     "outcome-set",   "Outcome set: Confirmed",                                           "EMP-1100", "LM-Outcome",     "HRBP-Ack"),
    ev(HRBP_SELF,   "hrbp-return",  "HRBP returned outcome — supporting documents incomplete",           "EMP-1100", "HRBP-Ack",       "LM-Outcome"),
    ev(LM_SELF,     "outcome-set",   "Outcome resubmitted: Confirmed — documents reattached",            "EMP-1100", "LM-Outcome",     "HRBP-Ack"),
    ev(HRBP_SELF,   "hrbp-ack",     "HRBP acknowledged outcome on resubmission",                         "EMP-1100", "HRBP-Ack",       "Pending-Letter"),

    // ── Elena Garcia EMP-1003 — letter SLA & legal review ──
    ev("System",    "create",        "Probation record created on employee joining",                     "EMP-1003", "—",              "KPI-Review"),
    ev(LM_SELF,     "review-submit", "Month 1 review submitted (RPM 4)",                                 "EMP-1003", "Mth1-Review",    "Mth1-DR-Acpt"),
    ev("System",    "notify",        "N-03 performance caution notice dispatched",                       "EMP-1003"),
    ev("Elena Garcia","accept",      "Month 1 DR acceptance",                                            "EMP-1003", "Mth1-DR-Acpt",   "Mth2-Review"),
    ev(LM_SELF,     "review-submit", "Month 2 review submitted (RPM 4)",                                 "EMP-1003", "Mth2-Review",    "Mth2-DR-Acpt"),
    ev("Elena Garcia","accept",      "Month 2 DR acceptance",                                            "EMP-1003", "Mth2-DR-Acpt",   "Mth3-Review"),
    ev(LM_SELF,     "review-submit", "Month 3 review submitted (RPM 2)",                                 "EMP-1003", "Mth3-Review",    "Mth3-DR-Acpt"),
    ev("Elena Garcia","accept",      "Final cycle acceptance",                                           "EMP-1003", "Mth3-DR-Acpt",   "LM-Outcome"),
    ev(LM_SELF,     "outcome-set",   "Outcome set: Not Confirmed",                                       "EMP-1003", "LM-Outcome",     "HRBP-Ack"),
    ev(HRBP_SELF,   "hrbp-ack",     "HRBP acknowledged Not Confirmation",                                "EMP-1003", "HRBP-Ack",       "Pending-Letter"),
    ev("System",    "sla-start",     "N-06 to HRBP · A-04 3-business-day letter SLA started",           "EMP-1003"),
    ev(HRBP_SELF,   "letter-gen",   "Non-Confirmation letter generated (legal review passed)",           "EMP-1003", "Pending-Letter", "NConf-Letter"),
    ev(HRBP_SELF,   "dispatch",     "Letter dispatched to S-10 · N-08 to DR",                           "EMP-1003", "NConf-Letter",   "Pending-NConf-Sign-Off"),

    // ── Leon Tan EMP-0489 — SLA breach ──
    ev("System",    "create",        "Probation record created on employee joining",                     "EMP-0489", "—",              "KPI-Review"),
    ev("Priya Nair","review-submit", "Month 5 review submitted (RPM 8)",                                 "EMP-0489", "Mth5-Review",    "Mth5-DR-Acpt"),
    ev("Leon Tan",  "accept",        "Month 5 DR acceptance",                                            "EMP-0489", "Mth5-DR-Acpt",   "Mth6-Review"),
    ev("Priya Nair","review-submit", "Month 6 review submitted (RPM 8) — final cycle",                  "EMP-0489", "Mth6-Review",    "Mth6-DR-Acpt"),
    ev("Leon Tan",  "accept",        "Final cycle acceptance",                                           "EMP-0489", "Mth6-DR-Acpt",   "LM-Outcome"),
    ev("Priya Nair","outcome-set",   "Outcome set: Confirmed",                                           "EMP-0489", "LM-Outcome",     "HRBP-Ack"),
    ev(HRBP_SELF,   "hrbp-ack",     "HRBP acknowledged outcome",                                         "EMP-0489", "HRBP-Ack",       "Pending-Letter"),
    ev("System",    "sla-start",     "A-04 letter SLA timer started",                                    "EMP-0489"),
    ev("System",    "sla-breach",   "N-07 URGENT — letter SLA breached (4 days elapsed)",               "EMP-0489"),
    ev("System",    "escalation",   "Escalated to HRBP supervisor — letter SLA exceeded",               "EMP-0489"),

    // ── Aisha Rahman EMP-1042 — auto-accept example ──
    ev("System",    "create",        "Probation record created on employee joining",                     "EMP-1042", "—",              "KPI-Review"),
    ev(LM_SELF,     "review-submit", "Month 1 review submitted (RPM 8)",                                 "EMP-1042", "Mth1-Review",    "Mth1-DR-Acpt"),
    ev("System",    "schedule",      "N-04 daily reminder dispatched to DR · A-02 7-day timer started",  "EMP-1042"),
    ev("System",    "accept",        "Auto-accepted Month 1 (actor: System — A-02 7-day timer expired)", "EMP-1042", "Mth1-DR-Acpt",   "Mth2-Review"),
    ev("System",    "trigger",       "Month 2 review trigger sent to LM",                                "EMP-1042"),
    ev(LM_SELF,     "review-submit", "Month 2 review submitted (RPM 6)",                                 "EMP-1042", "Mth2-Review",    "Mth2-DR-Acpt"),
    ev("Aisha Rahman","accept",      "Month 2 DR acceptance",                                            "EMP-1042", "Mth2-DR-Acpt",   "Mth3-Review"),
    ev(LM_SELF,     "review-submit", "Month 3 review submitted (RPM 8)",                                 "EMP-1042", "Mth3-Review",    "Mth3-DR-Acpt"),

    // ── Bryan Koh EMP-1071 — KPI update mid-review ──
    ev("System",    "create",        "Probation record created on employee joining",                     "EMP-1071", "—",              "KPI-Review"),
    ev("System",    "trigger",       "N-09 sent to Marcus Lee — new joiner KPI setup required",          "EMP-1071"),
    ev(LM_SELF,     "kpi",           "Month 1 KPI targets set — onboarding tasks: 20, quality items: 40, sessions: 15", "EMP-1071"),
    ev(LM_SELF,     "review-submit", "Month 1 review submitted (RPM 8)",                                 "EMP-1071", "Mth1-Review",    "Mth1-DR-Acpt"),
    ev("System",    "schedule",      "N-04 daily reminder dispatched to DR",                             "EMP-1071"),

    // ── Day 91 breach — Aisha (E08 >91 days) ──
    ev("System",    "day91-breach",  "N-07 URGENT — Day 91 breach · E08-and-below record without completed outcome", "EMP-1042"),
    ev("System",    "escalation",   "Escalated to HRBP — A-06 Day 91 threshold exceeded without outcome decision",   "EMP-1042"),

    // ── Mei Ling EMP-1200 — brand new joiner ──
    ev("System",    "create",        "Probation record created on employee joining",                     "EMP-1200", "—",              "KPI-Review"),
    ev("System",    "trigger",       "N-09 sent to Marcus Lee — new joiner KPI setup required",          "EMP-1200"),

    // ── Priya Menon EMP-1230 — brand new joiner ──
    ev("System",    "create",        "Probation record created on employee joining",                     "EMP-1230", "—",              "KPI-Review"),
    ev("System",    "trigger",       "N-09 sent to Marcus Lee — new joiner KPI setup required",          "EMP-1230"),

    // ── Exports & system events ──
    ev(HRBP_SELF,   "export",        "F-08 audit export · PDF · 34 entries",                            ""),
    ev("System",    "notify",        "N-05 weekly digest dispatched to all active LMs",                 ""),
    ev("System",    "schedule",      "A-01 review cycle scheduler heartbeat — 0 records advanced",      ""),
  ].sort((a, b) => (a.ts > b.ts ? 1 : a.ts < b.ts ? -1 : 0)).reverse();
}
