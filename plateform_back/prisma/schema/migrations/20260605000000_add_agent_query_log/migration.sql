CREATE TYPE "QueryLogStatus" AS ENUM ('SUCCESS', 'ERROR', 'OUT_OF_CREDITS');

CREATE TABLE "AgentQueryLog" (
    "id"         TEXT NOT NULL,
    "agentId"    TEXT NOT NULL,
    "query"      TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "status"     "QueryLogStatus" NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentQueryLog_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AgentQueryLog"
    ADD CONSTRAINT "AgentQueryLog_agentId_fkey"
    FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE INDEX "AgentQueryLog_agentId_createdAt_idx" ON "AgentQueryLog"("agentId", "createdAt" DESC);
