import { PlanTier } from 'generated/prisma';

export interface BillingSummary {
    plan: PlanTier;
    planName: string;
    limits: { agents: number; datasets: number };
    usage: { agents: number; datasets: number };
    /** `monthly` is the part of `balance` left from the monthly quota; `purchased` never expires (may be < 0). */
    credits: { balance: number; monthly: number; purchased: number; monthlyQuota: number };
    subscription: { status: string | null; currentPeriodEnd: Date | null; cancelAtPeriodEnd: boolean } | null;
    /** What the subscription offers, for the plans that do not have it yet. */
    subscriptionOffer: { priceCents: number; monthlyCredits: number; maxAgents: number; maxDatasets: number };
    creditsPerEuro: number;
}
