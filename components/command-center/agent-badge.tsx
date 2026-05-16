import { cn } from "@/lib/utils";
import type { AgentType, AgentEnvironment } from "./types";

const TYPE_LABELS: Record<AgentType, string> = {
  LEAD_QUALIFIER: "Lead Qualifier",
  CONTENT_AUTOMATION: "Content",
  EMAIL_AUTOMATION: "Email",
  N8N_ORCHESTRATOR: "n8n Orchestrator",
  CRM_MANAGER: "CRM Manager",
};

const TYPE_COLORS: Record<AgentType, string> = {
  LEAD_QUALIFIER: "bg-emerald-100 text-emerald-700",
  CONTENT_AUTOMATION: "bg-violet-100 text-violet-700",
  EMAIL_AUTOMATION: "bg-blue-100 text-blue-700",
  N8N_ORCHESTRATOR: "bg-orange-100 text-orange-700",
  CRM_MANAGER: "bg-teal-100 text-teal-700",
};

const ENV_STYLES: Record<AgentEnvironment, string> = {
  LOCAL: "bg-slate-100 text-slate-600",
  CLOUD: "bg-sky-100 text-sky-700",
};

export function AgentTypeBadge({ type }: { type: AgentType }) {
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", TYPE_COLORS[type])}>
      {TYPE_LABELS[type]}
    </span>
  );
}

export function EnvBadge({ environment }: { environment: AgentEnvironment }) {
  return (
    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", ENV_STYLES[environment])}>
      {environment === "CLOUD" ? "☁ Cloud" : "⬡ Local"}
    </span>
  );
}

export function AgentTypeLabel(type: AgentType): string {
  return TYPE_LABELS[type];
}
