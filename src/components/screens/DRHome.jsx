import { useState } from "react";
import { ChevronDown, ChevronRight, PenLine, CheckCircle2, Clock, FileSignature, Bell, AlertTriangle } from "lucide-react";
import { TODAY, OUTCOME_LABEL } from "../../constants";
import EmployeeProfile from "../EmployeeProfile";
import { monthFromStatus } from "../../utils/status";
import { sortedReviews, reviewLabel, reviewKey, extensionCycles } from "../../utils/lifecycle";
import { kpisForCycle, kpiTargetLabel, kpiAchievementPct } from "../../utils/kpi";
import { Card, Btn, StatusBadge, Tag, Mono, RpmDots } from "../ui";
import LifecycleRail from "../LifecycleRail";
import { Modal } from "../modals/Modal";


const REMINDER_THRESHOLD = 7;

function ReminderBanner({ reminders }) {
  if (!reminders || reminders === 0) return null;
  const daysLeft   = Math.max(0, REMINDER_THRESHOLD - reminders);
  const urgent     = daysLeft <= 2;
  const veryUrgent = daysLeft === 0;

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium rounded-full px-2.5 py-1 ring-1 ${
      veryUrgent ? "bg-rose-50 ring-rose-200 text-rose-700"
      : urgent   ? "bg-amber-50 ring-amber-200 text-amber-700"
      :            "bg-blue-50 ring-blue-200 text-blue-700"
    }`}>
      {urgent ? <AlertTriangle size={11} /> : <Bell size={11} />}
      {veryUrgent
        ? "Auto-accept imminent"
        : `Reminder ${reminders} of ${REMINDER_THRESHOLD} · You have ${daysLeft} day${daysLeft !== 1 ? "s" : ""} before auto-accept`}
    </span>
  );
}

function DRAcceptPanel({ rec, onAccept }) {
  const n   = monthFromStatus(rec.status);
  const ext = rec.phase === "EXT";
  const rv  = rec.reviews.find((v) => v.cycle === n && (v.phase === "EXT") === ext);

  return (
    <div className="p-5 rounded-lg ring-1 brand-card bg-white">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="font-semibold text-slate-800">Acknowledge your Month {n} review</span>
        {/* reference code hidden — S-05 / F-04 */}
        <ReminderBanner reminders={rec.reminders} />
      </div>

      <div className="rounded-lg ring-1 ring-slate-200 bg-slate-50 p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Manager assessment</span>
          <RpmDots score={rv ? rv.rpm : 6} />
        </div>
        {rv?.kpisChanged && (
          <div className="mb-3 rounded-lg bg-cyan-50 ring-1 ring-cyan-100 px-3 py-2 text-xs text-cyan-800">
            Your manager updated this month's KPI targets before submitting the review.
          </div>
        )}
        <p className="text-sm text-slate-500">{rv && rv.rec ? rv.rec : "Performance against your KPIs for this cycle."}</p>
      </div>

      <div className="flex items-center gap-3 mt-4">
        <Btn icon={CheckCircle2} onClick={() => onAccept(rec.id, rec.name)}>Accept review</Btn>
      </div>
    </div>
  );
}

function ESignPanel({ rec, onSign, onClose }) {
  const [scrolled, setScrolled] = useState(false);
  const [ack, setAck]           = useState(false);

  const outcomeLabel = OUTCOME_LABEL[rec.outcome] || "Outcome";
  const duration     = rec.gradeBand === "M09_M12" ? "six-month" : "three-month";

  function onScroll(e) {
    const el = e.target;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 12) setScrolled(true);
  }

  return (
    <Modal page title="Acknowledge your probation letter" code="S-10 / F-09 / A-10" onClose={onClose}>
      <p className="text-sm text-slate-500 mb-4">Scroll to the end of the letter, then confirm acknowledgement. Your digital footprint (timestamp, employee ID, letter version) will be captured for compliance.</p>

      <div onScroll={onScroll} className="h-[55vh] overflow-y-auto rounded-lg ring-1 ring-slate-200 bg-white p-6 text-sm text-slate-600 leading-relaxed">
        {/* Letterhead */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3 mb-4">
          <div>
            <div className="font-bold text-slate-800 tracking-tight">FAITH · Daythree</div>
            <div className="text-[11px] text-slate-400">Human Resources · People &amp; Culture</div>
          </div>
          <div className="text-right">
            <Mono className="block text-[11px] text-slate-400">{rec.letterId} · {rec.letterType}</Mono>
            <span className="text-[11px] text-slate-400">{TODAY}</span>
          </div>
        </div>

        <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-600 mb-4">Private &amp; Confidential</div>

        <p>Dear {rec.name},</p>

        <p className="mt-3 font-semibold text-slate-800">RE: OUTCOME OF YOUR PROBATIONARY PERIOD — {outcomeLabel.toUpperCase()}</p>
        <p className="mt-1 text-[12px] text-slate-500">
          Employee ID: {rec.empId}&nbsp; ·&nbsp; Grade: {rec.grade}
          {rec.dept ? <>&nbsp; ·&nbsp; Department: {rec.dept}</> : null}
          {rec.position ? <>&nbsp; ·&nbsp; {rec.position}</> : null}
        </p>

        <p className="mt-4">
          We refer to your appointment with the organisation and to the {duration} probationary period applicable to your
          {rec.acting ? " acting assignment" : " role"}, during which your performance, conduct and overall suitability for
          confirmation have been formally assessed across each scheduled monthly review cycle.
        </p>

        <p className="mt-3">
          Following the completion of all scheduled performance reviews, the acknowledgements recorded by you at each cycle, and
          the recommendation of your Line Manager — subsequently reviewed and endorsed by the HR Business Partner — a formal
          decision has now been reached in respect of your probation.
        </p>

        <p className="mt-3">
          We write to confirm that the outcome of your probation is <span className="font-medium text-slate-800">{outcomeLabel}</span>,
          taking effect on <span className="font-medium text-slate-800">{TODAY}</span>.
        </p>

        <p className="mt-3">
          {rec.outcome === "Ext" && `Your probationary period will be extended by a single fixed ${extensionCycles(rec) === 1 ? "one-month" : "three-month"} cycle, commencing on the effective date above. This is a final extension: no further extension is available, and the subsequent outcome will be limited to confirmation or non-confirmation. You are expected to meet the performance objectives agreed with your Line Manager for the extended period, and the same monthly review and acknowledgement process will continue to apply throughout.`}
          {rec.outcome === "NConf" && "Following a thorough assessment and the completion of mandatory legal review, the organisation has determined that your employment will not be confirmed. Your employment will accordingly conclude in line with the notice provisions of your contract and prevailing statutory requirements. Details of your final working day, the return of company property, and the settlement of any outstanding entitlements will be communicated to you separately by the Human Resources team."}
          {["Conf", "EarlyConf"].includes(rec.outcome) && `We are pleased to confirm your employment with the organisation${rec.outcome === "EarlyConf" ? ", ahead of the standard probation period in recognition of your strong and consistent performance" : ""}. Your existing terms and conditions of employment continue to apply, and your employment status will be updated automatically within FAITH upon your acknowledgement of this letter. On behalf of the organisation, we congratulate you and look forward to your continued contribution.`}
          {rec.outcome === "ActingConf" && "We are pleased to confirm your appointment to the acting role on a substantive basis. The Rewards team will action the associated salary review and any role-based benefits, and your records will be updated accordingly. We thank you for your performance and commitment throughout the acting assignment."}
          {rec.outcome === "ActingNConf" && "Following assessment of your acting assignment, the organisation has determined that the acting appointment will not be confirmed. You will revert to your previous role with effect from the date above, and the acting allowance will cease accordingly. This outcome does not affect your substantive employment, and your Line Manager will discuss the next steps with you directly."}
        </p>

        <p className="mt-3">
          This letter is issued to you through the FAITH platform. By confirming your acknowledgement below, you certify that you
          have read and understood this letter in full. Your digital footprint — including the date and time of acknowledgement,
          your employee identifier and the letter version — will be captured and retained as part of your employment record in
          accordance with company policy and applicable data-retention requirements.
        </p>

        <p className="mt-3">
          Should you have any questions regarding this outcome, or require any further clarification, please contact your HR
          Business Partner in the first instance.
        </p>

        <p className="mt-4">Yours sincerely,</p>
        <p className="mt-3 font-medium text-slate-700">Human Resources</p>
        <p className="text-[12px] text-slate-400">People &amp; Culture · FAITH · Daythree</p>

        <p className="mt-6 text-slate-400 text-xs">— End of letter —</p>
      </div>

      {!scrolled && (
        <div className="mt-2 text-xs text-amber-600 flex items-center gap-1.5">
          <ChevronDown size={13} /> Scroll to the bottom of the letter to continue.
        </div>
      )}

      <div className={`mt-4 space-y-3 transition ${scrolled ? "" : "opacity-40 pointer-events-none"}`}>
        <label className="flex items-start gap-2.5 cursor-pointer">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="mt-0.5" />
          <span className="text-sm text-slate-700">I confirm I have read and understood this letter in full.</span>
        </label>
        <Btn icon={FileSignature} disabled={!scrolled || !ack} onClick={() => onSign(rec.id, { method: "digital-footprint" })}>
          Confirm acknowledgement
        </Btn>
      </div>
    </Modal>
  );
}

function LetterStatusCard({ rec }) {
  if (!rec.outcome) return (
    <Card className="p-5">
      <div className="text-sm font-semibold text-slate-800 mb-1">Letter status</div>
      <p className="text-sm text-slate-400">No outcome letter has been generated yet.</p>
    </Card>
  );
  // A letter counts as signed once its completion record matches the current
  // letter — this also covers the extension letter (LT-02), which is signed but
  // leaves the record in Ext-Mth1-Review rather than a terminal Complete-* state.
  const signed = !!(rec.completion && rec.completion.letterId === rec.letterId);
  return (
    <Card className="p-5">
      <div className="text-sm font-semibold text-slate-800 mb-3">Letter status</div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-slate-500">Outcome</span><span className="font-medium text-slate-800">{OUTCOME_LABEL[rec.outcome] || rec.outcome}</span></div>
        {rec.letterId && <div className="flex justify-between"><span className="text-slate-500">Letter ID</span><Mono className="text-xs text-slate-600">{rec.letterId}</Mono></div>}
        {rec.letterType && <div className="flex justify-between"><span className="text-slate-500">Letter type</span><Mono className="text-xs text-slate-600">{rec.letterType}</Mono></div>}
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Signature</span>
          {signed
            ? <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"><CheckCircle2 size={13} /> Signed</span>
            : rec.letterId
              ? <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600"><Clock size={13} /> Not Signed Yet</span>
              : <span className="text-xs text-slate-400">Not Signed Yet</span>}
        </div>
      </div>
    </Card>
  );
}

// Expandable review-history row — collapsed shows the cycle + rating; expanding
// reveals each KPI's actual vs target and achievement %.
function HistoryReviewRow({ rv, kpis }) {
  const [open, setOpen] = useState(false);
  const canExpand = kpis.length > 0;
  return (
    <div className="py-2 border-b border-slate-50 last:border-0">
      <div
        className={`flex items-center gap-2.5 ${canExpand ? "cursor-pointer hover:bg-slate-50/60 rounded-lg px-1.5 -mx-1.5" : ""}`}
        onClick={() => canExpand && setOpen((v) => !v)}
      >
        {canExpand
          ? <span className="text-slate-400 shrink-0">{open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
          : <span className="w-3.5 shrink-0" />}
        <Tag className="bg-slate-100 text-slate-600 shrink-0">{reviewLabel(rv)}</Tag>
        <RpmDots score={rv.rpm} />
        {rv.reviewDate && <span className="text-xs text-slate-400 ml-auto">{rv.reviewDate}</span>}
      </div>
      {rv.rec && <p className="text-xs text-slate-500 mt-1 ml-6">{rv.rec}</p>}
      {open && (
        <div className="mt-2 ml-6 rounded-lg bg-slate-50 ring-1 ring-slate-100 p-3 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">KPI achievement this cycle</div>
          {kpis.map((k, i) => {
            const hasActual = k.actual != null && Number(k.target) > 0;
            const pct = Math.round(kpiAchievementPct(k));
            return (
              <div key={i} className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-700">{k.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {hasActual ? <>{k.actual} / {kpiTargetLabel(k)} · <span className={pct >= 60 ? "text-emerald-600" : "text-amber-600"}>{pct}%</span></> : kpiTargetLabel(k)}
                  </div>
                </div>
                <Tag className="bg-cyan-50 text-cyan-700 shrink-0 text-[11px]">{k.weight}%</Tag>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DRHome({ records, asDr, setAsDr, onAccept, onSign, onUpdateProfile }) {
  const [tab, setTab] = useState("overview");
  const rec       = records.find((r) => r.id === asDr) || records[0];
  const acceptDue = /-DR-Acpt$/.test(rec.status);
  const signDue   = /Sign-Off$/.test(rec.status);
  const drsWithAction = records.filter((r) => /-DR-Acpt$/.test(r.status) || /Sign-Off$/.test(r.status));
  const duration  = rec.gradeBand === "M09_M12" ? "6 months" : "3 months";
  const cycles    = rec.gradeBand === "M09_M12" ? 6 : 3;
  const currentKpiCycle = rec.currentCycle || 1;
  const currentKpis = kpisForCycle(rec, currentKpiCycle);

  const TABS = [
    ["overview",  "Status Overview"],
    ["kpi",       "KPI & Targets"],
    ["history",   "Review History"],
    ["letter",    "Letter"],
    ["profile",   "My Profile"],
  ];

  return (
    <div className="fadeUp">
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          {/* reference code hidden — S-04 · MyProb */}
          <h1 className="text-[22px] font-semibold tracking-tight text-[#4D4D4D]">My Probation</h1>
          <p className="text-sm text-[#6E6E6E] mt-0.5 max-w-2xl">Direct reports see only their own record. Use the selector to step into any employee for this demo.</p>
        </div>
        <div className="relative">
          <select value={asDr} onChange={(e) => setAsDr(Number(e.target.value))} className="appearance-none text-sm bg-white ring-1 ring-slate-200 rounded-lg pl-3 pr-9 py-2 outline-none">
            {records.map((r) => <option key={r.id} value={r.id}>{r.name} — {r.empId}</option>)}
          </select>
          <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {drsWithAction.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          <span className="text-xs text-slate-400 self-center">Needs action:</span>
          {drsWithAction.map((r) => (
            <button key={r.id} onClick={() => setAsDr(r.id)} className={`text-xs px-2.5 py-1 rounded-full ring-1 flex items-center gap-1.5 ${r.id === asDr ? "bg-cyan-50 ring-cyan-300 text-cyan-700" : "bg-white ring-slate-200 text-slate-600 hover:bg-slate-50"}`}>
              {r.name.split(" ")[0]} · {/Sign-Off$/.test(r.status) ? "sign" : "accept"}
              {(r.reminders > 0) && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${r.reminders >= REMINDER_THRESHOLD - 1 ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-700"}`}>
                  {r.reminders}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-xl font-semibold text-slate-900">{rec.name}</h2>
          <Mono className="text-xs text-slate-400">{rec.empId}</Mono>
          <StatusBadge status={rec.status} sm />
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-5 border-b border-slate-200 overflow-x-auto">
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition whitespace-nowrap ${tab === key ? "border-violet-500 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {label}
            {key === "letter" && signDue && (
              <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        ))}
      </div>

      {tab === "profile" && <EmployeeProfile rec={rec} editable onSaveProfile={onUpdateProfile} showContact={false} showCompliance={false} showReviewHistory={false} />}

      {tab === "overview" && (
        <>
          {/* Key info grid */}
          <Card className="px-5 py-4 mb-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-4">
              <div><div className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Probation type</div><div className="font-medium text-slate-800">{rec.employmentStatus}</div></div>
              <div><div className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Start date</div><div className="font-medium text-slate-800">{rec.joined}</div></div>
              <div><div className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Grade</div><div className="font-medium text-slate-800">{rec.grade}</div></div>
              <div><div className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Duration</div><div className="font-medium text-slate-800">{duration}</div></div>
              <div><div className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Total cycles</div><div className="font-medium text-slate-800">{cycles} reviews</div></div>
              <div><div className="text-xs text-slate-400 uppercase tracking-wider mb-0.5">Current cycle</div><div className="font-medium text-slate-800">{rec.currentCycle || 0} of {cycles}</div></div>
            </div>
            <LifecycleRail rec={rec} />
          </Card>

          {acceptDue && <DRAcceptPanel rec={rec} onAccept={onAccept} />}
          {signDue && (
            <div className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 ring-1 bg-violet-50 ring-violet-200 text-violet-800">
              <div className="flex items-center gap-2.5">
                <FileSignature size={16} className="shrink-0" />
                <div>
                  <div className="text-sm font-semibold">Action required — letter pending acknowledgement</div>
                  <div className="text-xs opacity-70 mt-0.5">Go to the Letter tab to read and confirm your probation letter.</div>
                </div>
              </div>
              <button onClick={() => setTab("letter")} className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition">
                Go to Letter
              </button>
            </div>
          )}

        </>
      )}

      {tab === "kpi" && (
        <Card className="p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-sm font-semibold text-slate-800">KPIs & targets</div>
            <Tag className="bg-slate-100 text-slate-600">Month {currentKpiCycle}</Tag>
          </div>
          {currentKpis.length > 0 ? (
            <div className="space-y-3">
              {currentKpis.map((k, i) => (
                <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <div className="text-sm font-medium text-slate-700">{k.name}</div>
                    {k.desc && <div className="text-xs text-slate-400 mt-0.5">{k.desc}</div>}
                    {Number(k.target) > 0 && <div className="text-xs text-slate-500 mt-0.5">Target: {kpiTargetLabel(k)}</div>}
                  </div>
                  <Tag className="bg-cyan-50 text-cyan-700 shrink-0">{k.weight}%</Tag>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">Awaiting KPI setup by your manager.</p>
          )}
        </Card>
      )}

      {tab === "history" && (
        <Card className="p-5">
          <div className="text-sm font-semibold text-slate-800 mb-3">Review history</div>
          {rec.reviews.length > 0 ? (() => {
            const all  = sortedReviews(rec.reviews);
            const base = all.filter((rv) => rv.phase !== "EXT");
            const ext  = all.filter((rv) => rv.phase === "EXT");
            const renderRow = (rv) => (
              <HistoryReviewRow key={reviewKey(rv)} rv={rv} kpis={rv.kpisSnapshot || kpisForCycle(rec, rv.cycle)} />
            );
            // No extension yet → keep a single flat list.
            if (ext.length === 0) return <div className="space-y-3">{base.map(renderRow)}</div>;
            // Extension in progress → group each cycle's months under a heading.
            return (
              <div className="space-y-5">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Probation</div>
                  <div className="space-y-3">{base.map(renderRow)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mb-2">Extension</div>
                  <div className="space-y-3">{ext.map(renderRow)}</div>
                </div>
              </div>
            );
          })() : (
            <p className="text-sm text-slate-400">No reviews yet.</p>
          )}
        </Card>
      )}

      {tab === "letter" && (
        signDue
          ? <ESignPanel rec={rec} onSign={onSign} onClose={() => setTab("overview")} />
          : <LetterStatusCard rec={rec} />
      )}
    </div>
  );
}
