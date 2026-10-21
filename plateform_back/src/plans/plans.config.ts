import { PlanTier } from 'generated/prisma';

export interface PlanConfig {
    displayName: string;
    /** Granted once, when the workspace gets the plan; never expires. */
    initialCredits: number;
    /** Quota replaced at each paid invoice; spent before the other credits. */
    monthlyCredits: number;
    maxAgents: number;
    maxDatasets: number;
}

export const PLANS: Record<PlanTier, PlanConfig> = {
    [PlanTier.NONE]: {
        displayName: 'Aucun',
        initialCredits: 0,
        monthlyCredits: 0,
        maxAgents: 0,
        maxDatasets: 0,
    },
    [PlanTier.FREE]: {
        displayName: 'Découverte',
        initialCredits: 5_000,
        monthlyCredits: 0,
        maxAgents: 1,
        maxDatasets: 2,
    },
    [PlanTier.PRO]: {
        displayName: 'Abonnement',
        initialCredits: 0,
        monthlyCredits: 50_000,
        maxAgents: 10,
        maxDatasets: 25,
    },
};

export const SUBSCRIPTION_PRICE_CENTS = 5_000;
/** Top-ups are sold at the subscription's rate: 50 € for 50 000 credits. */
export const CREDITS_PER_EURO = 1_000;
export const MIN_TOP_UP_EUROS = 5;
export const MAX_TOP_UP_EUROS = 1_000;

export function getPlanConfig(plan: PlanTier): PlanConfig {
    return PLANS[plan];
}

/** Découverte is invitation only in production (`DISCOVERY_EMAILS`); every new workspace gets it elsewhere. */
export function initialPlanFor(
    email: string,
    {
        isProduction,
        discoveryEmails,
    }: {
        isProduction: boolean;
        discoveryEmails: string[];
    },
): PlanTier {
    if (!isProduction) return PlanTier.FREE;
    return discoveryEmails.includes(email.trim().toLowerCase()) ? PlanTier.FREE : PlanTier.NONE;
}

export function parseEmailList(raw: string | undefined): string[] {
    return (raw ?? '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}
