"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AgentSummary, SpaceSummary, TaskSummary, TaskStatus } from "./types";
import { TaskCard } from "./task-card";
import { TaskDetailPanel } from "./task-detail-panel";
import { CreateTaskModal } from "./create-task-modal";
import { TaskStatusBadge, TASK_STATUSES } from "./task-status-badge";
import { Button } from "@/components/ui/button";

interface Props {
  tasks: TaskSummary[];
  agents: AgentSummary[];
  spaces: SpaceSummary[];
  onTasksChange: (tasks: TaskSummary[]) => void;
  onDetailOpenChange?: (open: boolean) => void;
  onRefresh?: () => Promise<void>;
}

export function CommandCenterBoard({
  tasks,
  agents,
  spaces,
  onTasksChange,
  onDetailOpenChange,
  onRefresh,
}: Props) {
  const [selectedTask, setSelectedTask] = useState<TaskSummary | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filterAgent, setFilterAgent] = useState<string>("");
  const [filterSpace, setFilterSpace] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  const prevDetailOpen = useRef(false);
  useEffect(() => {
    const open = selectedTask !== null;
    if (open !== prevDetailOpen.current) {
      prevDetailOpen.current = open;
      onDetailOpenChange?.(open);
    }
  }, [selectedTask, onDetailOpenChange]);

  const filtered = useMemo(
    () =>
      tasks.filter((t) => {
        if (filterAgent && t.agentId !== filterAgent) return false;
        if (filterSpace && t.spaceId !== filterSpace) return false;
        if (filterPriority && t.priority !== filterPriority) return false;
        return true;
      }),
    [tasks, filterAgent, filterSpace, filterPriority],
  );

  const handleStatusChange = useCallback(
    (taskId: string, status: TaskStatus, callApi = false) => {
      // Optimistic update immediately
      onTasksChange(tasks.map((t) => (t.id === taskId ? { ...t, status } : t)));
      setSelectedTask((prev) => (prev?.id === taskId ? { ...prev, status } : prev));

      // Called from DnD drop — task-card handles its own API call, but DnD drops come from Column
      if (callApi) {
        fetch(`/api/tasks/${taskId}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        })
          .then((res) => { if (!res.ok) onRefresh?.(); })
          .catch(() => { onRefresh?.(); });
      }
    },
    [tasks, onTasksChange, onRefresh],
  );

  async function handleRefresh() {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try { await onRefresh(); } finally { setRefreshing(false); }
  }

  async function handleTaskCreated() {
    setShowCreate(false);
    await handleRefresh();
  }

  return (
    <>
      <div className="space-y-4">
        {/* Filter bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              value={filterAgent}
              onChange={setFilterAgent}
              placeholder="All Agents"
              options={agents.map((a) => ({ value: a.id, label: a.name }))}
            />
            <FilterSelect
              value={filterSpace}
              onChange={setFilterSpace}
              placeholder="All Spaces"
              options={spaces.map((s) => ({ value: s.id, label: s.name }))}
            />
            <FilterSelect
              value={filterPriority}
              onChange={setFilterPriority}
              placeholder="All Priorities"
              options={[
                { value: "LOW", label: "↓ Low" },
                { value: "NORMAL", label: "— Normal" },
                { value: "HIGH", label: "↑ High" },
                { value: "URGENT", label: "!! Urgent" },
              ]}
            />
            {(filterAgent || filterSpace || filterPriority) && (
              <button
                onClick={() => { setFilterAgent(""); setFilterSpace(""); setFilterPriority(""); }}
                className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
              >
                ✕ Clear filters
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="rounded-full border border-[var(--border)] bg-white px-3 py-2 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] disabled:opacity-50"
              title="Refresh tasks"
            >
              {refreshing ? "↻ …" : "↻ Refresh"}
            </button>
            <Button onClick={() => setShowCreate(true)}>+ New Task</Button>
          </div>
        </div>

        {/* Board */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {TASK_STATUSES.map((status) => {
            const col = filtered.filter((t) => t.status === status);
            return (
              <Column
                key={status}
                status={status}
                tasks={col}
                onStatusChange={handleStatusChange}
                onSelect={setSelectedTask}
              />
            );
          })}
        </div>

        <p className="text-xs text-[var(--muted-foreground)]">
          {filtered.length} task{filtered.length !== 1 ? "s" : ""} shown
          {(filterAgent || filterSpace || filterPriority) && " (filtered)"}
        </p>
      </div>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusChange={handleStatusChange}
        />
      )}

      {showCreate && (
        <CreateTaskModal
          agents={agents}
          spaces={spaces}
          onClose={() => setShowCreate(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────

const COLUMN_BG: Record<TaskStatus, string> = {
  QUEUED: "bg-slate-50",
  RUNNING: "bg-blue-50/60",
  BLOCKED: "bg-amber-50/60",
  REVIEW: "bg-violet-50/60",
  DONE: "bg-emerald-50/40",
  FAILED: "bg-rose-50/60",
};

function Column({
  status,
  tasks,
  onStatusChange,
  onSelect,
}: {
  status: TaskStatus;
  tasks: TaskSummary[];
  onStatusChange: (id: string, s: TaskStatus, callApi?: boolean) => void;
  onSelect: (t: TaskSummary) => void;
}) {
  const [dragOver, setDragOver] = useState(false);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(true);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status !== status) {
        // true = also call the API (DnD doesn't go through TaskCard's handleMove)
        onStatusChange(taskId, status, true);
      }
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <TaskStatusBadge status={status} />
        <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs font-semibold text-[var(--muted-foreground)]">
          {tasks.length}
        </span>
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex min-h-[180px] flex-col gap-2 rounded-2xl p-2 transition-colors ${COLUMN_BG[status]} ${
          dragOver ? "ring-2 ring-[var(--primary)] ring-offset-1" : ""
        }`}
      >
        {tasks.length === 0 ? (
          <p className={`my-auto py-6 text-center text-xs transition-opacity ${dragOver ? "opacity-100 text-[var(--primary)]" : "text-[var(--muted-foreground)]/60"}`}>
            {dragOver ? "Drop here" : "—"}
          </p>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={onStatusChange}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── FilterSelect ──────────────────────────────────────────────────────────────

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-full border border-[var(--border)] bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
