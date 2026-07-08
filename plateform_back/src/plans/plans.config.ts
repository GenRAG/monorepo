import { PlanTier } from 'generated/prisma';

export interface PlanConfig {
    displayName: string;
    initialCredits: number;
}

export const PLANS: Record<PlanTier, PlanConfig> = {
    [PlanTier.FREE]: {
        displayName: 'Découverte',
        initialCredits: 2500,
    },
    [PlanTier.PRO]: {
        displayName: 'Pro',
        initialCredits: 3000,
    },
    [PlanTier.BUSINESS]: {
        displayName: 'Business',
        initialCredits: 5000,
    },
    [PlanTier.ENTERPRISE]: {
        displayName: 'Enterprise',
        initialCredits: 20000,
    },
};

export function getPlanConfig(plan: PlanTier): PlanConfig {
    return PLANS[plan];
}
