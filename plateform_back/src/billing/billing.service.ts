import { ConflictException, ForbiddenException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PlanTier } from 'generated/prisma';
import Stripe from 'stripe';
import { CREDITS_PER_EURO, getPlanConfig, PLANS, SUBSCRIPTION_PRICE_CENTS } from 'src/plans/plans.config';
import { BillingRepository, SubscriptionState } from './billing.repository';
import { BillingSummary } from './dto/billing-summary.response';
import { requireStripe, STRIPE_CLIENT } from './stripe.provider';

// Stripe keeps retrying a subscription in these states: the plan stays until it gives up (`canceled`, `unpaid`).
const PAID_STATUSES = new Set<Stripe.Subscription.Status>(['active', 'trialing', 'past_due']);
// Stripe's code for "Software as a service, business use": required by Managed Payments, used by Stripe Tax.
const SAAS_TAX_CODE = 'txcd_10103001';
// The invoices that open a billing period. Prorations and manual invoices on the subscription do not reset the quota.
const PERIOD_INVOICE_REASONS = new Set<Stripe.Invoice.BillingReason>(['subscription_create', 'subscription_cycle']);

/** What a Stripe subscription means for the workspace, from Stripe's current copy of it. */
export function toSubscriptionState(subscription: Stripe.Subscription): SubscriptionState {
    const paid = PAID_STATUSES.has(subscription.status);
    const periodEnd = subscription.items.data[0]?.current_period_end;
    return {
        plan: paid ? PlanTier.PRO : PlanTier.NONE,
        stripeSubscriptionId: paid ? subscription.id : null,
        subscriptionStatus: subscription.status,
        currentPeriodEnd: paid && periodEnd ? new Date(periodEnd * 1000) : null,
        cancelAtPeriodEnd: paid && subscription.cancel_at_period_end,
    };
}

@Injectable()
export class BillingService {
    private readonly logger = new Logger(BillingService.name);
    private readonly frontendUrl: string;

    constructor(
        @Inject(STRIPE_CLIENT) private readonly stripeClient: Stripe | null,
        private readonly billingRepository: BillingRepository,
        private readonly configService: ConfigService,
    ) {
        this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL').split(',')[0].trim();
    }

    private get stripe(): Stripe {
        return requireStripe(this.stripeClient);
    }

    private async findWorkspace(workspaceId: string) {
        const workspace = await this.billingRepository.findWorkspace(workspaceId);
        if (!workspace) throw new NotFoundException('Workspace not found');
        return workspace;
    }

    async getSummary(workspaceId: string): Promise<BillingSummary> {
        const workspace = await this.findWorkspace(workspaceId);
        const { displayName, maxAgents, maxDatasets, monthlyCredits } = getPlanConfig(workspace.plan);
        const balance = workspace.creditBalance?.balance ?? 0;
        const monthly = workspace.creditBalance?.monthlyCredits ?? 0;

        return {
            plan: workspace.plan,
            planName: displayName,
            limits: { agents: maxAgents, datasets: maxDatasets },
            usage: { agents: workspace._count.agents, datasets: workspace._count.datasets },
            credits: { balance, monthly, purchased: balance - monthly, monthlyQuota: monthlyCredits },
            subscription: workspace.stripeSubscriptionId
                ? {
                      status: workspace.subscriptionStatus,
                      currentPeriodEnd: workspace.currentPeriodEnd,
                      cancelAtPeriodEnd: workspace.cancelAtPeriodEnd,
                  }
                : null,
            subscriptionOffer: {
                priceCents: SUBSCRIPTION_PRICE_CENTS,
                monthlyCredits: PLANS[PlanTier.PRO].monthlyCredits,
                maxAgents: PLANS[PlanTier.PRO].maxAgents,
                maxDatasets: PLANS[PlanTier.PRO].maxDatasets,
            },
            creditsPerEuro: CREDITS_PER_EURO,
        };
    }

