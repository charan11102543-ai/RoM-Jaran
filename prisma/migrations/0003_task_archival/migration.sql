-- Add archivedAt column and index to AgentTask for soft-archival of completed/failed tasks
ALTER TABLE "AgentTask" ADD COLUMN "archivedAt" TIMESTAMP(3);
CREATE INDEX "AgentTask_archivedAt_idx" ON "AgentTask"("archivedAt");
