-- DropIndex
DROP INDEX "Document_datasetId_idx";

-- CreateIndex
CREATE INDEX "Document_datasetId_createdAt_idx" ON "Document"("datasetId", "createdAt");
