-- AlterEnum
ALTER TYPE "CreditTransactionType" ADD VALUE 'EXPIRATION';

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "onboardingStartedAt" TIMESTAMP(3);

-- Workspaces that already went through onboarding (session still there, or bonus granted) cannot start it again.
UPDATE "Workspace" SET "onboardingStartedAt" = "createdAt"
WHERE "id" IN (
    SELECT "workspaceId" FROM "OnboardingSession"
    UNION
    SELECT "workspaceId" FROM "CreditTransaction" WHERE "metadata"->>'source' = 'onboarding_bonus'
);
