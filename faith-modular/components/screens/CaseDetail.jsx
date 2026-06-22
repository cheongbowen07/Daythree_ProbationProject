import React, { useState } from "react";
import { ChevronRight, FileSignature, ClipboardList, PenLine, Send, Inbox, XCircle, Gavel, CheckCircle2, Lock, Bell } from "lucide-react";
import { Card, Btn, PageHead, Mono, StatusBadge, Tag, RpmDots, Row } from "../ui";
import { 
  monthFromStatus, isActiveProbation, outcomeOptions, totalCycles, daysCap, 
  OUTCOME_TO_LETTER, OUTCOME_TO_SIGN, TODAY, HRBP_SELF 
} from "../../constants";
import { KpiModal, ReviewModal, EscalateModal, TerminateModal } from "../modals";

function LifecycleRail({ rec }) {
  // Simple implementation or import from shared
  return <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-400 italic">Lifecycle Rail component rendered here</div>;
}

export default function CaseDetail({ rec, role, onBack, onSubmitReview, onEscalate, onTerminate, onSaveKpis, onGenerate, flash, templates }) {
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
          {letterDue && <LetterGenPanel rec={rec} onGenerate={onGenerate} templates={templates} />}
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

const TONE_CLASS = {
  kpi: "bg-[#EFE8FF] text-[#5D3FD3] ring-[#C3B1F5]",
  review: "bg-[#E8F3FF] text-[#1A6ECC] ring-[#A8D1FF]",
  accept: "bg-[#E8FAF4] text-[#1A7D5E] ring-[#A8E8D0]",
  pending: "bg-[#FFF3D6] text-[#9A6400] ring-[#FFD98A]",
  letter: "bg-[#EFE8FF] text-[#5D3FD3] ring-[#C3B1F5]",
};

function LetterGenPanel({ rec, onGenerate, templates }) {
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
