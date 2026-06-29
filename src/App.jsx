import { useState, useEffect, useRef } from "react";
import {
  ChevronDown, Calendar, CheckCircle2, X, Info,
} from "lucide-react";
import { TODAY, ROLES, NAV, OUTCOME_TO_SIGN, OUTCOME_TO_LETTER, HRBP_SELF, LM_SELF } from "./constants";
import { seedRecords, seedAudit, ev } from "./data/seed";
import { monthFromStatus, isActiveProbation } from "./utils/status";
import { totalCycles, extensionCycles } from "./utils/lifecycle";
import { kpisForCycle } from "./utils/kpi";
import { StyleVars, RoleCard } from "./components/ui";
import LMDashboard    from "./components/screens/LMDashboard";
import CaseDetail     from "./components/screens/CaseDetail";
import DRHome         from "./components/screens/DRHome";
import HRBPPipeline   from "./components/screens/HRBPPipeline";
import SLATracker     from "./components/screens/SLATracker";
import AuditTrail     from "./components/screens/AuditTrail";
import SystemConsole  from "./components/screens/SystemConsole";
import SettingsUpload from "./components/screens/SettingsUpload";
import About          from "./components/screens/About";
import Reports        from "./components/reports/Reports";
import NotificationCenter from "./components/screens/NotificationCenter";
import LMSettings     from "./components/screens/LMSettings";
import HODPipeline    from "./components/screens/HODPipeline";
import ReviewQueue    from "./components/screens/ReviewQueue";

