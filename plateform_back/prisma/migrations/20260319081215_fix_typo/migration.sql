/*
  Warnings:

  - The values [DEVELOPEMENT] on the enum `AgentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AgentStatus_new" AS ENUM ('DEVELOPMENT', 'STAGING', 'PRODUCTION');
ALTER TABLE "Agent" ALTER COLUMN "status" TYPE "AgentStatus_new" USING ("status"::text::"AgentStatus_new");
ALTER TYPE "AgentStatus" RENAME TO "AgentStatus_old";
ALTER TYPE "AgentStatus_new" RENAME TO "AgentStatus";
DROP TYPE "AgentStatus_old";
COMMIT;