    async createSubscriptionCheckout(workspaceId: string, email: string): Promise<{ url: string }> {
        const workspace = await this.findWorkspace(workspaceId);
        if (workspace.plan === PlanTier.PRO) throw new ConflictException('Cet espace est déjà abonné');
        const customer = await this.ensureCustomer(workspaceId, workspace.stripeCustomerId, email);
        await this.closeOpenSubscriptionCheckouts(customer);

        const session = await this.stripe.checkout.sessions.create({
            mode: 'subscription',
            customer,
            client_reference_id: workspaceId,
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: 'eur',
                        unit_amount: SUBSCRIPTION_PRICE_CENTS,
                        recurring: { interval: 'month' },
                        product_data: { name: 'GenRAG - Abonnement', tax_code: SAAS_TAX_CODE },
                    },
                },
            ],
            // Copied onto the subscription and each of its invoices, so every webhook finds its workspace.
            subscription_data: { metadata: { workspaceId } },
            metadata: { workspaceId },
            success_url: `${this.frontendUrl}/workspaces/${workspaceId}/billing?checkout=success`,
            cancel_url: `${this.frontendUrl}/workspaces/${workspaceId}/billing?checkout=cancel`,
        });
        return { url: session.url! };
    }

    /** Top-ups come on top of a subscription, as with Claude: Découverte keeps its one-time credits. */
    async createTopUpCheckout(workspaceId: string, email: string, euros: number): Promise<{ url: string }> {
        const workspace = await this.findWorkspace(workspaceId);
        if (workspace.plan !== PlanTier.PRO) {
            throw new ForbiddenException("L'achat de crédits supplémentaires demande un abonnement");
        }
        const credits = euros * CREDITS_PER_EURO;

        const session = await this.stripe.checkout.sessions.create({
            mode: 'payment',
            customer: await this.ensureCustomer(workspaceId, workspace.stripeCustomerId, email),
            client_reference_id: workspaceId,
            line_items: [
                {
                    quantity: 1,
                    price_data: {
                        currency: 'eur',
                        unit_amount: euros * 100,
                        product_data: {
                            name: `${credits.toLocaleString('fr-FR')} crédits GenRAG`,
                            tax_code: SAAS_TAX_CODE,
                        },
                    },
                },
            ],
            // The credits sold, so a discount or a tax enabled later on Stripe's side never changes them.
            metadata: { workspaceId, credits: String(credits) },
            invoice_creation: { enabled: true },
            success_url: `${this.frontendUrl}/workspaces/${workspaceId}/billing?checkout=success`,
            cancel_url: `${this.frontendUrl}/workspaces/${workspaceId}/billing?checkout=cancel`,
        });
        return { url: session.url! };
    }

    /** Stripe's own page for the card, the invoices and cancelling. */
    async createPortalSession(workspaceId: string): Promise<{ url: string }> {
        const workspace = await this.findWorkspace(workspaceId);
        if (!workspace.stripeCustomerId) throw new NotFoundException("Aucun paiement n'a encore été fait");

        const session = await this.stripe.billingPortal.sessions.create({
            customer: workspace.stripeCustomerId,
            return_url: `${this.frontendUrl}/workspaces/${workspaceId}/billing`,
        });
        return { url: session.url };
    }

    /**
     * Two tabs, or a paid subscription whose webhook has not arrived yet, must not lead to a second subscription:
     * refuses when the customer already pays, and expires the subscription checkouts still open.
     */
    private async closeOpenSubscriptionCheckouts(customer: string): Promise<void> {
        const subscriptions = await this.stripe.subscriptions.list({ customer, status: 'all', limit: 10 });
        if (subscriptions.data.some((s) => PAID_STATUSES.has(s.status))) {
            throw new ConflictException('Un abonnement est déjà en cours pour cet espace');
        }
        const sessions = await this.stripe.checkout.sessions.list({ customer, status: 'open', limit: 10 });
        await Promise.all(
            sessions.data
                .filter((s) => s.mode === 'subscription')
                .map((s) => this.stripe.checkout.sessions.expire(s.id)),
        );
    }

    /**
     * Deleting the customer cancels its subscriptions at once, so a deleted account is never billed again.
     * Called before the account goes: without Stripe configured, a workspace that has a customer cannot be deleted.
     */
    async deleteCustomers(workspaceIds: string[]): Promise<void> {
        const customerIds = await this.billingRepository.findCustomerIds(workspaceIds);
        for (const customerId of customerIds) {
            try {
                await this.stripe.customers.del(customerId);
            } catch (error) {
                if (!(error instanceof Stripe.errors.StripeInvalidRequestError && error.code === 'resource_missing')) {
                    throw error;
                }
            }
        }
    }

    private async ensureCustomer(workspaceId: string, customerId: string | null, email: string): Promise<string> {
        if (customerId) return customerId;
        const customer = await this.stripe.customers.create(
            { email, metadata: { workspaceId } },
            // Two clicks at once must not create two customers for one workspace.
            { idempotencyKey: `customer-${workspaceId}` },
        );
        await this.billingRepository.setCustomerId(workspaceId, customer.id);
        return customer.id;
    }

    constructEvent(rawBody: Buffer, signature: string): Stripe.Event {
        const event = this.stripe.webhooks.constructEvent(
            rawBody,
            signature,
            this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET'),
        );
        // Payloads follow the endpoint's API version, set in the Stripe dashboard: invoices are read in this one.
        if (event.api_version !== Stripe.API_VERSION) {
            this.logger.error(`Webhook endpoint on API ${event.api_version}, expected ${Stripe.API_VERSION}`);
        }
        return event;
    }

    /**
     * Every handler converges on Stripe's current state, whatever the order or the number of deliveries:
     * subscriptions are re-read from Stripe under a per-workspace lock and credit grants are keyed by the Stripe
     * object id. An event about a deleted workspace is logged and acknowledged, so Stripe stops retrying it.
     */
    async handleEvent(event: Stripe.Event): Promise<void> {
        switch (event.type) {
            case 'checkout.session.completed':
            case 'checkout.session.async_payment_succeeded':
                return this.onCheckoutCompleted(event.data.object);
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                await this.syncSubscription(event.data.object.id, event.data.object.metadata.workspaceId);
                return;
            case 'invoice.paid':
                return this.onInvoicePaid(event.data.object);
            default:
                return;
        }
    }

    private async onCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
        const workspaceId = session.metadata?.workspaceId;
        if (!workspaceId) return;

        if (session.mode === 'subscription' && typeof session.subscription === 'string') {
            await this.syncSubscription(session.subscription, workspaceId);
            return;
        }
        // An async method (bank transfer) completes the session unpaid: its credits wait for async_payment_succeeded.
        const credits = Number(session.metadata?.credits);
        if (
            session.mode === 'payment' &&
            session.payment_status === 'paid' &&
            Number.isInteger(credits) &&
            credits > 0
        ) {
            if (await this.billingRepository.addPurchasedCredits(workspaceId, credits, session.id)) {
                this.logger.log(`Workspace ${workspaceId}: ${credits} credits bought`);
            }
        }
    }

    private async onInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
        const details = invoice.parent?.subscription_details;
        const subscriptionId =
            typeof details?.subscription === 'string' ? details.subscription : details?.subscription?.id;
        if (!subscriptionId || !invoice.id) {
            if (invoice.billing_reason?.startsWith('subscription')) {
                this.logger.error(`Invoice ${invoice.id} has no subscription parent: is the endpoint on an older API?`);
            }
            return;
        }
        const opensPeriod = invoice.billing_reason !== null && PERIOD_INVOICE_REASONS.has(invoice.billing_reason);
        const renewal = opensPeriod
            ? { credits: PLANS[PlanTier.PRO].monthlyCredits, invoiceId: invoice.id }
            : undefined;
        await this.syncSubscription(subscriptionId, details?.metadata?.workspaceId, renewal);
    }

    /** Saves Stripe's current copy of the subscription, and with `renewal` resets the quota if it is still paid. */
    private async syncSubscription(
        subscriptionId: string,
        workspaceIdHint?: string,
        renewal?: { credits: number; invoiceId: string },
    ): Promise<void> {
        const workspaceId =
            workspaceIdHint ?? (await this.billingRepository.findWorkspaceIdBySubscription(subscriptionId));
        const outcome = workspaceId
            ? await this.billingRepository.syncSubscription(
                  workspaceId,
                  subscriptionId,
                  async () => toSubscriptionState(await this.stripe.subscriptions.retrieve(subscriptionId)),
                  renewal,
              )
            : 'missing';

        if (outcome === 'missing') {
            this.logger.warn(`Subscription ${subscriptionId} matches no workspace`);
        } else if (outcome === 'duplicate') {
            // The unused part goes to the customer's balance and pays the next invoice of the subscription kept.
            await this.stripe.subscriptions.cancel(subscriptionId, { prorate: true });
            this.logger.error(`Workspace ${workspaceId}: second subscription ${subscriptionId} cancelled`);
        } else if (outcome === 'saved' && renewal) {
            this.logger.log(
                `Workspace ${workspaceId}: subscription ${subscriptionId} synced (invoice ${renewal.invoiceId})`,
            );
        }
    }
}
