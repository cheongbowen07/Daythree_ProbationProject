import { useState } from "react";
import { ClipboardList, PenLine, Send, CheckCircle2 } from "lucide-react";
import { LM_SELF } from "../../constants";
import { monthFromStatus } from "../../utils/status";
import { Card, PageHead, StatusBadge, Mono, Tag, Btn } from "../ui";
import KpiModal from "../modals/KpiModal";
import ReviewModal from "../modals/ReviewModal";

const LM_OUTCOME_STATUSES = ["LM-Outcome", "LM-Outcome(Acting)", "Ext-LM-Outcome"];

// LM action worklist (S-03) — surfaces the line manager's core procedures
// (KPI setup, monthly reviews, and the final outcome decision) directly from
// the sidebar, instead of opening a case and hunting for buttons.
export default function ReviewQueue({ records, onOpen, onSaveKpis, onRequestKpiUnlock, onSubmitReview, onSaveReviewDraft }) {
  const [form, setForm] = useState(null); // { type: "kpi" | "review", rec }

  const team = records.filter((r) => r.lm === LM_SELF);
  const items = team
    .map((r) => {
      const n = monthFromStatus(r.status);
      if (r.status === "KPI-Review" || r.status === "KPI-Review(Acting)")
        return { r, kind: "kpi",     badge: "KPI setup due",          badgeCls: "bg-violet-50 text-violet-700", btn: "Set KPIs",               icon: ClipboardList };
      if (!!n && /-Review$/.test(r.status))
        return { r, kind: "review",  badge: `Month ${n} review due`,  badgeCls: "bg-amber-50 text-amber-700",   btn: `Submit Month ${n} review`, icon: PenLine, n };
      if (LM_OUTCOME_STATUSES.includes(r.status))
        return { r, kind: "outcome", badge: "Outcome decision due",   badgeCls: "bg-cyan-50 text-cyan-700",     btn: "Record outcome",         icon: Send };
      return null;
    })
    .filter(Boolean);

  function startAction(it) {
    if (it.kind === "kpi")    return setForm({ type: "kpi", rec: it.r });
    if (it.kind === "review") return setForm({ type: "review", rec: it.r });
    if (it.kind === "outcome") return onOpen?.(it.r.id); // opens the case detail (LM outcome panel)
  }

  // Full-page forms (reuse the same components as the case detail).
  if (form?.type === "kpi") {
    return (
      <KpiModal
        page
        rec={form.rec}
        onClose={() => setForm(null)}
        onSave={(k, cycle) => { onSaveKpis(form.rec.id, k, cycle); setForm(null); }}
        onRequestUnlock={onRequestKpiUnlock}
      />
    );
  }
  if (form?.type === "review") {
    const n = monthFromStatus(form.rec.status);
    return (
      <ReviewModal
        page
        rec={form.rec}
        month={n}
        onClose={() => setForm(null)}
        onSaveDraft={(draft) => onSaveReviewDraft?.(form.rec.id, n, draft)}
        onSubmit={(rpm, t, extra) => { onSubmitReview(form.rec.id, rpm, t, extra); setForm(null); }}
      />
    );
  }

  return (
    <div className="fadeUp">
      <PageHead
        code="S-03 · Reviews & KPIs"
        title="Reviews & KPIs"
        sub={`${LM_SELF} · KPI setups and monthly reviews awaiting you across your team.`}
      />

      {items.length === 0 ? (
        <Card className="p-10 grid place-items-center text-center">
          <div className="grid place-items-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 mb-3">
            <CheckCircle2 size={22} />
          </div>
          <div className="text-sm font-semibold text-slate-700">All caught up</div>
          <p className="text-sm text-slate-400 mt-1">No KPI setups or reviews are due for your team right now.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((it) => (
            <Card key={it.r.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="font-medium text-slate-800 flex items-center gap-2">
                  {it.r.name} <Mono className="text-[11px] text-slate-400">{it.r.empId}</Mono>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <StatusBadge status={it.r.status} sm />
                  <Tag className={it.badgeCls}>{it.badge}</Tag>
                </div>
              </div>
              <Btn icon={it.icon} onClick={() => startAction(it)}>{it.btn}</Btn>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
