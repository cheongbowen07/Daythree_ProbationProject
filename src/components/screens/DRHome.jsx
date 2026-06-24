import { useState, useRef, useEffect } from "react";
import { ChevronDown, PenLine, CheckCircle2, Clock, FileSignature, Bell, AlertTriangle, User } from "lucide-react";
import { TODAY, TONE_CLASS } from "../../constants";
import EmployeeProfile from "../EmployeeProfile";
import { monthFromStatus } from "../../utils/status";
import { Card, Btn, StatusBadge, Tag, Mono, RpmDots } from "../ui";
import LifecycleRail from "../LifecycleRail";

function SignaturePad({ value, onChange }) {
  const canvasRef  = useRef(null);
  const drawingRef = useRef(false);

  function initCanvas(canvas) {
    const rect  = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const ratio = window.devicePixelRatio || 1;
    canvas.width  = Math.floor(rect.width  * ratio);
    canvas.height = Math.floor(rect.height * ratio);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.lineCap     = "round";
    ctx.lineJoin    = "round";
    ctx.lineWidth   = 2.4;
    ctx.strokeStyle = "#4D4D4D";
    ctx.fillStyle   = "#fff";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ro = new ResizeObserver(() => { initCanvas(canvas); });
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

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
    const rect   = canvas.getBoundingClientRect();
    const ctx    = canvas.getContext("2d");
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

const REMINDER_THRESHOLD = 7;

function ReminderBanner({ reminders }) {
  if (!reminders || reminders === 0) return null;
  const daysLeft   = Math.max(0, REMINDER_THRESHOLD - reminders);
  const urgent     = daysLeft <= 2;
  const veryUrgent = daysLeft === 0;

  return (
    <div className={`flex items-start gap-3 rounded-xl px-4 py-3 mb-4 ring-1 ${
      veryUrgent ? "bg-rose-50 ring-rose-200 text-rose-800"
      : urgent   ? "bg-amber-50 ring-amber-200 text-amber-800"
      :            "bg-blue-50 ring-blue-200 text-blue-800"
    }`}>
      <div className="shrink-0 mt-0.5">
        {urgent ? <AlertTriangle size={16} /> : <Bell size={16} />}
      </div>
      <div className="flex-1">
        <div className="text-sm font-semibold">
          {veryUrgent
            ? "Auto-accept will fire on the next reminder cycle"
            : `Reminder ${reminders} of ${REMINDER_THRESHOLD} sent`}
        </div>
        <p className="text-xs mt-0.5 opacity-80">
          {veryUrgent
            ? "You have not acknowledged this review. The system will auto-accept on your behalf and log the actor as System (A-02)."
            : `You have ${daysLeft} day${daysLeft !== 1 ? "s" : ""} remaining to acknowledge before the system auto-accepts (A-02). Daily reminders are being sent via N-04.`}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <div className={`text-lg font-black ${veryUrgent ? "text-rose-600" : urgent ? "text-amber-600" : "text-blue-600"}`}>
          {daysLeft}d
        </div>
        <div className="text-[10px] opacity-60">remaining</div>
      </div>
    </div>
  );
}

function DRAcceptPanel({ rec, onAccept }) {
  const n  = monthFromStatus(rec.status);
  const rv = rec.reviews.find((v) => v.cycle === n);
  const [drComments, setDrComments] = useState("");

  return (
    <div className="p-5 rounded-lg ring-1 brand-card bg-white">
      <div className={`grid place-items-center w-9 h-9 rounded-lg shrink-0 mb-3 ${TONE_CLASS.accept}`}></div>
      <div className="flex items-center gap-2 mb-1">
        <span className="font-semibold text-slate-800">Acknowledge your Month {n} review</span>
        <span className="text-[10px] text-slate-400" style={{ fontFamily: "var(--mono)" }}>S-05 / F-04</span>
      </div>

      <ReminderBanner reminders={rec.reminders} />

      <div className="rounded-lg ring-1 ring-slate-200 bg-slate-50 p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700">Manager assessment</span>
          <RpmDots score={rv ? rv.rpm : 3} />
        </div>
        <p className="text-sm text-slate-500">{rv && rv.rec ? rv.rec : "Performance against your KPIs for this cycle."}</p>
        {rv?.kpiSummary && (
          <p className="text-xs text-slate-400 mt-2 italic border-t border-slate-100 pt-2">KPI summary: {rv.kpiSummary}</p>
        )}
      </div>

      {/* Optional DR comments — S-05 */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1 block">Your comments <span className="font-normal normal-case">(optional)</span></label>
        <textarea
          value={drComments}
          onChange={(e) => setDrComments(e.target.value)}
          rows={2}
          placeholder="Add any remarks before accepting…"
          className="w-full bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-indigo-400 resize-none"
        />
      </div>

      <div className="flex items-center gap-3">
        <Btn icon={CheckCircle2} onClick={() => onAccept(rec.id, rec.name, drComments)}>Accept review</Btn>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Clock size={13} />
          <span>
            {rec.reminders > 0
              ? <><span className="font-medium text-amber-600">{rec.reminders}</span> of {REMINDER_THRESHOLD} daily reminder{rec.reminders !== 1 ? "s" : ""} sent</>
              : "Daily reminders will start after submission"}
          </span>
        </div>
      </div>
    </div>
  );
}

function ESignPanel({ rec, onSign }) {
  const [scrolled, setScrolled]   = useState(false);
  const [ack, setAck]             = useState(false);
  const [method, setMethod]       = useState("typed");
  const [typed, setTyped]         = useState("");
  const [drawn, setDrawn]         = useState(false);
  const [drawnImage, setDrawnImage] = useState("");

  const ready = scrolled && ack && (method === "typed" ? typed.trim().length > 1 : drawn);
  const outcomeLabel = {
    Conf: "Confirmation", EarlyConf: "Early Confirmation", Ext: "Extension",
    NConf: "Non-Confirmation", ActingConf: "Acting Confirmation", ActingNConf: "Acting Non-Confirmation",
  }[rec.outcome] || "Outcome";

  function onScroll(e) {
    const el = e.target;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 12) setScrolled(true);
  }

  return (
    <Card className="p-5 fadeUp">
      <div className="flex items-center gap-2 mb-1">
        <FileSignature size={18} className="text-violet-600" />
        <span className="font-semibold text-slate-800">Sign your probation letter</span>
        <Mono className="text-[10px] text-slate-400">S-10 / F-09 / A-10</Mono>
      </div>
      <p className="text-sm text-slate-500 mb-4">Everything happens inside FAITH — no third-party signing tool. Scroll to the end of the letter to enable signing.</p>

      <div onScroll={onScroll} className="h-56 overflow-y-auto rounded-lg ring-1 ring-slate-200 bg-white p-5 text-sm text-slate-600 leading-relaxed">
        <div className="text-center mb-4">
          <div className="font-semibold text-slate-800">PROBATION OUTCOME — {outcomeLabel.toUpperCase()}</div>
          <Mono className="text-[11px] text-slate-400">{rec.letterId} · {rec.letterType}</Mono>
        </div>
        <p>Dear {rec.name},</p>
        <p className="mt-2">Employee ID: {rec.empId} · Grade: {rec.grade}</p>
        <p className="mt-2">This letter confirms the outcome of your {rec.gradeBand === "M09_M12" ? "six-month" : "three-month"} probation period{rec.acting ? " in your acting assignment" : ""}, following completion of all scheduled monthly performance reviews and your acknowledgements.</p>
        <p className="mt-2">Outcome: <span className="font-medium text-slate-800">{outcomeLabel}</span>, effective {TODAY}.</p>
        <p className="mt-2">
          {rec.outcome === "Ext"        && "Your probation will be extended by a single fixed three-month cycle. A further extension is not available; the subsequent outcome will be confirmation or non-confirmation only."}
          {rec.outcome === "NConf"      && "Your employment will not be confirmed. Please refer to the notice and final working day clauses below. This outcome has been subject to mandatory legal review."}
          {["Conf", "EarlyConf"].includes(rec.outcome) && "We are pleased to confirm your employment. Your status in FAITH will update automatically upon signing."}
          {rec.outcome === "ActingConf"  && "Your acting role is confirmed. Rewards will action your salary review and new-role benefits."}
          {rec.outcome === "ActingNConf" && "Your acting assignment will not be confirmed. You will revert to your previous role and the acting allowance will stop immediately."}
        </p>
        <p className="mt-2 text-slate-400">By signing below you acknowledge that you have read and understood this letter in full. A completion record — timestamp, employee ID, letter version, and IP address — will be captured for compliance.</p>
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
          <span className="text-sm text-slate-700">I confirm I have read and understood the full letter.</span>
        </label>
        <div className="flex gap-2">
          {[["typed", "Type name"], ["drawn", "Draw signature"]].map(([m, l]) => (
            <button key={m} onClick={() => setMethod(m)} className={`text-xs px-3 py-1.5 rounded-lg ring-1 ${method === m ? "bg-violet-50 ring-violet-300 text-violet-700" : "ring-slate-200 text-slate-600"}`}>{l}</button>
          ))}
        </div>
        {method === "typed" ? (
          <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type your full name" className="w-full text-sm rounded-lg ring-1 ring-slate-200 px-3 py-2 outline-none focus:ring-violet-400" style={{ fontFamily: "'Brush Script MT', cursive", fontSize: "18px" }} />
        ) : (
          <SignaturePad value={drawnImage} onChange={(image, hasInk) => { setDrawnImage(image); setDrawn(hasInk); }} />
        )}
        <Btn icon={FileSignature} disabled={!ready} onClick={() => onSign(rec.id, { method, typed, image: drawnImage })}>
          Sign & acknowledge
        </Btn>
      </div>
    </Card>
  );
}

export default function DRHome({ records, asDr, setAsDr, onAccept, onSign, onUpdateProfile }) {
  const [tab, setTab] = useState("probation");
  const rec       = records.find((r) => r.id === asDr) || records[0];
  const acceptDue = /-DR-Acpt$/.test(rec.status);
  const signDue   = /Sign-Off$/.test(rec.status);
  const drsWithAction = records.filter((r) => /-DR-Acpt$/.test(r.status) || /Sign-Off$/.test(r.status));

  return (
    <div className="fadeUp">
      <div className="mb-5 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <Mono className="text-[11px] font-semibold tracking-wide text-[#C8102E] bg-[#FCD9D9] px-1.5 py-0.5 rounded ring-1 ring-[#F5A5A5]">S-04 · MyProb</Mono>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#4D4D4D] mt-1.5">My Probation</h1>
          <p className="text-sm text-[#6E6E6E] mt-0.5 max-w-2xl">Direct reports see only their own record (A-08). Use the selector to step into any employee for this demo.</p>
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
        <div>
          <h2 className="text-xl font-semibold text-slate-900">{rec.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Mono className="text-xs text-slate-400">{rec.empId}</Mono>
            <Tag className="bg-slate-100 text-slate-600">{rec.grade}</Tag>
            <StatusBadge status={rec.status} sm />
          </div>
        </div>
        <div className="text-right text-sm">
          <div className="text-slate-400 text-xs">Employment status</div>
          <div className="font-semibold text-slate-800">{rec.employmentStatus}</div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-5 border-b border-slate-200">
        {[["probation", "My Probation"], ["profile", "My Profile"]].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${tab === key ? "border-violet-500 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === "profile" && (
        <EmployeeProfile rec={rec} editable onSaveProfile={onUpdateProfile} />
      )}

      {tab === "probation" && (
        <>
          <Card className="px-5 py-4 mb-5"><LifecycleRail rec={rec} /></Card>

          {acceptDue && <DRAcceptPanel rec={rec} onAccept={onAccept} />}
          {signDue   && <ESignPanel rec={rec} onSign={onSign} />}

          {!acceptDue && !signDue && (
            <div className="grid sm:grid-cols-2 gap-5">
              <Card className="p-5">
                <div className="text-sm font-semibold text-slate-800 mb-3">KPIs & targets</div>
                {rec.kpis.length > 0 ? (
                  <div className="space-y-3">
                    {rec.kpis.map((k, i) => (
                      <div key={i} className="flex items-start justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                        <div>
                          <div className="text-sm font-medium text-slate-700">{k.name}</div>
                          {k.desc && <div className="text-xs text-slate-400 mt-0.5">{k.desc}</div>}
                          {k.target && <div className="text-xs text-slate-500 mt-0.5">Target: {k.target}</div>}
                        </div>
                        <Tag className="bg-cyan-50 text-cyan-700 shrink-0">{k.weight}%</Tag>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Awaiting KPI setup by your manager.</p>
                )}
              </Card>
              <Card className="p-5">
                <div className="text-sm font-semibold text-slate-800 mb-3">Review history</div>
                {rec.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {[...rec.reviews].sort((a, b) => a.cycle - b.cycle).map((rv) => (
                      <div key={rv.cycle} className="py-2 border-b border-slate-50 last:border-0">
                        <div className="flex items-center gap-3 mb-1">
                          <Tag className="bg-slate-100 text-slate-600 shrink-0">Month {rv.cycle}</Tag>
                          <RpmDots score={rv.rpm} />
                          {rv.reviewDate && <span className="text-xs text-slate-400 ml-auto">{rv.reviewDate}</span>}
                        </div>
                        {rv.rec && <p className="text-xs text-slate-500 mt-1">{rv.rec}</p>}
                        {rv.kpiSummary && <p className="text-xs text-slate-400 mt-1 italic">KPI summary: {rv.kpiSummary}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No reviews yet.</p>
                )}
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
