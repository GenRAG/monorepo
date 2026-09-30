-- CreateIndex
CREATE INDEX "AgentQueryLog_agentId_createdAt_idx" ON "AgentQueryLog"("agentId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Document_agentId_idx" ON "Document"("agentId");
