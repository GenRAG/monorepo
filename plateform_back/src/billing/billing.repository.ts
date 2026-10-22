import { Injectable } from '@nestjs/common';
import { CreditTransactionType, PlanTier, Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';

export interface SubscriptionState {
    plan: PlanTier;
    stripeSubscriptionId: string | null;
    subscriptionStatus: string | null;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
}

/** What saving a subscription did. `duplicate`: a second paid subscription while another one is current. */
export type SyncOutcome = 'missing' | 'ignored' | 'saved' | 'duplicate';

const isDuplicateGrant = (error: unknown) =>
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    String(error.meta?.target).includes('stripeRef');

// The callback reads the subscription from Stripe while the workspace is locked: allow a slow API call.
const SYNC_TX_OPTIONS = { timeout: 20_000 };

type Tx = Prisma.TransactionClient;

@Injectable()
export class BillingRepository {
    constructor(private readonly prisma: PrismaService) {}

    findWorkspace(workspaceId: string) {
        return this.prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: {
                id: true,
                plan: true,
                stripeCustomerId: true,
                stripeSubscriptionId: true,
                subscriptionStatus: true,
                currentPeriodEnd: true,
                cancelAtPeriodEnd: true,
                creditBalance: { select: { balance: true, monthlyCredits: true } },
                _count: { select: { agents: true, datasets: true } },
            },
        });
    }

    async findWorkspaceIdBySubscription(stripeSubscriptionId: string): Promise<string | null> {
        const workspace = await this.prisma.workspace.findUnique({
            where: { stripeSubscriptionId },
            select: { id: true },
        });
        return workspace?.id ?? null;
    }

    async setCustomerId(workspaceId: string, stripeCustomerId: string): Promise<void> {
        await this.prisma.workspace.update({ where: { id: workspaceId }, data: { stripeCustomerId } });
    }

    /** Stripe customers of the workspaces about to be deleted with an account. */
    async findCustomerIds(workspaceIds: string[]): Promise<string[]> {
        const workspaces = await this.prisma.workspace.findMany({
            where: { id: { in: workspaceIds }, stripeCustomerId: { not: null } },
            select: { stripeCustomerId: true },
        });
        return workspaces.map((w) => w.stripeCustomerId!);
    }

    /**
     * Saves a subscription under a per-workspace lock, reading it from Stripe once the lock is held: of two
     * deliveries at once, the last to write is also the last to read, so a stale copy never overwrites a newer one.
     *
     * A paid subscription applies unless the workspace is already on another paid one (`duplicate`). An unpaid one
     * only ends the subscription the workspace is on: an unfinished checkout or a late event about an older
     * subscription changes nothing. Ending it expires what is left of the monthly quota; bought credits stay.
     * `renewal` replaces the quota, only when the subscription is (still) the workspace's paid one.
     */
    syncSubscription(
        workspaceId: string,
        subscriptionId: string,
        readState: () => Promise<SubscriptionState>,
        renewal?: { credits: number; invoiceId: string },
    ): Promise<SyncOutcome> {
        return this.prisma.$transaction(async (tx) => {
            await this.lock(tx, workspaceId);
            const current = await tx.workspace.findUnique({
                where: { id: workspaceId },
                select: { plan: true, stripeSubscriptionId: true },
            });
            if (!current) return 'missing';

            const state = await readState();
            const isCurrent = current.stripeSubscriptionId === subscriptionId;

            if (state.plan !== PlanTier.PRO) {
                if (!isCurrent) return 'ignored';
                await tx.workspace.update({ where: { id: workspaceId }, data: state });
                await this.expireMonthlyCredits(tx, workspaceId, { subscriptionId });
                return 'saved';
            }
            if (current.plan === PlanTier.PRO && current.stripeSubscriptionId && !isCurrent) return 'duplicate';

            await tx.workspace.update({ where: { id: workspaceId }, data: state });
            if (renewal) await this.renewMonthlyCredits(tx, workspaceId, renewal.credits, renewal.invoiceId);
            return 'saved';
        }, SYNC_TX_OPTIONS);
    }

    /** Credits bought on top of the plan. Returns false when already credited, or when the workspace is gone. */
    async addPurchasedCredits(workspaceId: string, credits: number, stripeRef: string): Promise<boolean> {
        try {
            return await this.prisma.$transaction(async (tx) => {
                await this.lock(tx, workspaceId);
                const balance = await tx.creditBalance.findUnique({ where: { workspaceId }, select: { id: true } });
                if (!balance) return false;
                await tx.creditTransaction.create({
                    data: { workspaceId, amount: credits, type: CreditTransactionType.PURCHASE, stripeRef },
                });
                await tx.creditBalance.update({ where: { workspaceId }, data: { balance: { increment: credits } } });
                return true;
            });
        } catch (error) {
            if (isDuplicateGrant(error)) return false;
            throw error;
        }
    }

    /**
     * A new billing period: what is left of the previous quota expires and the full quota comes back, once per invoice.
     * A negative balance is paid from the new quota, which never exceeds the balance: the debt is taken once.
     */
    private async renewMonthlyCredits(tx: Tx, workspaceId: string, credits: number, invoiceId: string): Promise<void> {
        const alreadyApplied = await tx.creditTransaction.findUnique({ where: { stripeRef: invoiceId } });
        if (alreadyApplied) return;
        await this.expireMonthlyCredits(tx, workspaceId, { invoiceId });
        await tx.creditTransaction.create({
            data: { workspaceId, amount: credits, type: CreditTransactionType.SUBSCRIPTION, stripeRef: invoiceId },
        });
        await tx.$executeRaw`
            UPDATE "CreditBalance"
            SET "balance" = "balance" + ${credits},
                "monthlyCredits" = LEAST(${credits}, GREATEST("balance" + ${credits}, 0)),
                "updatedAt" = NOW()
            WHERE "workspaceId" = ${workspaceId}`;
    }

    private async expireMonthlyCredits(tx: Tx, workspaceId: string, metadata: Prisma.InputJsonObject): Promise<void> {
        // The row lock keeps a query billed at the same time from slipping between reading and removing the quota.
        const [row] = await tx.$queryRaw<{ monthlyCredits: number }[]>`
            SELECT "monthlyCredits" FROM "CreditBalance" WHERE "workspaceId" = ${workspaceId} FOR UPDATE`;
        if (!row || row.monthlyCredits <= 0) return;
        await tx.creditTransaction.create({
            data: { workspaceId, amount: -row.monthlyCredits, type: CreditTransactionType.EXPIRATION, metadata },
        });
        await tx.$executeRaw`
            UPDATE "CreditBalance"
            SET "balance" = "balance" - "monthlyCredits", "monthlyCredits" = 0, "updatedAt" = NOW()
            WHERE "workspaceId" = ${workspaceId}`;
    }

    private async lock(tx: Tx, workspaceId: string): Promise<void> {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'billing:' + workspaceId}))`;
    }
}
