export const blankKpi = { name: "", desc: "", target: 0, unit: "", actual: 0, weight: 100 };

// ── RPM scale ──────────────────────────────────────────────────────────────
// RPM is NOT chosen by the LM. It is derived automatically from how much of each
// SMART/discrete KPI the direct report actually achieved (actual ÷ target,
// capped at 100%), combined by KPI weight, then narrowed to a 1–10 score.
export const RPM_MAX   = 10;
export const RPM_MEETS = 6; // score ≥ this = meets expectations

// Achievement for a single KPI as a 0–100% value (over-achievement capped).
export function kpiAchievementPct(k) {
  const target = Number(k?.target) || 0;
  const actual = Number(k?.actual) || 0;
  if (target <= 0) return 0;
  return Math.min(actual / target, 1) * 100;
}

// Weight-normalised overall achievement across a cycle's KPIs (0–100%).
export function overallAchievementPct(kpis = []) {
  const totalW = kpis.reduce((s, k) => s + (Number(k.weight) || 0), 0);
  if (!kpis.length || totalW <= 0) return 0;
  const weighted = kpis.reduce((s, k) => s + (Number(k.weight) || 0) * kpiAchievementPct(k), 0);
  return weighted / totalW;
}

// Map an overall achievement % to the 1–10 RPM scale (rounded to 1 decimal place).
export function rpmFromAchievement(pct) {
  return Math.max(1, Math.round((pct / 100) * RPM_MAX * 10) / 10);
}

// Convenience: compute the RPM directly from a cycle's KPIs (with actuals).
export function computeRpm(kpis = []) {
  return rpmFromAchievement(overallAchievementPct(kpis));
}

// Display label for a KPI target, e.g. "200 calls".
export function kpiTargetLabel(k) {
  if (k?.target === "" || k?.target == null) return "—";
  return `${k.target}${k.unit ? ` ${k.unit}` : ""}`;
}

export function cloneKpis(kpis = []) {
  return kpis.map((k) => ({ ...k }));
}

export function kpisForCycle(rec, cycle) {
  const monthly = rec.monthlyKpis?.[cycle] || rec.monthlyKpis?.[String(cycle)];
  if (monthly?.length) return monthly;
  return rec.kpis || [];
}

export function editableKpisForCycle(rec, cycle) {
  const existing = kpisForCycle(rec, cycle);
  return existing.length ? cloneKpis(existing) : [{ ...blankKpi }];
}
