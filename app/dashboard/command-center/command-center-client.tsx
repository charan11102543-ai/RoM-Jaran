"use client";

import { useCallback, useState } from "react";
import type { AgentSummary, SpaceSummary, TaskSummary } from "@/components/command-center/types";
import { CommandCenterBoard } from "@/components/command-center/command-center-board";
import { AgentRegistryPanel } from "@/components/command-center/agent-registry-panel";
import { SpacesPanel } from "@/components/command-center/spaces-panel";
import { usePolling } from "@/hooks/use-polling";

type Tab = "kanban" | "agents" | "spaces";

const TAB_LABELS: Record<Tab, string> = {
  kanban: "Kanban Board",
  agents: "Agent Registry",
  spaces: "Spaces",
};

interface Props {
  initialAgents: AgentSummary[];
  initialSpaces: SpaceSummary[];
  initialTasks: TaskSummary[];
}

export function CommandCenterClient({ initialAgents, initialSpaces, initialTasks }: Props) {
  const [tab, setTab] = useState<Tab>("kanban");
  const [agents, setAgents] = useState<AgentSummary[]>(initialAgents);
  const [spaces, setSpaces] = useState<SpaceSummary[]>(initialSpaces);
  const [tasks, setTasks] = useState<TaskSummary[]>(initialTasks);
  const [detailOpen, setDetailOpen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [tasksTruncated, setTasksTruncated] = useState(false);

  const refreshTasks = useCallback(async () => {
    // Poll only active (non-terminal) tasks for efficiency — ~50% fewer rows fetched
    // on a live board. Merge with existing terminal tasks so DONE/FAILED stay visible
    // until the user navigates away.
    const res = await fetch("/api/tasks?active=true&limit=200");
    if (res.ok) {
      const data = await res.json();
      const freshActive: TaskSummary[] = Array.isArray(data) ? data : (data.tasks ?? []);
      const freshIds = new Set(freshActive.map((t) => t.id));
      setTasks((prev) => {
        // Keep terminal tasks that aren't being replaced by fresh active data
        const retained = prev.filter(
          (t) => (t.status === "DONE" || t.status === "FAILED") && !freshIds.has(t.id),
        );
        return [...freshActive, ...retained];
      });
      setTasksTruncated(!Array.isArray(data) && (data.hasMore ?? false));
      setLastRefreshed(new Date());
    }
  }, []);

  const refreshAgents = useCallback(async () => {
    const res = await fetch("/api/agents");
    if (res.ok) setAgents(await res.json());
  }, []);

  const refreshSpaces = useCallback(async () => {
    const res = await fetch("/api/spaces");
    if (res.ok) setSpaces(await res.json());
  }, []);

  // Polling: every 10s when Kanban is visible and no detail panel open
  usePolling(refreshTasks, {
    intervalMs: 10_000,
    enabled: tab === "kanban" && !detailOpen,
  });

  const handleTasksChange = useCallback((updated: TaskSummary[]) => {
    setTasks(updated);
  }, []);

  const reviewCount = tasks.filter((t) => t.status === "REVIEW").length;
  const runningCount = tasks.filter((t) => t.status === "RUNNING").length;
  const failedCount = tasks.filter((t) => t.status === "FAILED").length;

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 px-6 py-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--foreground)] text-lg text-white">
                ⌘
              </span>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Agent Command Center</h1>
                <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
                  {agents.filter((a) => a.isActive).length}/{agents.length} agents active
                  {" · "}{spaces.length} spaces
                  {" · "}{tasks.length} tasks
                  {lastRefreshed && (
                    <span className="ml-2 text-xs opacity-60">
                      synced {lastRefreshed.toLocaleTimeString()}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* KPI pills */}
          <div className="flex flex-wrap gap-2">
            <KpiPill
              label="Active"
              value={agents.filter((a) => a.isActive).length}
              total={agents.length}
              color="emerald"
              icon="●"
            />
            <KpiPill label="Running" value={runningCount} color="blue" pulse={runningCount > 0} icon="▶" />
            <KpiPill label="Review" value={reviewCount} color="violet" icon="⚑" />
            <KpiPill label="Failed" value={failedCount} color="rose" icon="✕" />
            <KpiPill label="Done" value={tasks.filter((t) => t.status === "DONE").length} color="slate" icon="✓" />
          </div>
        </div>

        {/* Alert strip */}
        {(runningCount > 0 || reviewCount > 0 || failedCount > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {runningCount > 0 && (
              <AlertChip color="blue" pulse>
                {runningCount} task{runningCount !== 1 ? "s" : ""} running
              </AlertChip>
            )}
            {reviewCount > 0 && (
              <AlertChip color="violet" onClick={() => setTab("kanban")}>
                ⚑ {reviewCount} awaiting review
              </AlertChip>
            )}
            {failedCount > 0 && (
              <AlertChip color="rose">
                {failedCount} failed — click card for details
              </AlertChip>
            )}
          </div>
        )}

        {/* Truncation warning */}
        {tasksTruncated && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            ⚠ Showing first 200 tasks. Use filters to narrow results or contact admin to archive completed tasks.
          </div>
        )}

        {/* Tabs */}
        <div className="mt-5 flex gap-1 border-t border-[var(--border)] pt-4">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                tab === t
                  ? "bg-[var(--foreground)] text-white"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              }`}
            >
              {TAB_LABELS[t]}
              {t === "kanban" && tasks.length > 0 && (
                <span className="ml-1.5 rounded-full bg-current/20 px-1.5 py-0.5 text-xs">
                  {tasks.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ────────────────────────────────────────── */}
      {tab === "kanban" && (
        <CommandCenterBoard
          tasks={tasks}
          agents={agents}
          spaces={spaces}
          onTasksChange={handleTasksChange}
          onDetailOpenChange={setDetailOpen}
          onRefresh={refreshTasks}
        />
      )}
      {tab === "agents" && (
        <AgentRegistryPanel agents={agents} onRefresh={refreshAgents} />
      )}
      {tab === "spaces" && (
        <SpacesPanel
          spaces={spaces}
          agents={agents}
          onSpacesChange={setSpaces}
        />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiPill({
  label,
  value,
  total,
  color,
  pulse,
  icon,
}: {
  label: string;
  value: number;
  total?: number;
  color: string;
  pulse?: boolean;
  icon?: string;
}) {
  const styles: Record<string, string> = {
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
    rose: "bg-rose-50 text-rose-700",
    slate: "bg-slate-50 text-slate-600",
  };

  return (
    <div className={`flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm ${styles[color] ?? styles.slate}`}>
      {pulse ? (
        <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
      ) : (
        icon && <span className="text-xs opacity-70">{icon}</span>
      )}
      <span className="text-xs font-medium opacity-70">{label}</span>
      <span className="font-bold">
        {value}
        {total !== undefined && <span className="font-normal opacity-60">/{total}</span>}
      </span>
    </div>
  );
}

function AlertChip({
  color,
  pulse,
  onClick,
  children,
}: {
  color: string;
  pulse?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const styles: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    violet: "bg-violet-50 text-violet-700 border-violet-200 cursor-pointer hover:bg-violet-100",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
  };

  const Tag = onClick ? "button" : "div";

  return (
    <Tag
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${styles[color] ?? ""}`}
    >
      {pulse && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {children}
    </Tag>
  );
}
