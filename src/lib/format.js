export const fmt = (n) => {
  if (Math.abs(n) >= 1000000) return `€${(n/1000000).toFixed(n % 1000000 === 0 ? 0 : 2)}M`;
  if (Math.abs(n) >= 1000) return `€${Math.round(n/1000)}k`;
  return `€${n}`;
};

export const fmtRange = (low, high) => `${fmt(low)} – ${fmt(high)}`;

export function budgetTotals(items) {
  const one_time = items.filter(i => i.type === 'one_time');
  const annual = items.filter(i => i.type === 'annual');
  const credit = items.filter(i => i.type === 'annual_credit');
  const setupLow = one_time.reduce((s, i) => s + i.low, 0);
  const setupHigh = one_time.reduce((s, i) => s + i.high, 0);
  const annualLow = annual.reduce((s, i) => s + i.low, 0) + credit.reduce((s, i) => s + i.high, 0);
  const annualHigh = annual.reduce((s, i) => s + i.high, 0) + credit.reduce((s, i) => s + i.low, 0);
  return { setupLow, setupHigh, annualLow, annualHigh };
}

export function cardCostTags(measure) {
  const { setupLow, setupHigh, annualLow, annualHigh } = budgetTotals(measure.budget.items);
  const tags = [];
  if (setupLow > 0) tags.push(`${fmt(setupLow)}–${fmt(setupHigh)} one-time`);
  if (annualLow > 0) tags.push(`~${fmt(annualLow)}–${fmt(annualHigh)} / year`);
  return tags;
}

export function summaryCost(measure) {
  const { setupLow, setupHigh, annualLow, annualHigh } = budgetTotals(measure.budget.items);
  const lines = [];
  if (setupLow > 0) lines.push(`${fmt(setupLow)}–${fmt(setupHigh)} one-time`);
  if (annualLow > 0) lines.push(`~${fmt(annualLow)}–${fmt(annualHigh)} / year`);
  return lines;
}
