import { useState } from "react";
import {
  User, Mail, Phone, Briefcase, Building2, Calendar, Shield,
  CheckCircle2, AlertTriangle, Clock, Edit2, Tag as TagIcon, Fingerprint, FileText,
  ChevronRight, ChevronDown,
} from "lucide-react";
import { Card, Mono, Tag, Btn, RpmDots } from "./ui";
import { totalCycles, daysCap } from "../utils/lifecycle";
import { kpisForCycle } from "../utils/kpi";
import { statusLabel } from "../utils/status";
import { OUTCOME_LABEL } from "../constants";
import ProfileEditModal from "./modals/ProfileEditModal";

const EMP_STATUS_STYLE = {
  "Confirmed":               "bg-emerald-50 text-emerald-800 ring-emerald-200",
  "Confirmed (acting role)": "bg-emerald-50 text-emerald-800 ring-emerald-200",
  "Not Confirmed":           "bg-rose-50    text-rose-800   ring-rose-200",
  "Probation (ended)":       "bg-slate-100  text-slate-600  ring-slate-200",
  "Probation":               "bg-amber-50   text-amber-800  ring-amber-200",
  "Probation (extended)":    "bg-orange-50  text-orange-800 ring-orange-200",
  "Acting probation":        "bg-violet-50  text-violet-800 ring-violet-200",
  "Reverted to previous role · allowance stopped": "bg-slate-100 text-slate-600 ring-slate-200",
};
const EMP_STATUS_ICON = {
  "Confirmed":               CheckCircle2,
  "Confirmed (acting role)": CheckCircle2,
  "Not Confirmed":           AlertTriangle,
  "Probation (ended)":       AlertTriangle,
};
function F({ label, value, mono, children }) {
  const content = children ?? value;
  if (!content && content !== 0) return null;
  return (
    <div>
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{label}</div>
      {mono
        ? <Mono className="text-sm text-slate-700">{content}</Mono>
        : typeof content === "string"
          ? <div className="text-sm text-slate-700">{content}</div>
          : content}
    </div>
  );
}

function CardSection({ title, children, action, className = "", compact = false }) {
  return (
    <Card className={`${compact ? "p-3" : "p-4"} ${className}`}>
      <div className={`flex items-center justify-between ${compact ? "mb-2" : "mb-3"}`}>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
        {action}
      </div>
      <div className={compact ? "space-y-2" : "space-y-3"}>
        {children}
      </div>
    </Card>
  );
}

