/*
  Warnings:

  - A unique constraint covering the columns `[agentId,version]` on the table `Workflow` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Workflow" DROP CONSTRAINT "Workflow_agentId_fkey";

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_agentId_version_key" ON "Workflow"("agentId", "version");

-- AddForeignKey
ALTER TABLE "Workflow" ADD CONSTRAINT "Workflow_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
