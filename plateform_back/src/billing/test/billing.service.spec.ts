import { describe, expect, it } from '@jest/globals';
import { PlanTier } from 'generated/prisma';
import Stripe from 'stripe';
import { toSubscriptionState } from 'src/billing/billing.service';

const subscription = (status: Stripe.Subscription.Status, cancelAtPeriodEnd = false) =>
    ({
        id: 'sub_1',
        status,
        cancel_at_period_end: cancelAtPeriodEnd,
        items: { data: [{ current_period_end: 1_800_000_000 }] },
    }) as unknown as Stripe.Subscription;

describe('toSubscriptionState', () => {
    it.each(['active', 'trialing', 'past_due'] as const)('keeps the subscription while Stripe says %s', (status) => {
        expect(toSubscriptionState(subscription(status, true))).toEqual({
            plan: PlanTier.PRO,
            stripeSubscriptionId: 'sub_1',
            subscriptionStatus: status,
            currentPeriodEnd: new Date(1_800_000_000 * 1000),
            cancelAtPeriodEnd: true,
        });
    });

    it.each(['canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused'] as const)(
        'ends the subscription when Stripe says %s',
        (status) => {
            expect(toSubscriptionState(subscription(status, true))).toEqual({
                plan: PlanTier.NONE,
                stripeSubscriptionId: null,
                subscriptionStatus: status,
                currentPeriodEnd: null,
                cancelAtPeriodEnd: false,
            });
        },
    );
});
