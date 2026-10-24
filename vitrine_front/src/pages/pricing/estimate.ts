// Mêmes valeurs que plateform_back/src/plans/plans.config.ts (branche feat/billing).
export const SUBSCRIPTION_EUROS = 50;
export const MONTHLY_CREDITS = 50_000;
export const CREDITS_PER_EURO = 1_000;
export const MIN_TOP_UP_EUROS = 5;

/** Coût mensuel hors taxes pour une consommation de crédits : le quota d'abord, puis des recharges. */
export function estimate(credits: number) {
  const extraCredits = Math.max(0, credits - MONTHLY_CREDITS);
  const topUpEuros = extraCredits > 0 ? Math.max(MIN_TOP_UP_EUROS, Math.ceil(extraCredits / CREDITS_PER_EURO)) : 0;
  return {
    included: Math.min(credits, MONTHLY_CREDITS),
    extraCredits,
    topUpEuros,
    total: SUBSCRIPTION_EUROS + topUpEuros,
  };
}

if (import.meta.env.DEV) {
  console.assert(estimate(20_000).total === 50, "le quota couvre 20 000 crédits");
  console.assert(estimate(51_000).topUpEuros === 5, "une petite recharge coûte au moins 5 €");
  console.assert(estimate(80_000).total === 80, "30 000 crédits de plus = 30 €");
}
