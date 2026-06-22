import { useState } from "react";
import {
  ChevronDown, Calendar, CheckCircle2, X, Info,
} from "lucide-react";
import { TODAY, ROLES, NAV, OUTCOME_TO_SIGN, OUTCOME_TO_LETTER, HRBP_SELF, LM_SELF } from "./constants";
import { seedRecords, seedAudit, ev } from "./data/seed";
import { monthFromStatus, isActiveProbation } from "./utils/status";
import { totalCycles } from "./utils/lifecycle";
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

  const log   = (e)           => setAudit((a) => [{ ...e, id: a.length + 1000 + Math.random() }, ...a]);
  const flash = (msg, kind = "ok") => { setToast({ msg, kind }); setTimeout(() => setToast(null), 2600); };

  function switchRole(r) { setRole(r); setView(NAV[r][0][0]); setActiveId(null); setRoleMenu(false); }

  function patch(id, fn, audits = []) {
    setRecords((rs) => rs.map((r) => (r.id === id ? fn({ ...r }) : r)));
    audits.forEach(log);
  }

  function submitReview(id, rpm, recText) {
    const r = records.find((x) => x.id === id);
    const n = monthFromStatus(r.status);
    const ext  = r.phase === "EXT";
    const next = ext ? `Ext-Mth${n}-DR-Acpt` : `Mth${n}-DR-Acpt`;
    patch(id, (rec) => {
      rec.status  = next;
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
    const ext     = r.phase === "EXT";
    const isFinal = ext ? n >= 3 : n >= totalCycles(r);
    let next, audits;
    if (!isFinal) {
      next   = ext ? `Ext-Mth${n + 1}-Review` : `Mth${n + 1}-Review`;
      audits = [
        ev(actor, "accept",  `Month ${n} acceptance (${actor === "System" ? "auto-accept, 7-day" : "DR"})`, r.empId, r.status, next),
        ev("System", "trigger", `Month ${n + 1} review trigger → LM`, r.empId),
      ];
    } else {
      next   = ext ? "Ext-Pending-Letter" : r.wf === "WF2" ? "Pending-Letter(Acting)" : "Pending-Letter";
      audits = [
        ev(actor, "accept",      `Final cycle acceptance (${actor === "System" ? "auto-accept" : "DR"})`, r.empId, r.status, next),
        ev("System", "sla-start", "N-06 to HRBP · A-04 5-day SLA started", r.empId),
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

  function generateLetter(id, outcome, label, lt, legal) {
    const r          = records.find((x) => x.id === id);
    const letterStatus = OUTCOME_TO_LETTER[outcome];
    const signStatus   = OUTCOME_TO_SIGN[outcome];
    patch(id, (rec) => {
      rec.outcome      = outcome;
      rec.letterType   = lt;
      rec.letterId     = "LTR-" + (2100 + rec.id);
      rec.legalReviewed = !!legal;
      rec.status       = signStatus;
      rec.slaBreached  = false;
      return rec;
    }, [
      ev(HRBP_SELF, "letter-gen", `${label} letter generated (${lt})${outcome === "NConf" ? " · legal review passed" : ""}`, r.empId, r.status, letterStatus),
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
      extra     = [ev("System", "trigger", "N-10 → LM · single 3-month extension cycle begins", r.empId)];
    }
    patch(id, (rec) => {
      if (o === "Ext") { rec.phase = "EXT"; rec.currentCycle = 1; }
      rec.status         = next;
      rec.employmentStatus = empStatus;
      rec.completion = {
        ts:              TODAY + " · 09:30 MYT",
        empId:           rec.empId,
        letterId:        rec.letterId,
        letterType:      rec.letterType,
        signature:       sig.method === "typed" ? sig.typed : "Drawn signature",
        signatureMethod: sig.method,
        signatureImage:  sig.image || "",
        ip:  "10.42.7.118",
        ua:  "Chrome 126 · FAITH Web",
      };
      return rec;
    }, [
      ev(r.name, "sign",       `Letter ${r.letterId} signed via S-10/F-09 · A-09 processed`, r.empId, r.status, next),
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
    patch(id, (rec) => {
      rec.status = "Terminated";
      rec.terminationReason = reason;
      rec.employmentStatus  = "Probation (ended)";
      rec.reminders = 0;
      return rec;
    }, [
      ev(r.lm, "terminate", `F-11 early termination: ${reason}${remarks ? " — " + remarks : ""}`, r.empId, r.status, "Terminated"),
      ev("System", "notify",  "N-14 → stakeholders · all open tasks cancelled", r.empId),
    ]);
    flash("Probation terminated — all pending tasks cancelled");
  }

  function saveKpis(id, kpis) {
    const r = records.find((x) => x.id === id);
    patch(id, (rec) => { rec.kpis = kpis; return rec; }, [
      ev(r.lm, "kpi", `KPIs set (${kpis.length}) · armed for Day-31 trigger`, r.empId),
    ]);
    flash("KPIs saved — awaiting Day-31 review trigger (A-01)");
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

  const active = records.find((r) => r.id === activeId) || null;

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
          <div className="hidden sm:flex items-center gap-1.5 text-white/55 text-xs px-2.5 py-1.5 rounded-md" style={{ background: "rgba(255,255,255,.07)", fontFamily: "var(--mono)" }}>
            <Calendar size={13} /> {TODAY}
          </div>
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

      <div className="flex">
        {/* ── Sidebar ── */}
        <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-slate-200 bg-white min-h-[calc(100vh-3.5rem)]">
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
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-[1180px]">
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

          {role === "LM"   && view === "dashboard" && !active && <LMDashboard records={records} onOpen={setActiveId} onAdd={addRecord} />}
          {role === "LM"   && view === "dashboard" && active  && <CaseDetail rec={active} role={role} onBack={() => setActiveId(null)} onSubmitReview={submitReview} onEscalate={escalate} onTerminate={terminate} onSaveKpis={saveKpis} flash={flash} />}
          {role === "LM"   && view === "reports"   && <Reports records={records} role="LM" onReportExport={reportExport} />}

          {role === "DR"   && view === "myprob"    && <DRHome records={records} asDr={asDr} setAsDr={setAsDr} onAccept={acceptReview} onSign={signLetter} />}

          {role === "HRBP" && view === "pipeline"  && !active && <HRBPPipeline records={records} onOpen={setActiveId} />}
          {role === "HRBP" && view === "pipeline"  && active  && <CaseDetail rec={active} role={role} onBack={() => setActiveId(null)} onGenerate={generateLetter} flash={flash} />}
          {role === "HRBP" && view === "sla"       && <SLATracker records={records} />}
          {role === "HRBP" && view === "audit"     && <AuditTrail audit={audit} />}
          {role === "HRBP" && view === "reports"   && <Reports records={records} role="HRBP" onReportExport={reportExport} />}
          {role === "HRBP" && view === "console"   && <SystemConsole onScheduler={runScheduler} onAutoAccept={runAutoAccept} onSla={runSlaCheck} records={records} />}
          {role === "HRBP" && view === "settings_upload" && <SettingsUpload />}

          {role === "LEAD" && view === "reports"   && <Reports records={records} role="LEAD" onReportExport={reportExport} />}
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
