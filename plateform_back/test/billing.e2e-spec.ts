import { INestApplication } from '@nestjs/common';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { CreditTransactionType, PlanTier, QueryLogStatus } from 'generated/prisma';
import Stripe from 'stripe';
import request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { cleanDatabase } from './helpers/db.helper';
import { createAgent, registerAndLogin } from './helpers/auth.helper';
import { PrismaService } from '../src/prisma/prisma.service';
import { UsageTrackerService } from '../src/credit/usage-tracker.service';
import { STRIPE_CLIENT } from '../src/billing/stripe.provider';

const WEBHOOK_SECRET = 'whsec_test_billing';
const realStripe = new Stripe('sk_test_billing');

/** Stripe's side of the subscriptions: what `subscriptions.retrieve` returns at the time it is called. */
const subscriptions = new Map<string, Stripe.Subscription.Status>();
let retrieve = (id: string): Promise<Stripe.Subscription> =>
    Promise.resolve(subscriptionOf(id, subscriptions.get(id)!));
const cancelled: string[] = [];
const fakeStripe = {
    webhooks: realStripe.webhooks,
    subscriptions: {
        retrieve: (id: string) => retrieve(id),
        cancel: (id: string) => {
            cancelled.push(id);
            subscriptions.set(id, 'canceled');
            return Promise.resolve();
        },
    },
};

function subscriptionOf(id: string, status: Stripe.Subscription.Status) {
    return {
        id,
        status,
        cancel_at_period_end: false,
        items: { data: [{ current_period_end: 1_900_000_000 }] },
    } as unknown as Stripe.Subscription;
}

