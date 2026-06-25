export const blankKpi = { name: "", desc: "", target: "", weight: 100 };

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
