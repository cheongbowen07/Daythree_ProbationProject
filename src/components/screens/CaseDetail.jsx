import { useState } from "react";
import { ChevronRight, ChevronDown, ClipboardList, PenLine, Bell, FileSignature, Send, Inbox, XCircle, Lock, Gavel, UserCog, Edit2 } from "lucide-react";
import { TODAY, TONE_CLASS } from "../../constants";
import { monthFromStatus, isActiveProbation } from "../../utils/status";
import { totalCycles, daysCap, outcomeOptions } from "../../utils/lifecycle";
import { Card, Btn, StatusBadge, Tag, Mono, Row, RpmDots } from "../ui";
import LifecycleRail from "../LifecycleRail";
import KpiModal from "../modals/KpiModal";
import ReviewModal from "../modals/ReviewModal";
import EscalateModal from "../modals/EscalateModal";
import TerminateModal from "../modals/TerminateModal";
import EmployeeProfile from "../EmployeeProfile";
import ReassignLMModal from "../modals/ReassignLMModal";

function ActionPanel({ code, title, desc, tone: t, children }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className={`grid place-items-center w-9 h-9 rounded-lg shrink-0 ${TONE_CLASS[t]}`}><Bell size={17} /></div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">{title}</span>
            <Mono className="text-[10px] text-slate-400">{code}</Mono>
          </div>
          <p className="text-sm text-slate-500 mt-1 mb-3">{desc}</p>
          {children}
        </div>
      </div>
    </Card>
  );
}

function LmOutcomePanel({ rec, onSetOutcome }) {
  const opts = outcomeOptions(rec);
  const [sel, setSel] = useState(null);
  const selOpt = opts.find((o) => o[0] === sel);

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-slate-800">Record outcome decision</span>
        <Mono className="text-[10px] text-slate-400">S-07 / F-05</Mono>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        All review cycles are complete. Select the outcome — HRBP will then generate and dispatch the letter for signing.
      </p>
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
      {selOpt && (
        <div className="mb-4 rounded-lg ring-1 ring-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Selected outcome</div>
          <p className="font-medium text-slate-800">{selOpt[1]} · {selOpt[2]}</p>
          {sel === "NConf" && <p className="mt-1.5 text-xs text-rose-600">HRBP will obtain mandatory legal review before generating the Non-Confirmation letter.</p>}
          {sel === "Ext"   && <p className="mt-1.5 text-xs text-amber-600">A single 3-month extension cycle will begin after signing.</p>}
        </div>
      )}
      <Btn icon={Send} disabled={!sel} onClick={() => onSetOutcome(rec.id, sel)}>
        Confirm outcome &amp; notify HRBP
      </Btn>
    </Card>
  );
}

