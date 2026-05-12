-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO', 'BUSINESS', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "plan" "PlanTier" NOT NULL DEFAULT 'FREE';
