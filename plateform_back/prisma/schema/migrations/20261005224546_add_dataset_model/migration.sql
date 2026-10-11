/*
  Warnings:

  - You are about to drop the column `agentId` on the `Document` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[datasetId,source,externalId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `datasetId` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocumentSource" AS ENUM ('UPLOAD', 'GOOGLE_DRIVE', 'SHAREPOINT', 'NOTION');

-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_agentId_fkey";

-- DropIndex
DROP INDEX "Document_agentId_idx";

-- AlterTable
ALTER TABLE "Document" DROP COLUMN "agentId",
ADD COLUMN     "datasetId" TEXT NOT NULL,
ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "externalModifiedAt" TIMESTAMP(3),
ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "source" "DocumentSource" NOT NULL DEFAULT 'UPLOAD';

-- CreateTable
CREATE TABLE "Dataset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "workspaceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentDataset" (
    "agentId" TEXT NOT NULL,
    "datasetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentDataset_pkey" PRIMARY KEY ("agentId","datasetId")
);

-- CreateIndex
CREATE INDEX "Dataset_workspaceId_idx" ON "Dataset"("workspaceId");

-- CreateIndex
CREATE INDEX "AgentDataset_datasetId_idx" ON "AgentDataset"("datasetId");

-- CreateIndex
CREATE INDEX "Document_datasetId_idx" ON "Document"("datasetId");

-- CreateIndex
CREATE UNIQUE INDEX "Document_datasetId_source_externalId_key" ON "Document"("datasetId", "source", "externalId");

-- AddForeignKey
ALTER TABLE "Dataset" ADD CONSTRAINT "Dataset_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDataset" ADD CONSTRAINT "AgentDataset_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentDataset" ADD CONSTRAINT "AgentDataset_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