export default function App() {


  const [records, setRecords] = useState(seedRecords);
  const [audit, setAudit]     = useState(seedAudit);
  const [role, setRole]       = useState("LM");
  const [view, setView]       = useState("dashboard");
  const [activeId, setActiveId] = useState(null);
  const [asDr, setAsDr]       = useState(2);
  const [toast, setToast]     = useState(null);
  const [banner, setBanner]   = useState(true);
  const [roleMenu, setRoleMenu] = useState(false);
  const [lmPermissions, setLmPermissions] = useState({
    delegation:   false,
    hodSignoff:   true,
    autoEscalate: true,
    notifyHrbp:   false,
  });
  const [automations, setAutomations] = useState({
    scheduler:   { enabled: false, triggerDay: 31, intervalSecs: 30, lastRun: null },
    autoAccept:  { enabled: false, days: 7,        intervalSecs: 30, lastRun: null },
    slaCheck:    { enabled: false, slaDays: 3,     intervalSecs: 30, lastRun: null },
    dayCheck:    { enabled: false, dayThreshold: 91, intervalSecs: 30, lastRun: null },
  });

  const recordsRef = useRef(records);
  useEffect(() => { recordsRef.current = records; }, [records]);

  const log   = (e)           => setAudit((a) => [{ ...e, id: a.length + 1000 + Math.random() }, ...a]);
  const flash = (msg, kind = "ok") => { setToast({ msg, kind }); setTimeout(() => setToast(null), 2600); };

  function switchRole(r) { setRole(r); setView(NAV[r][0][0]); setActiveId(null); setRoleMenu(false); }

  function patchAutomation(key, field, value) {
    setAutomations((a) => ({ ...a, [key]: { ...a[key], [field]: value } }));
  }

  // A-01: Review cycle scheduler — Day 31 (Mth1) + Day 61/91/121/151/181 (Mth2–6, grade-differentiated) [FR-04, FR-05]
  useEffect(() => {
    if (!automations.scheduler.enabled) return;
    const id = setInterval(() => {
      const now = new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
      setRecords((rs) => rs.map((r) => {
        // Day 31: KPI-Review → Mth1-Review
        if (r.status === "KPI-Review" && r.kpis.length > 0 && r.day >= automations.scheduler.triggerDay) {
          setAudit((a) => [{ id: a.length + 1000 + Math.random(), ts: `${TODAY} · ${now} MYT`, actor: "System", type: "schedule", detail: `A-01 FR-04: Day ${automations.scheduler.triggerDay} reached → Month 1 review triggered · N-01 to LM`, empId: r.empId, prev: r.status, next: "Mth1-Review" }, ...a]);
          return { ...r, status: "Mth1-Review", currentCycle: 1 };
        }
        // Day 61/91/121/151/181: MthN-DR-Acpt still pending → force-advance [FR-05]
        const drAcptMatch = r.status.match(/^Mth(\d)-DR-Acpt$/);
        if (drAcptMatch) {
          const n = Number(drAcptMatch[1]);
          const dayThreshold = (n + 1) * 30 + 1; // Day 61 for Mth1, 91 for Mth2, etc.
          if (r.day >= dayThreshold && !r[`day${dayThreshold}Fired`]) {
            const isFinal = n >= totalCycles(r);
            const next = isFinal
              ? (r.wf === "WF2" ? "LM-Outcome(Acting)" : "LM-Outcome")
              : `Mth${n + 1}-Review`;
            setAudit((a) => [{ id: a.length + 1000 + Math.random(), ts: `${TODAY} · ${now} MYT`, actor: "System", type: "schedule", detail: `A-01 FR-05: Day ${dayThreshold} threshold — Month ${n} DR acceptance overdue · auto-advanced · N-02 to LM`, empId: r.empId, prev: r.status, next }, ...a]);
            return { ...r, status: next, reminders: 0, currentCycle: isFinal ? r.currentCycle : n + 1, [`day${dayThreshold}Fired`]: true };
          }
        }
        return r;
      }));
      setAutomations((a) => ({ ...a, scheduler: { ...a.scheduler, lastRun: now } }));
    }, automations.scheduler.intervalSecs * 1000);
    return () => clearInterval(id);
  }, [automations.scheduler.enabled, automations.scheduler.intervalSecs, automations.scheduler.triggerDay]);

  // A-02: daily N-04 reminder + 7-day auto-accept fallback
  useEffect(() => {
    if (!automations.autoAccept.enabled) return;
    const id = setInterval(() => {
      const now = new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
      setRecords((rs) => rs.map((r) => {
        if (!/-DR-Acpt$/.test(r.status)) return r;
        const newReminders = (r.reminders || 0) + 1;
        const threshold    = automations.autoAccept.days;
        const n   = r.status.match(/(\d)/)?.[1];
        const ext = r.phase === "EXT";

        if (newReminders >= threshold) {
          // Auto-accept fallback fires
          const isFinal = ext ? Number(n) >= extensionCycles(r) : Number(n) >= totalCycles(r);
          const next = isFinal
            ? (ext ? "Ext-LM-Outcome" : r.wf === "WF2" ? "LM-Outcome(Acting)" : "LM-Outcome")
            : (ext ? `Ext-Mth${Number(n)+1}-Review` : `Mth${Number(n)+1}-Review`);
          setAudit((a) => [
            { id: a.length + 1000 + Math.random(), ts: `${TODAY} · ${now} MYT`, actor: "System", type: "notify",  detail: `N-04 daily reminder #${newReminders} dispatched to ${r.name} (${r.empId})`, empId: r.empId, prev: "", next: "" },
            { id: a.length + 2000 + Math.random(), ts: `${TODAY} · ${now} MYT`, actor: "System", type: "accept",  detail: `A-02 auto-accept: ${threshold}-day reminder threshold reached — accepted on behalf of DR`, empId: r.empId, prev: r.status, next },
            ...a,
          ]);
          return { ...r, status: next, reminders: 0, ...(isFinal ? { slaDays: 0, slaBreached: false } : { currentCycle: Number(n) + 1 }) };
        }

        // Daily reminder only
        setAudit((a) => [{ id: a.length + 1000 + Math.random(), ts: `${TODAY} · ${now} MYT`, actor: "System", type: "notify", detail: `N-04 daily reminder #${newReminders} dispatched to ${r.name} (${r.empId}) — ${threshold - newReminders} day(s) until auto-accept`, empId: r.empId, prev: "", next: "" }, ...a]);
        return { ...r, reminders: newReminders };
      }));
      setAutomations((a) => ({ ...a, autoAccept: { ...a.autoAccept, lastRun: now } }));
    }, automations.autoAccept.intervalSecs * 1000);
    return () => clearInterval(id);
  }, [automations.autoAccept.enabled, automations.autoAccept.intervalSecs, automations.autoAccept.days]);

  // A-04: SLA check
  useEffect(() => {
    if (!automations.slaCheck.enabled) return;
    const id = setInterval(() => {
      const now = new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
      setRecords((rs) => rs.map((r) => {
        if (r.status.includes("Pending-Letter") && (r.slaDays || 0) >= automations.slaCheck.slaDays && !r.slaBreached) {
          setAudit((a) => [{ id: a.length + 1000 + Math.random(), ts: `${TODAY} · ${now} MYT`, actor: "System", type: "sla-breach", detail: `A-04 auto: N-07 URGENT — letter SLA breached (${automations.slaCheck.slaDays}d)`, empId: r.empId, prev: "", next: "" }, ...a]);
          return { ...r, slaBreached: true };
        }
        return r;
      }));
      setAutomations((a) => ({ ...a, slaCheck: { ...a.slaCheck, lastRun: now } }));
    }, automations.slaCheck.intervalSecs * 1000);
    return () => clearInterval(id);
  }, [automations.slaCheck.enabled, automations.slaCheck.intervalSecs, automations.slaCheck.slaDays]);

  // A-06: Day 91 breach check for E08-and-below grades
  useEffect(() => {
    if (!automations.dayCheck.enabled) return;
    const id = setInterval(() => {
      const now = new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" });
      setRecords((rs) => rs.map((r) => {
        if (
          r.gradeBand === "E08_below" &&
          r.day >= automations.dayCheck.dayThreshold &&
          !r.day91Breached &&
          !r.status.startsWith("Complete-")
        ) {
          setAudit((a) => [{ id: a.length + 1000 + Math.random(), ts: `${TODAY} · ${now} MYT`, actor: "System", type: "day91-breach", detail: `A-06 auto: Day ${r.day} ≥ ${automations.dayCheck.dayThreshold} threshold — probation window elapsed for E-grade · N-07 URGENT to HRBP`, empId: r.empId, prev: "", next: "" }, ...a]);
          return { ...r, day91Breached: true };
        }
        return r;
      }));
      setAutomations((a) => ({ ...a, dayCheck: { ...a.dayCheck, lastRun: now } }));
    }, automations.dayCheck.intervalSecs * 1000);
    return () => clearInterval(id);
  }, [automations.dayCheck.enabled, automations.dayCheck.intervalSecs, automations.dayCheck.dayThreshold]);

  function patch(id, fn, audits = []) {
    setRecords((rs) => rs.map((r) => (r.id === id ? fn({ ...r }) : r)));
    audits.forEach(log);
  }

  function submitReview(id, rpm, recText, extra = {}) {
    const r = records.find((x) => x.id === id);
    const n = monthFromStatus(r.status);
    const ext  = r.phase === "EXT";
    const next = ext ? `Ext-Mth${n}-DR-Acpt` : `Mth${n}-DR-Acpt`;
    const previousKpis = kpisForCycle(r, n);
    const submittedKpis = extra.kpis?.length ? extra.kpis : previousKpis;
    // Compare only the target definition (ignore recorded `actual`) so logging
    // achievement isn't mistaken for a change to the KPI targets themselves.
    const targetsOnly = (ks) => ks.map(({ actual, ...rest }) => rest);
    const kpisChanged = JSON.stringify(targetsOnly(submittedKpis)) !== JSON.stringify(targetsOnly(previousKpis));
    const audits = [
      ev(r.lm, "review-submit", `${ext ? "Extension " : ""}Month ${n} review submitted (RPM ${rpm})`, r.empId, r.status, next),
      ev("System", "schedule", "N-04 daily reminder to DR · A-02 7-day timer started", r.empId),
    ];
    if (kpisChanged) {
      audits.splice(1, 0, ev(r.lm, "kpi", `Month ${n} KPI targets changed during review · N-01 to DR`, r.empId));
      audits.splice(2, 0, ev("System", "notify", `N-01 to ${r.name} — Month ${n} KPI targets updated by LM`, r.empId));
    }
    patch(id, (rec) => {
      rec.status  = next;
      if (kpisChanged) rec.monthlyKpis = { ...(rec.monthlyKpis || {}), [n]: submittedKpis };
      // Keep original-cycle and extension reviews separate even though both
      // run cycles 1–3 — only replace a review in the same phase + cycle.
      rec.reviews = [...rec.reviews.filter((v) => !(v.cycle === n && (v.phase === "EXT") === ext)), {
        cycle: n, rpm, rec: recText, actor: rec.lm,
        phase: ext ? "EXT" : "BASE",
        kpisSnapshot: submittedKpis,
        kpisChanged,
        actingCtx:  extra.actingCtx  || "",
        reviewDate: extra.reviewDate  || "",
        recmd:      extra.recmd       || "",
      }];
      rec.reviewDrafts = { ...(rec.reviewDrafts || {}) };
      delete rec.reviewDrafts[n];
      rec.reminders = 0;
      return rec;
    }, audits);
    flash(`Month ${n} review submitted${kpisChanged ? " — KPI change notified to DR" : ""} — sent to ${r.name} for acceptance`);
  }

  function saveReviewDraft(id, cycle, draft) {
    const r = records.find((x) => x.id === id);
    patch(id, (rec) => {
      rec.reviewDrafts = { ...(rec.reviewDrafts || {}), [cycle]: draft };
      return rec;
    }, [
      ev(r.lm, "review-draft", `Month ${cycle} review draft saved`, r.empId),
    ]);
    flash(`Month ${cycle} review draft saved`);
  }

  function acceptReview(id, actor) {
    const r = records.find((x) => x.id === id);
    const n = monthFromStatus(r.status);
    const ext     = r.phase === "EXT";
    const isFinal = ext ? n >= extensionCycles(r) : n >= totalCycles(r);
    let next, audits;
    if (!isFinal) {
      next   = ext ? `Ext-Mth${n + 1}-Review` : `Mth${n + 1}-Review`;
      audits = [
        ev(actor, "accept",  `Month ${n} acceptance (${actor === "System" ? "auto-accept, 7-day" : "DR"})`, r.empId, r.status, next),
        ev("System", "trigger", `Month ${n + 1} review trigger → LM`, r.empId),
      ];
    } else {
      next   = ext ? "Ext-LM-Outcome" : r.wf === "WF2" ? "LM-Outcome(Acting)" : "LM-Outcome";
      audits = [
        ev(actor, "accept",   `Final cycle acceptance (${actor === "System" ? "auto-accept" : "DR"})`, r.empId, r.status, next),
        ev("System", "trigger", "N-15 to LM — outcome decision required (Confirm / Extend / Not Confirm)", r.empId),
      ];
    }
    patch(id, (rec) => {
      rec.status = next;
      rec.reminders = 0;
      if (isFinal) { rec.slaDays = 0; rec.slaBreached = false; } else rec.currentCycle = n + 1;
      return rec;
    }, audits);
    flash(actor === "System" ? `Auto-accepted Month ${n} (actor: System)` : `Month ${n} accepted`);
  }

  function setLmOutcome(id, outcome) {
    const r = records.find((x) => x.id === id);
    const next = r.status === "Ext-LM-Outcome"    ? "Ext-HRBP-Ack"
               : r.status === "LM-Outcome(Acting)" ? "HRBP-Ack(Acting)"
               : "HRBP-Ack";
    patch(id, (rec) => { rec.outcome = outcome; rec.status = next; return rec; }, [
      ev(r.lm, "outcome-set", `LM outcome decision: ${outcome} · awaiting HRBP acknowledgement`, r.empId, r.status, next),
      ev("System", "notify", "N-06 to HRBP — acknowledgement required before letter generation", r.empId),
    ]);
    flash(`Outcome recorded — HRBP acknowledgement requested`);
  }

  function hrbpAcknowledge(id, approved, remarks) {
    const r = records.find((x) => x.id === id);
    if (approved) {
      const next = r.status === "Ext-HRBP-Ack"    ? "Ext-Pending-Letter"
                 : r.status === "HRBP-Ack(Acting)" ? "Pending-Letter(Acting)"
                 : "Pending-Letter";
      patch(id, (rec) => { rec.status = next; rec.slaDays = 0; rec.slaBreached = false; rec.hrbpAckRemarks = remarks || null; return rec; }, [
        ev(HRBP_SELF, "hrbp-ack", `HRBP acknowledged LM decision: ${r.outcome}${remarks ? ` · Note: ${remarks}` : ""}`, r.empId, r.status, next),
        ev("System", "sla-start", "A-04 3-business-day letter SLA started · N-06 to HRBP", r.empId),
      ]);
      flash("Acknowledged — proceeding to letter generation");
    } else {
      const next = r.status === "Ext-HRBP-Ack"    ? "Ext-LM-Outcome"
                 : r.status === "HRBP-Ack(Acting)" ? "LM-Outcome(Acting)"
                 : "LM-Outcome";
      patch(id, (rec) => { rec.status = next; rec.outcome = null; rec.hrbpReturnRemarks = remarks || null; return rec; }, [
        ev(HRBP_SELF, "hrbp-return", `HRBP returned decision to LM for reconsideration${remarks ? ` · Reason: ${remarks}` : ""}`, r.empId, r.status, next),
        ev("System", "notify", "N-16 to LM — HRBP has returned the outcome for review", r.empId),
      ]);
      flash("Returned to Line Manager for reconsideration");
    }
  }

  function generateLetter(id, outcome, label, lt, legal, hrbpNotes = "") {
    const r            = records.find((x) => x.id === id);
    const letterStatus = OUTCOME_TO_LETTER[outcome];
    const signStatus   = OUTCOME_TO_SIGN[outcome];
    const letterId     = "LTR-" + (2100 + r.id);
    const letterVersion = `v1.0-${letterId}-${Date.now()}`;
    const generatedAt  = new Date().toISOString();
    patch(id, (rec) => {
      rec.outcome       = outcome;
      rec.letterType    = lt;
      rec.letterId      = letterId;
      rec.letterVersion = letterVersion;
      rec.letterGeneratedAt = generatedAt;
      rec.legalReviewed = !!legal;
      rec.hrbpNotes     = hrbpNotes || "";
      rec.status        = signStatus;
      rec.slaBreached   = false;
      return rec;
    }, [
      ev(HRBP_SELF, "letter-gen", `${label} letter generated (${lt}) · version ${letterVersion}${outcome === "NConf" ? " · legal review passed" : ""}`, r.empId, r.status, letterStatus),
      ev(HRBP_SELF, "dispatch",   "Letter dispatched to S-10 · N-08 daily reminder to DR", r.empId, letterStatus, signStatus),
    ]);
    flash(`${label} letter generated & dispatched for signing`);
  }

  function signLetter(id, sig) {
    const r = records.find((x) => x.id === id);
    const o = r.outcome;
    let next, empStatus, extra = [];
    if (["Conf", "EarlyConf", "ActingConf"].includes(o)) {
      next      = "Complete-Conf";
      empStatus = o === "ActingConf" ? "Confirmed (acting role)" : "Confirmed";
      if (o === "ActingConf") extra = [ev("System", "notify", "N-12 → Rewards (salary review) · N-13 → HOD", r.empId)];
    } else if (["NConf", "ActingNConf"].includes(o)) {
      next      = "Complete-NConf";
      empStatus = o === "ActingNConf" ? "Reverted to previous role · allowance stopped" : "Not Confirmed";
    } else if (o === "Ext") {
      next      = "Ext-Mth1-Review";
      empStatus = "Probation (extended)";
      extra     = [ev("System", "trigger", `N-10 → LM · single ${extensionCycles(r)}-month extension cycle begins`, r.empId)];
    }
    const isoTs  = new Date().toISOString();
    const simIp  = `10.42.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
    const hashRef = `SHA256-${btoa(r.empId + isoTs).replace(/=/g,"").slice(0,24).toUpperCase()}`;
    patch(id, (rec) => {
      if (o === "Ext") { rec.phase = "EXT"; rec.currentCycle = 1; }
      rec.status           = next;
      rec.employmentStatus = empStatus;
      rec.completion = {
        ts:              TODAY + " · " + new Date().toLocaleTimeString("en-MY", { hour: "2-digit", minute: "2-digit" }) + " MYT",
        isoTs,
        userId:          rec.empId,
        empId:           rec.empId,
        empName:         rec.name,
        letterId:        rec.letterId,
        letterType:      rec.letterType,
        letterVersion:   rec.letterVersion || "v1.0",
        letterGeneratedAt: rec.letterGeneratedAt || isoTs,
        signature:       "Digital acknowledgement",
        signatureMethod: "digital-footprint",
        signatureImage:  "",
        ip:              simIp,
        ua:              navigator.userAgent.slice(0, 60) + "…",
        integrityHash:   hashRef,
        outcome:         rec.outcome,
      };
      return rec;
    }, [
      ev(r.name, "sign",       `Letter ${r.letterId} signed via S-10/F-09 · A-09 processed · hash ${hashRef}`, r.empId, r.status, next),
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

  function earlyConf(id, justification, effectiveDate) {
    const r = records.find((x) => x.id === id);
    patch(id, (rec) => {
      rec.earlyConfRequest = { status: "Pending", justification, effectiveDate, requestedBy: r.lm, requestedAt: TODAY };
      return rec;
    }, [
      ev(r.lm, "early-conf", `F-07 early confirmation recommendation submitted · proposed effective ${effectiveDate}`, r.empId),
      ev("System", "notify", "N-06 to HRBP — early confirmation approval required", r.empId),
    ]);
    flash("Early confirmation recommendation sent to HRBP for approval");
  }

  function approveEarlyConf(id) {
    const r = records.find((x) => x.id === id);
    patch(id, (rec) => {
      rec.outcome = "EarlyConf";
      rec.status = "Pending-Letter";
      rec.slaDays = 0;
      rec.slaBreached = false;
      rec.earlyConfRequest = { ...(rec.earlyConfRequest || {}), status: "Approved", approvedBy: HRBP_SELF, approvedAt: TODAY };
      return rec;
    }, [
      ev(HRBP_SELF, "hrbp-ack", "Early confirmation recommendation approved · LT-04 ready for generation", r.empId, r.status, "Pending-Letter"),
      ev("System", "sla-start", "A-04 3-business-day letter SLA started · LT-04 pending HRBP generation", r.empId),
    ]);
    flash("Early confirmation approved — generate LT-04 from the letter panel");
  }

  function saveKpis(id, kpis, cycle = 1) {
    const r = records.find((x) => x.id === id);
    const activeCycle = r.currentCycle || 0;
    const locksActiveCycle = cycle <= activeCycle || activeCycle === 0;
    const isInitialSetup = (r.status === "KPI-Review" || r.status === "KPI-Review(Acting)") && cycle === 1;
    const next = isInitialSetup ? "Mth1-Review" : r.status;
    patch(id, (rec) => {
      rec.monthlyKpis = { ...(rec.monthlyKpis || {}), [cycle]: kpis };
      if (cycle === 1 || !rec.kpis?.length) rec.kpis = kpis;
      if (locksActiveCycle) rec.kpisLocked = true;
      if (isInitialSetup) {
        rec.status = next;
        rec.currentCycle = 1;
      }
      return rec;
    }, [
      ev(r.lm, "kpi", `Month ${cycle} KPIs submitted (${kpis.length})${locksActiveCycle ? " · locked" : " · future month plan"}${isInitialSetup ? " · moved to Month 1 review" : ""}`, r.empId, r.status, next),
    ]);
    flash(isInitialSetup ? "KPIs submitted — Month 1 review is now available" : locksActiveCycle ? `Month ${cycle} KPIs submitted and locked — HRBP unlock required for mid-month edits` : `Month ${cycle} KPIs saved`);
  }

  function requestKpiUnlock(id) {
    const r = records.find((x) => x.id === id);
    patch(id, (rec) => { rec.kpiUnlockRequested = true; return rec; }, [
      ev(r.lm, "kpi", "KPI unlock requested (BR-10) — awaiting HRBP approval", r.empId),
    ]);
    flash("Unlock request sent to HRBP");
  }

  function approveKpiUnlock(id) {
    const r = records.find((x) => x.id === id);
    patch(id, (rec) => { rec.kpisLocked = false; rec.kpiUnlockRequested = false; return rec; }, [
      ev("HRBP", "kpi", "KPI unlock approved (BR-10) — KPIs now editable", r.empId),
    ]);
    flash("KPI unlock approved — LM can now edit KPIs");
  }

  function addRecord(rec) {
    const id   = Math.max(...records.map((r) => r.id)) + 1;
    const full = {
      id, ...rec, lm: LM_SELF, phase: "NEW", currentCycle: 0,
      status:           rec.wf === "WF2" ? "KPI-Review(Acting)" : "KPI-Review",
      employmentStatus: rec.wf === "WF2" ? "Acting probation" : "Probation",
      reviews: [], kpis: [], day: 1,
    };
    setRecords((rs) => [...rs, full]);
    log(ev(LM_SELF, "create", `${rec.wf === "WF2" ? "Acting-role (F-10)" : "New-hire (F-01)"} probation initiated`, rec.empId, "—", full.status));
    if (rec.wf === "WF2") log(ev("HOD", "approve", `N-13 HOD approval captured for acting placement (${rec.acting.grade})`, rec.empId));
    flash(`${rec.name} added — set KPIs to continue`);
    setActiveId(id);
  }

  function updateProfile(id, fields) {
    setRecords((rs) => rs.map((r) => r.id === id ? { ...r, ...fields } : r));
  }

  function reassignLM(id, newLm, reason) {
    const r = records.find((x) => x.id === id);
    patch(id, (rec) => { rec.lm = newLm; rec.dept = ["Marcus Lee", "Priya Nair"].includes(newLm) ? "Operations" : "Technology"; return rec; }, [
      ev(HRBP_SELF, "escalation", `F-13 LM reassignment: ${r.lm} → ${newLm} · Reason: ${reason}`, r.empId, r.lm, newLm),
      ev("System", "notify", `N-11 → ${newLm} (new LM) · N-09 → ${r.lm} (previous LM) · record updated`, r.empId),
    ]);
    flash(`${r.name} reassigned to ${newLm}`);
  }

  function reportExport(roleName, reportCode, format, rowCount) {
    const scope = roleName === "LM" ? "own-team" : roleName === "LEAD" ? "aggregate" : "org-wide";
    log(ev(ROLES.find((r) => r.id === roleName)?.who || roleName, "export", `${reportCode} ${format.toUpperCase()} export · scope=${scope} · rows=${rowCount}`, "REPORT", "", reportCode));
    flash(`${reportCode} ${format.toUpperCase()} export logged to audit`);
  }

  const active = records.find((r) => r.id === activeId) || null;
  const lockMainScroll = role === "LM" && view === "dashboard" && !active;

  return (
    <div className="min-h-screen w-full text-[#4D4D4D]" style={{ background: "var(--paper)", fontFamily: "var(--sans)" }}>
      <StyleVars />

      {/* ── Header ── */}
      <header className="sticky top-0 z-40 flex items-center gap-3 px-4 sm:px-6 h-16 text-white shadow-sm" style={{ background: "linear-gradient(90deg, var(--brand-purple), var(--brand-red))" }}>
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
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-slate-200 bg-white h-full">
          <nav className="p-3 space-y-0.5">
            {NAV[role].map(([key, label, Icon, code]) => {
              const on = view === key;
              return (
                <button key={key} onClick={() => { setView(key); setActiveId(null); }} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${on ? "text-white" : "text-slate-600 hover:bg-slate-50"}`} style={on ? { background: "var(--brand)" } : {}}>
                  <Icon size={17} />
                  <span className="font-medium">{label}</span>
                  <span className={`ml-auto text-[10px] ${on ? "text-white/55" : "text-slate-400"}`} style={{ fontFamily: "var(--mono)" }}>{code}</span>
                </button>
              );
            })}
          </nav>
          <div className="mt-auto p-3 space-y-2">
            <RoleCard role={role} />
            <button onClick={() => { setView("about"); setActiveId(null); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50">
              <Info size={14} /> About this prototype
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className={`flex-1 min-w-0 p-4 sm:p-6 lg:px-8 lg:py-5 w-full ${lockMainScroll ? "overflow-hidden" : "overflow-y-auto"}`}>
          {banner && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-white ring-1 ring-amber-200 px-4 py-3 shadow-sm">
              <div className="grid place-items-center w-7 h-7 rounded-md bg-amber-50 text-amber-600 shrink-0"><Info size={15} /></div>
              <p className="text-sm text-slate-600 leading-relaxed">
                <span className="font-semibold text-slate-800">Interactive prototype.</span> Simulated in-memory data — no backend, auth, or persistence. Built from BRD / FRD / Charter v2.1. Switch roles (top-right) to see RBAC; drive the workflow from each role's screens.
              </p>
              <button onClick={() => setBanner(false)} className="ml-auto text-slate-400 hover:text-slate-600"><X size={16} /></button>
            </div>
          )}

          {view === "about" && <About />}

          {role === "LM"   && view === "dashboard" && !active && <LMDashboard records={records} onOpen={setActiveId} />}
          {role === "LM"   && view === "dashboard" && active  && <CaseDetail rec={active} role={role} onBack={() => setActiveId(null)} onSubmitReview={submitReview} onSaveReviewDraft={saveReviewDraft} onEscalate={escalate} onSaveKpis={saveKpis} onRequestKpiUnlock={requestKpiUnlock} onSetOutcome={setLmOutcome} onEarlyConf={earlyConf} flash={flash} />}
          {role === "LM"   && view === "reviews"   && <ReviewQueue records={records} onOpen={(id) => { setActiveId(id); setView("dashboard"); }} onSaveKpis={saveKpis} onRequestKpiUnlock={requestKpiUnlock} onSubmitReview={submitReview} onSaveReviewDraft={saveReviewDraft} />}
          {role === "LM"   && view === "reports"   && <Reports records={records} role="LM" onReportExport={reportExport} />}
          {role === "LM"   && view === "settings"  && <LMSettings permissions={lmPermissions} />}

          {role === "DR"   && view === "myprob"    && <DRHome records={records} asDr={asDr} setAsDr={setAsDr} onAccept={acceptReview} onSign={signLetter} onUpdateProfile={updateProfile} />}


          {role === "HRBP" && view === "pipeline"  && !active && <HRBPPipeline records={records} onOpen={setActiveId} onAdd={addRecord} onReports={() => setView("reports")} />}
          {role === "HRBP" && view === "pipeline"  && active  && <CaseDetail rec={active} role={role} onBack={() => setActiveId(null)} onGenerate={generateLetter} onHrbpAck={hrbpAcknowledge} onReassignLM={reassignLM} onApproveKpiUnlock={approveKpiUnlock} onApproveEarlyConf={approveEarlyConf} allRecords={records} flash={flash} />}
          {role === "HRBP" && view === "sla"       && <SLATracker records={records} onOpen={(id) => { setActiveId(id); setView("pipeline"); }} />}
          {role === "HRBP" && view === "audit"     && <AuditTrail audit={audit} records={records} onExportLog={(detail) => log(ev("HRBP", "export", `F-08: ${detail}`, ""))} />}
          {role === "HRBP" && view === "reports"   && <Reports records={records} role="HRBP" onReportExport={reportExport} />}
          {role === "HRBP" && view === "notifications" && <NotificationCenter />}
          {role === "HRBP" && view === "console"   && <SystemConsole records={records} lmPermissions={lmPermissions} setLmPermissions={setLmPermissions} automations={automations} />}
          {role === "HRBP" && view === "settings_upload" && <SettingsUpload />}

          {role === "HOD"  && <HODPipeline records={records} audit={audit} view={view} />}

          {role === "LEAD" && view === "reports"   && <Reports records={records} role="LEAD" onReportExport={reportExport} />}

          {role === "ADMIN" && view === "console"   && <SystemConsole records={records} lmPermissions={lmPermissions} setLmPermissions={setLmPermissions} automations={automations} onPatchAutomation={patchAutomation} />}
          {role === "ADMIN" && view === "audit"     && <AuditTrail audit={audit} records={records} onExportLog={(detail) => log(ev("HRBP", "export", `F-08: ${detail}`, ""))} />}
          {role === "ADMIN" && view === "notifications" && <NotificationCenter />}
        </main>

      </div>

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm text-white shadow-lg" style={{ background: toast.kind === "ok" ? "#3CC49F" : "#C8102E" }}>
          <CheckCircle2 size={17} /> {toast.msg}
        </div>
      )}
    </div>
  );
}
