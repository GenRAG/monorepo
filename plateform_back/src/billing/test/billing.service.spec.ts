import { ConflictException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PlanTier } from 'generated/prisma';
import Stripe from 'stripe';
import { BillingService, toInvoiceResponse, toSubscriptionState } from 'src/billing/billing.service';

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

describe('BillingService checkouts', () => {
    const workspace = (plan: PlanTier, stripeCustomerId: string | null = 'cus_1') => ({
        id: 'w1',
        plan,
        stripeCustomerId,
    });
    const repository = {
        findWorkspace: jest.fn<(id: string) => Promise<unknown>>(),
        setCustomerId: jest.fn<(id: string, customerId: string) => Promise<void>>(),
    };
    const stripe = {
        customers: { create: jest.fn<(...args: unknown[]) => Promise<{ id: string }>>() },
        subscriptions: { list: jest.fn<(...args: unknown[]) => Promise<{ data: { status: string }[] }>>() },
        checkout: {
            sessions: {
                create: jest.fn<(params: Stripe.Checkout.SessionCreateParams) => Promise<{ url: string }>>(),
                list: jest.fn<(...args: unknown[]) => Promise<{ data: { id: string; mode: string }[] }>>(),
                expire: jest.fn<(id: string) => Promise<void>>(),
            },
        },
    };
    const config = { getOrThrow: () => 'https://app.genrag.test' } as unknown as ConfigService;
    const service = new BillingService(stripe as unknown as Stripe, repository as never, config);
    const createdSession = () => stripe.checkout.sessions.create.mock.calls[0][0];

    beforeEach(() => {
        jest.clearAllMocks();
        repository.findWorkspace.mockResolvedValue(workspace(PlanTier.FREE));
        stripe.customers.create.mockResolvedValue({ id: 'cus_new' });
        stripe.subscriptions.list.mockResolvedValue({ data: [] });
        stripe.checkout.sessions.list.mockResolvedValue({ data: [] });
        stripe.checkout.sessions.create.mockResolvedValue({ url: 'https://checkout.stripe.test/s' });
    });

    describe('subscription', () => {
        it('refuses a workspace already subscribed, before calling Stripe', async () => {
            repository.findWorkspace.mockResolvedValue(workspace(PlanTier.PRO));

            await expect(service.createSubscriptionCheckout('w1', 'a@test.com')).rejects.toThrow(ConflictException);
            expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
        });

        it('refuses when Stripe already holds a paid subscription whose webhook has not arrived', async () => {
            stripe.subscriptions.list.mockResolvedValue({ data: [{ status: 'canceled' }, { status: 'past_due' }] });

            await expect(service.createSubscriptionCheckout('w1', 'a@test.com')).rejects.toThrow(ConflictException);
            expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
        });

        it('expires the subscription checkouts still open, then opens one for the workspace', async () => {
            stripe.checkout.sessions.list.mockResolvedValue({
                data: [
                    { id: 'cs_sub', mode: 'subscription' },
                    { id: 'cs_topup', mode: 'payment' },
                ],
            });

            await expect(service.createSubscriptionCheckout('w1', 'a@test.com')).resolves.toEqual({
                url: 'https://checkout.stripe.test/s',
            });
            expect(stripe.checkout.sessions.expire.mock.calls).toEqual([['cs_sub']]);
            expect(createdSession()).toMatchObject({
                mode: 'subscription',
                customer: 'cus_1',
                client_reference_id: 'w1',
                metadata: { workspaceId: 'w1' },
                subscription_data: { metadata: { workspaceId: 'w1' } },
            });
        });

        it('creates the Stripe customer once per workspace and keeps it', async () => {
            repository.findWorkspace.mockResolvedValue(workspace(PlanTier.NONE, null));

            await service.createSubscriptionCheckout('w1', 'a@test.com');

            expect(stripe.customers.create).toHaveBeenCalledWith(
                { email: 'a@test.com', metadata: { workspaceId: 'w1' } },
                { idempotencyKey: 'customer-w1' },
            );
            expect(repository.setCustomerId).toHaveBeenCalledWith('w1', 'cus_new');
            expect(createdSession()).toMatchObject({ customer: 'cus_new' });
        });
    });

    describe('top-up', () => {
        it.each([PlanTier.NONE, PlanTier.FREE])('refuses a workspace on %s, before calling Stripe', async (plan) => {
            repository.findWorkspace.mockResolvedValue(workspace(plan));

            await expect(service.createTopUpCheckout('w1', 'a@test.com', 20)).rejects.toThrow(ForbiddenException);
            expect(stripe.checkout.sessions.create).not.toHaveBeenCalled();
        });

        it('charges the euros asked and records the credits sold in the session', async () => {
            repository.findWorkspace.mockResolvedValue(workspace(PlanTier.PRO));

            await service.createTopUpCheckout('w1', 'a@test.com', 20);

            const session = createdSession();
            expect(session).toMatchObject({ mode: 'payment', metadata: { workspaceId: 'w1', credits: '20000' } });
            expect(session.line_items?.[0].price_data?.unit_amount).toBe(2_000);
        });
    });
});
