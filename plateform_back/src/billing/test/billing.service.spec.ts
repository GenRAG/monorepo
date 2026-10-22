import { describe, expect, it } from '@jest/globals';
import { PlanTier } from 'generated/prisma';
import Stripe from 'stripe';
import { toInvoiceResponse, toSubscriptionState } from 'src/billing/billing.service';

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

describe('toInvoiceResponse', () => {
    const invoice = (fields: Partial<Stripe.Invoice>) =>
        ({
            id: 'in_1',
            number: 'GEN-0001',
            created: 1_800_000_000,
            total: 6000,
            currency: 'eur',
            status: 'paid',
            invoice_pdf: 'https://pay.stripe.com/pdf',
            parent: null,
            lines: { data: [{ description: '35 000 crédits GenRAG' }] },
            ...fields,
        }) as unknown as Stripe.Invoice;

    it('names a subscription invoice after the subscription', () => {
        const parent = { subscription_details: { subscription: 'sub_1' } } as Stripe.Invoice['parent'];
        expect(toInvoiceResponse(invoice({ parent }))).toEqual({
            id: 'in_1',
            number: 'GEN-0001',
            createdAt: new Date(1_800_000_000 * 1000),
            label: 'Abonnement',
            totalCents: 6000,
            currency: 'eur',
            status: 'paid',
            pdfUrl: 'https://pay.stripe.com/pdf',
        });
    });

    it('names a top-up invoice after the credits sold', () => {
        expect(toInvoiceResponse(invoice({})).label).toBe('35 000 crédits GenRAG');
    });
});