describe('Billing (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
        process.env.STRIPE_SECRET_KEY = 'sk_test_billing';
        process.env.STRIPE_WEBHOOK_SECRET = WEBHOOK_SECRET;
        app = await createTestApp((builder) => builder.overrideProvider(STRIPE_CLIENT).useValue(fakeStripe));
        prisma = app.get(PrismaService);
    });

    afterAll(async () => {
        await cleanDatabase(app);
        await app.close();
        delete process.env.STRIPE_SECRET_KEY;
        delete process.env.STRIPE_WEBHOOK_SECRET;
    });

    /** A workspace created through the API (Découverte outside production), then moved to `plan`. */
    async function workspaceOn(email: string, plan: PlanTier): Promise<{ cookie: string; workspaceId: string }> {
        const cookie = await registerAndLogin(app, { email, password: 'Password123!', name: 'Billing' });
        const res = await request(app.getHttpServer())
            .post('/workspaces')
            .set('Cookie', cookie)
            .send({ name: 'Billing' })
            .expect(201);
        await prisma.workspace.update({ where: { id: res.body.id }, data: { plan } });
        return { cookie, workspaceId: res.body.id };
    }

    const balanceOf = (workspaceId: string) =>
        prisma.creditBalance.findUniqueOrThrow({
            where: { workspaceId },
            select: { balance: true, monthlyCredits: true },
        });

    const workspaceOf = (id: string) =>
        prisma.workspace.findUniqueOrThrow({ where: { id }, select: { plan: true, stripeSubscriptionId: true } });

    /** Delivers an event the way Stripe does: signed, on the endpoint's API version. */
    const deliver = (type: string, object: Record<string, unknown>, signature?: string) => {
        const payload = JSON.stringify({
            id: `evt_${Math.random()}`,
            object: 'event',
            api_version: Stripe.API_VERSION,
            type,
            data: { object },
        });
        return request(app.getHttpServer())
            .post('/billing/webhook')
            .set('Content-Type', 'application/json')
            .set(
                'Stripe-Signature',
                signature ?? realStripe.webhooks.generateTestHeaderString({ payload, secret: WEBHOOK_SECRET }),
            )
            .send(payload);
    };

    const invoice = (id: string, subscription: string, workspaceId: string, billing_reason = 'subscription_cycle') => ({
        id,
        object: 'invoice',
        billing_reason,
        parent: { type: 'subscription_details', subscription_details: { subscription, metadata: { workspaceId } } },
    });

    /** A workspace on PRO, paying with `subscriptionId`, holding `balance` of which `monthlyCredits` from the quota. */
    async function subscribed(email: string, subscriptionId: string, balance: number, monthlyCredits: number) {
        const ws = await workspaceOn(email, PlanTier.PRO);
        await prisma.workspace.update({
            where: { id: ws.workspaceId },
            data: { stripeSubscriptionId: subscriptionId },
        });
        await prisma.creditBalance.update({
            where: { workspaceId: ws.workspaceId },
            data: { balance, monthlyCredits },
        });
        subscriptions.set(subscriptionId, 'active');
        return ws;
    }

    describe('plan limits', () => {
        it('Découverte allows 1 agent and 2 datasets, and starts with 5 000 credits that never expire', async () => {
            const { cookie, workspaceId } = await workspaceOn('discovery@test.com', PlanTier.FREE);
            const server = app.getHttpServer();

            expect(await balanceOf(workspaceId)).toEqual({ balance: 5_000, monthlyCredits: 0 });
            await createAgent(app, cookie, workspaceId);
            const refused = await request(server)
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: 'Second' })
                .expect(403);
            expect(JSON.stringify(refused.body)).toContain('1 agent');

            for (const name of ['A', 'B']) {
                await request(server)
                    .post(`/workspaces/${workspaceId}/datasets`)
                    .set('Cookie', cookie)
                    .send({ name })
                    .expect(201);
            }
            await request(server)
                .post(`/workspaces/${workspaceId}/datasets`)
                .set('Cookie', cookie)
                .send({ name: 'C' })
                .expect(403);
        });

        it('a workspace with no plan cannot create an agent', async () => {
            const { cookie, workspaceId } = await workspaceOn('noplan@test.com', PlanTier.NONE);

            const refused = await request(app.getHttpServer())
                .post(`/workspaces/${workspaceId}/agents`)
                .set('Cookie', cookie)
                .send({ name: 'Agent' })
                .expect(403);
            expect(JSON.stringify(refused.body)).toContain('Abonnez-vous');
        });
    });

    describe('credits', () => {
        it('a query spends the monthly quota first, then the bought credits, below zero if needed', async () => {
            const { cookie, workspaceId } = await workspaceOn('spender@test.com', PlanTier.PRO);
            const agentId = await createAgent(app, cookie, workspaceId);
            await prisma.creditBalance.update({
                where: { workspaceId },
                data: { balance: 1_000, monthlyCredits: 300 },
            });
            const tracker = app.get(UsageTrackerService);
            const query = { workspaceId, agentId, query: 'q', durationMs: 1, status: QueryLogStatus.SUCCESS };

            await tracker.recordQuery({ ...query, creditsUsed: 500 });
            expect(await balanceOf(workspaceId)).toEqual({ balance: 500, monthlyCredits: 0 });

            await tracker.recordQuery({ ...query, creditsUsed: 700 });
            expect(await balanceOf(workspaceId)).toEqual({ balance: -200, monthlyCredits: 0 });
        });
    });

    describe('Stripe webhook', () => {
        it('a paid period invoice replaces what is left of the quota once, and the ledger records the expiry', async () => {
            const { cookie, workspaceId } = await subscribed('renewal@test.com', 'sub_renew', 3_000, 1_000);
            const totalGranted = async () =>
                (
                    await request(app.getHttpServer())
                        .get(`/workspaces/${workspaceId}/credit-balance`)
                        .set('Cookie', cookie)
                        .expect(200)
                ).body.totalGranted as number;
            const grantedBefore = await totalGranted();

            await deliver('invoice.paid', invoice('in_renew', 'sub_renew', workspaceId)).expect(200);
            await deliver('invoice.paid', invoice('in_renew', 'sub_renew', workspaceId)).expect(200);

            expect(await balanceOf(workspaceId)).toEqual({ balance: 52_000, monthlyCredits: 50_000 });
            // The dashboard's "used" ratio stays right: the expired quota is taken off what was granted.
            expect(await totalGranted()).toBe(grantedBefore - 1_000 + 50_000);
            const ledger = await prisma.creditTransaction.findMany({
                where: {
                    workspaceId,
                    type: { in: [CreditTransactionType.SUBSCRIPTION, CreditTransactionType.EXPIRATION] },
                },
                select: { type: true, amount: true },
            });
            expect(ledger).toEqual(
                expect.arrayContaining([
                    { type: CreditTransactionType.EXPIRATION, amount: -1_000 },
                    { type: CreditTransactionType.SUBSCRIPTION, amount: 50_000 },
                ]),
            );
            expect(ledger.filter((t) => t.amount === 50_000)).toHaveLength(1);
        });

        it('a proration invoice does not reset the quota', async () => {
            const { workspaceId } = await subscribed('proration@test.com', 'sub_prorate', 3_000, 1_000);

            await deliver(
                'invoice.paid',
                invoice('in_prorate', 'sub_prorate', workspaceId, 'subscription_update'),
            ).expect(200);

            expect(await balanceOf(workspaceId)).toEqual({ balance: 3_000, monthlyCredits: 1_000 });
        });

        it('an invoice paid after the subscription ended grants nothing', async () => {
            const { workspaceId } = await subscribed('late@test.com', 'sub_late', 8_000, 6_000);
            subscriptions.set('sub_late', 'canceled');

            await deliver('customer.subscription.deleted', { id: 'sub_late', metadata: { workspaceId } }).expect(200);
            expect(await workspaceOf(workspaceId)).toEqual({ plan: PlanTier.NONE, stripeSubscriptionId: null });
            expect(await balanceOf(workspaceId)).toEqual({ balance: 2_000, monthlyCredits: 0 });

            await deliver('invoice.paid', invoice('in_late', 'sub_late', workspaceId)).expect(200);
            expect(await balanceOf(workspaceId)).toEqual({ balance: 2_000, monthlyCredits: 0 });
        });

        it('a late event about an older subscription leaves the current one alone', async () => {
            const { workspaceId } = await subscribed('older@test.com', 'sub_current', 8_000, 6_000);
            subscriptions.set('sub_older', 'canceled');

            await deliver('customer.subscription.deleted', { id: 'sub_older', metadata: { workspaceId } }).expect(200);

            expect(await workspaceOf(workspaceId)).toEqual({ plan: PlanTier.PRO, stripeSubscriptionId: 'sub_current' });
            expect(await balanceOf(workspaceId)).toEqual({ balance: 8_000, monthlyCredits: 6_000 });
        });

        it('a second paid subscription is cancelled and the first one stays', async () => {
            const { workspaceId } = await subscribed('twice@test.com', 'sub_first', 50_000, 50_000);
            subscriptions.set('sub_second', 'active');

            await deliver('customer.subscription.created', { id: 'sub_second', metadata: { workspaceId } }).expect(200);
            await deliver(
                'invoice.paid',
                invoice('in_second', 'sub_second', workspaceId, 'subscription_create'),
            ).expect(200);

            expect(cancelled).toContain('sub_second');
            expect(await workspaceOf(workspaceId)).toEqual({ plan: PlanTier.PRO, stripeSubscriptionId: 'sub_first' });
            expect(await balanceOf(workspaceId)).toEqual({ balance: 50_000, monthlyCredits: 50_000 });
        });

        it('two deliveries at once: the one that read Stripe last writes last', async () => {
            const { workspaceId } = await subscribed('race@test.com', 'sub_race', 8_000, 6_000);
            // The first read sees the subscription active, then it is cancelled while that delivery is still running.
            const original = retrieve;
            retrieve = async (id) => {
                retrieve = original;
                const snapshot = subscriptionOf(id, 'active');
                subscriptions.set(id, 'canceled');
                await new Promise((resolve) => setTimeout(resolve, 300));
                return snapshot;
            };

            const updated = deliver('customer.subscription.updated', { id: 'sub_race', metadata: { workspaceId } });
            const firstDone = updated.then((res) => res);
            await new Promise((resolve) => setTimeout(resolve, 100));
            const deleted = deliver('customer.subscription.deleted', { id: 'sub_race', metadata: { workspaceId } });
            const [a, b] = await Promise.all([firstDone, deleted]);

            expect([a.status, b.status]).toEqual([200, 200]);
            expect(await workspaceOf(workspaceId)).toEqual({ plan: PlanTier.NONE, stripeSubscriptionId: null });
        });

        it('credits a paid top-up once, from the credits sold, and rejects a forged one', async () => {
            const { cookie, workspaceId } = await workspaceOn('topup@test.com', PlanTier.PRO);
            await prisma.creditBalance.update({ where: { workspaceId }, data: { balance: 100, monthlyCredits: 0 } });
            const session = {
                id: 'cs_topup',
                object: 'checkout.session',
                mode: 'payment',
                payment_status: 'paid',
                // A discount applied on Stripe's side does not change the credits sold.
                amount_total: 1_500,
                metadata: { workspaceId, credits: '20000' },
            };

            await deliver('checkout.session.completed', session).expect(200);
            await deliver('checkout.session.completed', session).expect(200);
            await deliver('checkout.session.completed', session, 't=1,v1=forged').expect(400);

            const summary = await request(app.getHttpServer())
                .get(`/workspaces/${workspaceId}/billing`)
                .set('Cookie', cookie)
                .expect(200);
            expect(summary.body.credits).toEqual({
                balance: 20_100,
                monthly: 0,
                purchased: 20_100,
                monthlyQuota: 50_000,
            });
        });

        it('an event about a deleted workspace is acknowledged, so Stripe stops retrying it', async () => {
            subscriptions.set('sub_gone', 'canceled');

            await deliver('customer.subscription.deleted', {
                id: 'sub_gone',
                metadata: { workspaceId: 'gone' },
            }).expect(200);
            await deliver('checkout.session.completed', {
                id: 'cs_gone',
                object: 'checkout.session',
                mode: 'payment',
                payment_status: 'paid',
                metadata: { workspaceId: 'gone', credits: '5000' },
            }).expect(200);
        });
    });
});