function ProfileReviewRow({ rv, kpis }) {
  const [open, setOpen] = useState(false);
  const canExpand = kpis.length > 0;
  return (
    <div className="border-b border-slate-50 last:border-0">
      <div
        className={`flex items-center gap-2 py-2 text-sm ${canExpand ? "cursor-pointer hover:bg-slate-50/60 rounded-lg px-1.5 -mx-1.5" : ""}`}
        onClick={() => canExpand && setOpen((v) => !v)}
      >
        {canExpand
          ? <span className="text-slate-400 shrink-0">{open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</span>
          : <span className="w-3.5 shrink-0" />}
        <Tag className="bg-slate-100 text-slate-600 text-xs shrink-0">Month {rv.cycle}</Tag>
        <div className="shrink-0"><RpmDots score={rv.rpm} /></div>
        {rv.rec && <span className="text-xs text-slate-400 truncate">{rv.rec}</span>}
      </div>
      {canExpand && open && (
        <div className="mx-1.5 mb-2 rounded-lg bg-slate-50 ring-1 ring-slate-100 p-3 space-y-2">
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

export default function EmployeeProfile({ rec, editable, onSaveProfile, compact = false }) {
  const [showEdit, setShowEdit] = useState(false);

  const isTerminated = rec.status === "Terminated";

  return (
    <div className={compact ? "space-y-3" : "space-y-4"}>

      {/* ── Main grid: left + right columns ── */}
      <div className={`grid md:grid-cols-2 ${compact ? "gap-3" : "gap-4"}`}>

        {/* ── LEFT COLUMN ── */}
        <div className={compact ? "space-y-3" : "space-y-4"}>

          <CardSection
            title="Contact"
            compact={compact}
            action={editable && (
              <Btn size="sm" variant="ghost" icon={Edit2} onClick={() => setShowEdit(true)} className="text-xs -my-1 -mr-1">Edit</Btn>
            )}
          >
            <F label="Full name"   value={rec.name} />
            <F label="Employee ID" value={rec.empId} mono />
            <F label="Work email"  value={rec.email || "—"} />
            <F label="Phone"       value={rec.phone || "—"} />
            <F label="Date joined" value={rec.joined} />
          </CardSection>

          <CardSection title="Role & placement" compact={compact}>
            <F label="Position"    value={rec.position || "—"} />
            <F label="Grade"       value={rec.grade} />
            <F label="Department"  value={rec.dept || "—"} />
            <F label="Line manager" value={rec.lm} />
            {rec.acting && (
              <>
                <F label="Acting grade" value={rec.acting.grade} />
                <F label="Allowance"    value={rec.acting.allowance} />
                <F label="Acting since" value={rec.acting.start} />
              </>
            )}
          </CardSection>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className={compact ? "space-y-3" : "space-y-4"}>

          <CardSection title="Probation progress" compact={compact}>
            <F label="Workflow" value={rec.wf === "WF2" ? "WF2 · Acting-role" : "WF1 · New-hire"} />
            <F label="Cycle"    value={`${rec.currentCycle || 0} of ${rec.phase === "EXT" ? 3 : totalCycles(rec)}${rec.phase === "EXT" ? " (ext)" : ""}`} />
            <F label="Day"      value={`Day ${rec.day} of ${daysCap(rec)}`} />
            <F label="Status"   value={statusLabel(rec.status).replace(/^Probation –\s*/, "").replace(/^Extension –\s*/, "Ext – ").replace(/\s*–\s*(Confirmed|Non-Confirmed)$/, "")} mono />
            {rec.terminationReason && <F label="Termination" value={rec.terminationReason} />}
          </CardSection>

          {/* Review history */}
          {rec.reviews?.length > 0 && (
            <Card className={`${compact ? "p-3" : "p-4"} overflow-hidden`}>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Review history</div>
              <div className="space-y-0">
                {[...rec.reviews].sort((a, b) => a.cycle - b.cycle).map((rv) => (
                  <ProfileReviewRow key={rv.cycle} rv={rv} kpis={rv.kpisSnapshot || kpisForCycle(rec, rv.cycle)} />
                ))}
              </div>
            </Card>
          )}

          <Card className={compact ? "p-3" : "p-4"}>
            <div className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest ${compact ? "mb-3" : "mb-4"}`}>Compliance record</div>
            {rec.completion ? (
              <>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-100 rounded-lg px-2.5 py-1.5 mb-4">
                  <CheckCircle2 size={12} /> Signed · immutable record
                </div>
                <div className="space-y-3">
                  <F label="Letter ID" value={rec.completion.letterId} mono />
                  <F label="Signed by" value={rec.completion.empName} />
                  <F label="Signed at" value={rec.completion.ts} />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 py-3">
                <div className={`grid place-items-center w-9 h-9 rounded-full shrink-0 ${isTerminated ? "bg-slate-100 text-slate-400" : "bg-amber-50 text-amber-500"}`}>
                  {isTerminated ? <AlertTriangle size={16} /> : <Clock size={16} />}
                </div>
                <p className="text-sm text-slate-400">
                  {isTerminated ? "Terminated — no letter signed." : rec.letterId ? "Not Signed Yet." : "Awaiting letter generation."}
                </p>
              </div>
            )}
            {rec.hrbpAckRemarks && (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">HRBP remarks</div>
                <p className="text-xs text-slate-600 italic">"{rec.hrbpAckRemarks}"</p>
              </div>
            )}
          </Card>

        </div>
      </div>

      {showEdit && (
        <ProfileEditModal
          rec={rec}
          onClose={() => setShowEdit(false)}
          onSave={(updates) => { onSaveProfile?.(rec.id, updates); setShowEdit(false); }}
        />
      )}
    </div>
  );
}
