import type { AgentSummary } from "./types";
import { AgentTypeBadge, EnvBadge } from "./agent-badge";
import { Card } from "@/components/ui/card";

const TYPE_ICONS: Record<string, string> = {
  LEAD_QUALIFIER: "🤖",
  CONTENT_AUTOMATION: "✍️",
  EMAIL_AUTOMATION: "📧",
  N8N_ORCHESTRATOR: "⚙️",
  CRM_MANAGER: "📊",
};

interface Props {
  agent: AgentSummary;
}

export function AgentCard({ agent }: Props) {
  return (
    <Card className={agent.isActive ? "" : "opacity-60"}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--muted)] text-2xl">
          {TYPE_ICONS[agent.type] ?? "🔧"}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-[var(--foreground)] truncate">{agent.name}</p>
            {!agent.isActive && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">Inactive</span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <AgentTypeBadge type={agent.type} />
            <EnvBadge environment={agent.environment} />
          </div>
        </div>
      </div>

      {agent.description && (
        <p className="mt-3 text-sm text-[var(--muted-foreground)] leading-relaxed">{agent.description}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[var(--muted)]/60 p-3">
          <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Tasks</p>
          <p className="mt-1 text-2xl font-semibold">{agent._count.tasks}</p>
        </div>
        <div className="rounded-xl bg-[var(--muted)]/60 p-3">
          <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Spaces</p>
          <p className="mt-1 text-2xl font-semibold">{agent.spaces.length}</p>
        </div>
      </div>

      {agent.spaces.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {agent.spaces.map(({ space }) => (
            <span
              key={space.id}
              className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: `${space.color}20`, color: space.color }}
            >
              {space.name}
            </span>
          ))}
        </div>
      )}

      {agent.endpoint && (
        <p className="mt-3 truncate text-xs text-[var(--muted-foreground)]">
          Endpoint: <span className="font-mono">{agent.endpoint}</span>
        </p>
      )}
    </Card>
  );
}
