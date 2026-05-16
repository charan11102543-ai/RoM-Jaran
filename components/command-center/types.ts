export type AgentType =
  | "LEAD_QUALIFIER"
  | "CONTENT_AUTOMATION"
  | "EMAIL_AUTOMATION"
  | "N8N_ORCHESTRATOR"
  | "CRM_MANAGER";

export type AgentEnvironment = "LOCAL" | "CLOUD";

export type TaskStatus = "QUEUED" | "RUNNING" | "BLOCKED" | "REVIEW" | "DONE" | "FAILED";
export type TaskPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export interface AgentSummary {
  id: string;
  name: string;
  type: AgentType;
  environment: AgentEnvironment;
  description: string | null;
  endpoint: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { tasks: number };
  spaces: { space: { id: string; name: string; color: string } }[];
}

export interface SpaceSummary {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  _count: { tasks: number };
  agents: { agent: { id: string; name: string; type: AgentType; environment: AgentEnvironment; isActive: boolean } }[];
}

export interface TaskSummary {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  agentId: string | null;
  spaceId: string | null;
  errorMsg: string | null;
  reviewNote: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  agent: { id: string; name: string; type: AgentType; environment: AgentEnvironment } | null;
  space: { id: string; name: string; color: string } | null;
  _count: { logs: number };
}

export interface ExecutionLogEntry {
  id: string;
  taskId: string;
  level: string;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}
