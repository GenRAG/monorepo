/*
  Warnings:

  - The values [STAGING] on the enum `AgentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AgentStatus_new" AS ENUM ('DEVELOPMENT', 'PRODUCTION');
ALTER TABLE "AgentVersion" ALTER COLUMN "fromStatus" TYPE "AgentStatus_new" USING ("fromStatus"::text::"AgentStatus_new");
ALTER TABLE "AgentVersion" ALTER COLUMN "toStatus" TYPE "AgentStatus_new" USING ("toStatus"::text::"AgentStatus_new");
ALTER TYPE "AgentStatus" RENAME TO "AgentStatus_old";
ALTER TYPE "AgentStatus_new" RENAME TO "AgentStatus";
DROP TYPE "AgentStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "AgentVersion" ADD COLUMN     "name" TEXT;
