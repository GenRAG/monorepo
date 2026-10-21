-- AlterEnum: no workspace ever paid for PRO, BUSINESS or ENTERPRISE, so every existing workspace (beta testers) keeps Découverte.
BEGIN;
CREATE TYPE "PlanTier_new" AS ENUM ('NONE', 'FREE', 'PRO');
ALTER TABLE "Workspace" ALTER COLUMN "plan" DROP DEFAULT;
ALTER TABLE "Workspace" ALTER COLUMN "plan" TYPE "PlanTier_new" USING ('FREE'::"PlanTier_new");
ALTER TYPE "PlanTier" RENAME TO "PlanTier_old";
ALTER TYPE "PlanTier_new" RENAME TO "PlanTier";
DROP TYPE "PlanTier_old";
ALTER TABLE "Workspace" ALTER COLUMN "plan" SET DEFAULT 'NONE';
COMMIT;

-- AlterTable
ALTER TABLE "CreditBalance" ADD COLUMN     "monthlyCredits" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "CreditTransaction" ADD COLUMN     "stripeRef" TEXT;

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CreditTransaction_stripeRef_key" ON "CreditTransaction"("stripeRef");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_stripeCustomerId_key" ON "Workspace"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_stripeSubscriptionId_key" ON "Workspace"("stripeSubscriptionId");
