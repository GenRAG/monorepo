-- CreateTable
CREATE TABLE "AgentVersion" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "changelog" TEXT,
    "fromStatus" "AgentStatus" NOT NULL,
    "toStatus" "AgentStatus" NOT NULL,
    "workflowVersion" INTEGER,
    "agentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "AgentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AgentVersion_agentId_version_key" ON "AgentVersion"("agentId", "version");

-- AddForeignKey
ALTER TABLE "AgentVersion" ADD CONSTRAINT "AgentVersion_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