function LetterGenPanel({ rec, onGenerate }) {
  const opts      = outcomeOptions(rec);
  const outcome   = rec.outcome;
  const selOpt    = opts.find((o) => o[0] === outcome);
  const [legal, setLegal] = useState(false);
  const needLegal = outcome === "NConf";
  const ready     = selOpt && (!needLegal || legal);

  if (!selOpt) return (
    <Card className="p-5 text-sm text-slate-500">
      Waiting for Line Manager to record the outcome decision.
    </Card>
  );

  const slaDays   = rec.slaDays || 0;
  const slaLimit  = 3;
  const slaOver   = rec.slaBreached;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-slate-800">Generate outcome letter</span>
        <Mono className="text-[10px] text-slate-400">S-07 / F-05</Mono>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        Outcome decided by Line Manager. Review the details and generate the letter for e-signature.
      </p>

      {/* SLA indicator */}
      <div className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 mb-4 ring-1 ${slaOver ? "bg-rose-50 ring-rose-200" : "bg-amber-50 ring-amber-200"}`}>
        <div className="flex-1">
          <div className={`text-xs font-semibold ${slaOver ? "text-rose-700" : "text-amber-700"}`}>
            {slaOver ? "SLA breached — N-07 sent to HRBP" : `SLA: ${slaDays} of ${slaLimit} business days elapsed`}
          </div>
          <div className="w-full h-1 rounded-full bg-white/60 mt-1.5 overflow-hidden">
            <div className={`h-full ${slaOver ? "bg-rose-500" : "bg-amber-400"}`} style={{ width: `${Math.min(100, (slaDays / slaLimit) * 100)}%` }} />
          </div>
        </div>
        <Mono className={`text-xs shrink-0 ${slaOver ? "text-rose-600" : "text-amber-600"}`}>{slaDays}/{slaLimit}d</Mono>
      </div>

      {/* Review summary */}
      {rec.reviews?.length > 0 && (
        <div className="mb-4 rounded-lg ring-1 ring-slate-100 p-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Review summary</div>
          <div className="space-y-1.5">
            {[...rec.reviews].sort((a, b) => a.cycle - b.cycle).map((rv) => (
              <div key={rv.cycle} className="flex items-center gap-3 text-xs">
                <Tag className="bg-slate-100 text-slate-600 shrink-0">Month {rv.cycle}</Tag>
                <RpmDots score={rv.rpm} />
                {rv.recmd && <span className="text-slate-500">{rv.recmd}</span>}
                {rv.rec && <span className="text-slate-400 truncate">{rv.rec}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg ring-1 ring-cyan-500 bg-cyan-50 mb-4 text-sm">
        <span className="font-medium text-slate-700">{selOpt[1]}</span>
        <Mono className="text-[11px] text-cyan-700">{selOpt[2]}</Mono>
      </div>

      {needLegal && (
        <label className="flex items-start gap-2.5 p-3 mb-4 rounded-lg bg-rose-50 ring-1 ring-rose-200 cursor-pointer">
          <input type="checkbox" checked={legal} onChange={(e) => setLegal(e.target.checked)} className="mt-0.5" />
          <span className="text-sm text-rose-700"><Gavel size={13} className="inline mr-1" /> <span className="font-medium">Mandatory legal review.</span> Non-Confirmation (LT-03) cannot be generated until Legal has reviewed.</span>
        </label>
      )}

      <div className="mb-4 rounded-lg ring-1 ring-slate-200 bg-slate-50 p-4 text-sm text-slate-600 leading-relaxed">
        <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-2">Letter preview · {selOpt[2]}</div>
        <p><span className="text-slate-400">Re:</span> Probation Outcome — <span className="font-medium text-slate-800">{selOpt[1]}</span></p>
        <p className="mt-1.5">Dear {rec.name} ({rec.empId}), following completion of your {rec.gradeBand === "M09_M12" ? "6-month" : "3-month"} probation review cycle{rec.acting ? " in your acting role" : ""}, we confirm the outcome above, effective {TODAY}. {outcome === "Ext" && "Your probation is extended by one fixed 3-month cycle. "}{outcome === "ActingConf" && "Rewards will action your salary review and new-role benefits. "}{outcome === "ActingNConf" && "You will revert to your previous role and the acting allowance will stop immediately. "}</p>
        <p className="mt-1.5 text-slate-400 text-xs">Merge fields populated from Employee Profile · signed copy stored in FAITH document library.</p>
      </div>

      <Btn icon={Send} disabled={!ready} onClick={() => onGenerate(rec.id, outcome, selOpt[1], selOpt[2], legal)}>
        Generate &amp; dispatch for signing
      </Btn>
    </Card>
  );
}

const LM_OUTCOME_STATUSES  = ["LM-Outcome", "LM-Outcome(Acting)", "Ext-LM-Outcome"];
const HRBP_ACK_STATUSES    = ["HRBP-Ack", "HRBP-Ack(Acting)", "Ext-HRBP-Ack"];
const LETTER_DUE_STATUSES  = ["Pending-Letter", "Pending-Letter(Acting)", "Ext-Pending-Letter"];

const OUTCOME_LABELS = {
  Conf: "Confirmation", EarlyConf: "Early Confirmation", Ext: "Extension",
  NConf: "Non-Confirmation", ActingConf: "Acting Confirmation", ActingNConf: "Acting Non-Confirmation",
};
const OUTCOME_LT = {
  Conf: "LT-01", EarlyConf: "LT-04", Ext: "LT-02",
  NConf: "LT-03", ActingConf: "LT-05", ActingNConf: "LT-06",
};

function HrbpAckPanel({ rec, onHrbpAck }) {
  const [remarks, setRemarks] = useState("");
  const label = OUTCOME_LABELS[rec.outcome] || rec.outcome;
  const lt    = OUTCOME_LT[rec.outcome] || "—";
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-slate-800">Acknowledge LM outcome decision</span>
        <Mono className="text-[10px] text-slate-400">S-07 / F-05</Mono>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        The Line Manager has recorded an outcome. Review it below and either acknowledge to proceed to letter generation, or return it to the LM for reconsideration.
      </p>

      <div className="flex items-center justify-between gap-2 px-3.5 py-3 rounded-lg ring-1 ring-slate-200 bg-slate-50 mb-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">LM decision</div>
          <div className="font-semibold text-slate-800">{label}</div>
        </div>
        <Mono className="text-[11px] text-cyan-700 bg-cyan-50 px-2 py-1 rounded">{lt}</Mono>
      </div>

      {rec.outcome === "NConf" && (
        <div className="flex items-start gap-2 p-3 mb-4 rounded-lg bg-rose-50 ring-1 ring-rose-200 text-sm text-rose-700">
          <Gavel size={14} className="shrink-0 mt-0.5" />
          <span><span className="font-medium">Mandatory legal review required</span> before the Non-Confirmation letter can be generated. Acknowledge only after Legal sign-off is confirmed.</span>
        </div>
      )}

      <label className="block text-xs text-slate-500 mb-1">Remarks (optional)</label>
      <textarea
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        rows={2}
        placeholder="Add a note for the audit trail…"
        className="w-full text-sm rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-cyan-400 resize-none mb-4"
      />

      <div className="flex gap-2">
        <Btn icon={Send} onClick={() => onHrbpAck(rec.id, true, remarks)} className="flex-1">
          Acknowledge &amp; proceed to letter
        </Btn>
        <Btn variant="ghost" icon={XCircle} onClick={() => onHrbpAck(rec.id, false, remarks)} className="text-rose-600 ring-rose-200 hover:bg-rose-50">
          Return to LM
        </Btn>
      </div>
    </Card>
  );
}

function ReviewRow({ rv, kpis, role }) {
  const [open, setOpen] = useState(false);
  const canExpand = kpis.length > 0;

  return (
    <div className="border-b border-slate-50 last:border-0">
      <div
        className={`flex items-center gap-3 py-2 text-sm ${canExpand ? "cursor-pointer hover:bg-slate-50/60 rounded-lg px-2 -mx-2" : ""}`}
        onClick={() => canExpand && setOpen((v) => !v)}
      >
        {canExpand && (
          <span className="text-slate-400 shrink-0">
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        )}
        <Tag className="bg-slate-100 text-slate-600 shrink-0">Month {rv.cycle}</Tag>
        <RpmDots score={rv.rpm} />
        <span className={`text-xs font-medium ${rv.rpm >= 3 ? "text-emerald-600" : "text-rose-600"}`}>
          {rv.rpm >= 3 ? "Meets expectations" : "Below threshold"}
        </span>
        {rv.rec && <span className="text-xs text-slate-400 truncate ml-auto max-w-[200px]">{rv.rec}</span>}
      </div>
      {canExpand && open && kpis.length > 0 && (
        <div className="mx-2 mb-2 mt-1 rounded-lg bg-slate-50 ring-1 ring-slate-100 p-3 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">KPIs assessed this cycle</div>
          {kpis.map((k, i) => (
            <div key={i} className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-slate-700">{k.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{k.target}</div>
              </div>
              <Tag className="bg-cyan-50 text-cyan-700 shrink-0 text-[11px]">{k.weight}%</Tag>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CaseDetail({ rec, role, onBack, onSubmitReview, onEscalate, onTerminate, onSaveKpis, onGenerate, onSetOutcome, onHrbpAck, onReassignLM, allRecords = [], flash }) {
  const [modal, setModal] = useState(null);
  const lmOptions = [...new Set(allRecords.map((r) => r.lm))].sort();
  const n = monthFromStatus(rec.status);
  const lmReviewDue  = role === "LM"   && /-Review$/.test(rec.status);
  const kpiDue       = role === "LM"   && (rec.status === "KPI-Review" || rec.status === "KPI-Review(Acting)");
  const lmOutcomeDue = role === "LM"   && LM_OUTCOME_STATUSES.includes(rec.status);
  const hrbpAckDue   = role === "HRBP" && HRBP_ACK_STATUSES.includes(rec.status);
  const letterDue    = role === "HRBP" && LETTER_DUE_STATUSES.includes(rec.status);
  const canTerminate    = role === "LM" && isActiveProbation(rec.status);
  const earlyConfVisible = role === "LM" && rec.wf === "WF1" && /Mth[1-6]/.test(rec.status);
  const earlyConf        = earlyConfVisible && rec.gradeBand === "M09_M12" && /Mth[3-6]/.test(rec.status);

  return (
    <div className="fadeUp">
      <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-3">
        <ChevronRight size={15} className="rotate-180" /> Back
      </button>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{rec.name}</h1>
            {role === "HRBP" && onReassignLM && (
              <button
                onClick={() => setModal("reassign")}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 ring-1 ring-indigo-200 px-2.5 py-1 rounded-lg transition"
              >
                <UserCog size={12} /> Reassign LM
              </button>
            )}
          </div>
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
          {lmOutcomeDue && <LmOutcomePanel rec={rec} onSetOutcome={onSetOutcome} />}
          {hrbpAckDue   && <HrbpAckPanel  rec={rec} onHrbpAck={onHrbpAck} />}
          {letterDue    && <LetterGenPanel rec={rec} onGenerate={onGenerate} />}
          {!kpiDue && !lmReviewDue && !lmOutcomeDue && !hrbpAckDue && !letterDue && (
            <Card className="px-5 py-6 text-center text-sm text-slate-500">
              {role === "LM" ? "No line-manager action is due on this record right now." : "No HRBP letter action is due on this record right now."}
            </Card>
          )}

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-slate-800 flex items-center gap-2"><ClipboardList size={16} /> Review history</div>
              {role === "LM" && rec.kpis.length > 0 && (
                <Btn size="sm" variant="ghost" icon={Edit2} onClick={() => setModal("kpi")} className="text-xs -my-1 -mr-1">
                  Adjust KPIs
                </Btn>
              )}
            </div>
            {rec.reviews.length === 0
              ? <p className="text-sm text-slate-400">No reviews submitted yet.</p>
              : (
                <div className="space-y-1">
                  {[...rec.reviews].sort((a, b) => a.cycle - b.cycle).map((rv) => (
                    <ReviewRow key={rv.cycle} rv={rv} kpis={rec.kpis} role={role} onEditKpis={role === "LM" ? () => setModal("kpi") : null} />
                  ))}
                </div>
              )}
          </Card>

          {rec.completion && (
            <Card className="p-5">
              <div className="text-sm font-semibold text-slate-800 mb-1 flex items-center gap-2">
                <FileSignature size={16} /> Signing completion record · A-09
              </div>
              <div className="text-[10px] text-emerald-600 bg-emerald-50 ring-1 ring-emerald-100 rounded px-2 py-0.5 inline-flex items-center gap-1 mb-4 font-semibold">
                ✓ Immutable · append-only · tamper-evident
              </div>

              <div className="mb-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Digital Fingerprint</div>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                  {[
                    ["User ID",    rec.completion.userId],
                    ["Date / Time", rec.completion.ts],
                    ["IP Address",  rec.completion.ip],
                    ["User Agent",  rec.completion.ua],
                    ["Integrity Hash", rec.completion.integrityHash],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-slate-50 py-1">
                      <dt className="text-slate-400 shrink-0">{k}</dt>
                      <dd className="text-slate-700 text-right break-all" style={{ fontFamily: "var(--mono)", fontSize: "11px" }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="mb-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Letter Version Control</div>
                <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                  {[
                    ["Letter ID",      rec.letterId],
                    ["Letter Type",    rec.letterType],
                    ["Version",        rec.completion.letterVersion || "v1.0"],
                    ["Generated At",   rec.completion.letterGeneratedAt ? new Date(rec.completion.letterGeneratedAt).toLocaleString("en-MY") : "—"],
                    ["PDF Store",      "FAITH document library · read-only"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-slate-50 py-1">
                      <dt className="text-slate-400 shrink-0">{k}</dt>
                      <dd className="text-slate-700 text-right" style={{ fontFamily: "var(--mono)", fontSize: "11px" }}>{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Signature</div>
                <dl className="gap-y-1.5 text-sm">
                  {[
                    ["Method",    rec.completion.signatureMethod === "typed" ? "Typed name" : "Drawn"],
                    ["Captured",  rec.completion.signature],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3 border-b border-slate-50 py-1">
                      <dt className="text-slate-400">{k}</dt>
                      <dd className="text-slate-700 text-right">{v}</dd>
                    </div>
                  ))}
                </dl>
                {rec.completion.signatureImage && (
                  <div className="mt-3 rounded-lg ring-1 ring-slate-200 bg-white p-3">
                    <div className="text-xs font-medium text-slate-400 mb-2">Captured drawn signature</div>
                    <img src={rec.completion.signatureImage} alt="Drawn signature" className="h-20 max-w-full object-contain" />
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-5">
          <EmployeeProfile rec={rec} editable={false} />


          {(canTerminate || earlyConfVisible) && (
            <Card className="p-5 space-y-2">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-1">Manager actions</div>

              {earlyConfVisible && (
                <div className="relative group">
                  <Btn
                    variant="soft"
                    size="sm"
                    icon={Send}
                    disabled={!earlyConf}
                    className={`w-full ${!earlyConf ? "opacity-40 cursor-not-allowed" : ""}`}
                    onClick={() => earlyConf && flash("Early confirmation request routed to HRBP (F-07 · LT-04)")}
                  >
                    Request early confirmation (F-07)
                  </Btn>
                  {!earlyConf && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 z-20 hidden group-hover:block pointer-events-none">
                      <div className="bg-slate-800 text-white text-xs rounded-lg px-3 py-2 text-center shadow-lg leading-relaxed">
                        {rec.gradeBand !== "M09_M12"
                          ? "Early confirmation is only available for M09 grade and above. E-grade employees must complete the full probation cycle."
                          : "Early confirmation is available from Month 3 onwards."}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
                      </div>
                    </div>
                  )}
                </div>
              )}

              <Btn variant="ghost" size="sm" icon={Inbox} className="w-full" onClick={() => setModal("escalate")}>Report inaccuracy (F-06)</Btn>
              {canTerminate && (
                <Btn variant="ghost" size="sm" icon={XCircle} className="w-full text-rose-600 ring-rose-200 hover:bg-rose-50" onClick={() => setModal("terminate")}>
                  Early termination (F-11)
                </Btn>
              )}
            </Card>
          )}
        </div>
      </div>

      {modal === "kpi"       && <KpiModal      rec={rec} onClose={() => setModal(null)} onSave={(k) => { onSaveKpis(rec.id, k); setModal(null); }} />}
      {modal === "review"    && <ReviewModal   rec={rec} month={n} onClose={() => setModal(null)} onSubmit={(rpm, t, extra) => { onSubmitReview(rec.id, rpm, t, extra); setModal(null); }} />}
      {modal === "escalate"  && <EscalateModal onClose={() => setModal(null)} onSubmit={(i, d) => { onEscalate(rec.id, i, d); setModal(null); }} />}
      {modal === "terminate" && <TerminateModal onClose={() => setModal(null)} onSubmit={(r, m) => { onTerminate(rec.id, r, m); setModal(null); }} />}
      {modal === "reassign"  && <ReassignLMModal rec={rec} lmOptions={lmOptions} onClose={() => setModal(null)} onSave={(newLm, reason) => { onReassignLM(rec.id, newLm, reason); setModal(null); }} />}
    </div>
  );
}
