"use client";

import { useEffect, useRef, useState } from "react";
import type { TaskSummary, ExecutionLogEntry, TaskStatus } from "./types";
import { TaskStatusBadge, PriorityLabel, TASK_STATUSES } from "./task-status-badge";
import { AgentTypeBadge, EnvBadge } from "./agent-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LOG_LEVEL_STYLES: Record<string, string> = {
  debug: "text-slate-400",
  info: "text-blue-600",
  warn: "text-amber-600",
  error: "text-rose-600",
};

function JsonBlock({ data, label }: { data: unknown; label: string }) {
  const [collapsed, setCollapsed] = useState(true);
  if (data == null) return null;

  const pretty = JSON.stringify(data, null, 2);
  const lines = pretty.split("\n").length;

  return (
    <div>
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex items-center gap-2 text-xs uppercase tracking-wider text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        {collapsed ? "▶" : "▼"} {label} ({lines} lines)
      </button>
      {!collapsed && (
        <pre className="mt-2 max-h-48 overflow-auto rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 p-3 font-mono text-xs leading-relaxed">
          {pretty}
        </pre>
      )}
    </div>
  );
}

interface Props {
  task: TaskSummary;
  onClose: () => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
}

export function TaskDetailPanel({ task: initialTask, onClose, onStatusChange }: Props) {
  const [task, setTask] = useState(initialTask);
  const [logs, setLogs] = useState<ExecutionLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsError, setLogsError] = useState("");
  const [reviewNote, setReviewNote] = useState(initialTask.reviewNote ?? "");
  const [saving, setSaving] = useState(false);
  const [fullTask, setFullTask] = useState<(TaskSummary & { input?: unknown; output?: unknown }) | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // fetch full task details (with input/output) and logs
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingLogs(true);
    setLogsError("");
    Promise.all([
      fetch(`/api/tasks/${task.id}/logs`)
        .then((r) => r.ok ? r.json() : Promise.reject(new Error(`${r.status}`)))
        .catch(() => []),
      fetch(`/api/tasks/${task.id}`)
        .then((r) => r.ok ? r.json() : null)
        .catch(() => null),
    ])
      .then(([logsData, taskData]) => {
        setLogs(Array.isArray(logsData) ? logsData : []);
        if (taskData) setFullTask(taskData);
      })
      .catch(() => setLogsError("Failed to load task details"))
      .finally(() => setLoadingLogs(false));
  }, [task.id]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs.length]);

  // sync external task changes back into local state
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTask(initialTask);
  }, [initialTask]);

  async function moveStatus(status: TaskStatus) {
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reviewNote }),
      });
      if (res.ok) {
        onStatusChange?.(task.id, status);
        setTask((t) => ({ ...t, status }));
        setLogs((prev) => [
          ...prev,
          {
            id: `local-${Date.now()}`,
            taskId: task.id,
            level: status === "FAILED" ? "error" : "info",
            message: `Status changed to ${status}`,
            metadata: null,
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setSaving(false);
    }
  }

  // Handle Escape key
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative flex h-full w-full max-w-xl flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center gap-3">
            <TaskStatusBadge status={task.status} />
            <span className="text-xs text-[var(--muted-foreground)]">Task Detail</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            title="Close (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <h3 className="text-xl font-semibold leading-snug">{task.title}</h3>
              {task.description && (
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted-foreground)]">{task.description}</p>
              )}
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap gap-2">
              <TaskStatusBadge status={task.status} />
              <PriorityLabel priority={task.priority} />
            </div>

            {/* Agent */}
            {task.agent && (
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Agent</p>
                <div className="flex flex-wrap items-center gap-2">
                  <AgentTypeBadge type={task.agent.type} />
                  <EnvBadge environment={task.agent.environment} />
                  <span className="text-sm font-medium">{task.agent.name}</span>
                </div>
              </div>
            )}

            {/* Space */}
            {task.space && (
              <div>
                <p className="mb-1.5 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Space</p>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium"
                  style={{ backgroundColor: `${task.space.color}20`, color: task.space.color }}
                >
                  {task.space.name}
                </span>
              </div>
            )}

            {/* Timestamps */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Created</p>
                <p className="mt-0.5">{new Date(task.createdAt).toLocaleString()}</p>
              </div>
              {task.startedAt && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Started</p>
                  <p className="mt-0.5">{new Date(task.startedAt).toLocaleString()}</p>
                </div>
              )}
              {task.completedAt && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Completed</p>
                  <p className="mt-0.5">{new Date(task.completedAt).toLocaleString()}</p>
                </div>
              )}
              {task.startedAt && task.completedAt && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Duration</p>
                  <p className="mt-0.5">
                    {Math.round(
                      (new Date(task.completedAt).getTime() - new Date(task.startedAt).getTime()) / 1000,
                    )}s
                  </p>
                </div>
              )}
            </div>

            {/* Error */}
            {task.errorMsg && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-xs uppercase tracking-wider text-rose-600">Error</p>
                <p className="mt-1 text-sm text-rose-700">{task.errorMsg}</p>
              </div>
            )}

            {/* Input / Output JSON */}
            {fullTask && (
              <div className="space-y-3">
                <JsonBlock data={(fullTask as { input?: unknown }).input} label="Input" />
                <JsonBlock data={(fullTask as { output?: unknown }).output} label="Output" />
              </div>
            )}

            {/* Review note */}
            {(task.status === "REVIEW" || reviewNote) && (
              <div>
                <label className="text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                  Review Note
                </label>
                <textarea
                  className="mt-2 w-full rounded-2xl border border-[var(--border)] bg-[var(--muted)]/40 px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  rows={3}
                  placeholder="Add review notes…"
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />
              </div>
            )}

            {/* Move to */}
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">Move to</p>
              <div className="flex flex-wrap gap-2">
                {TASK_STATUSES.filter((s) => s !== task.status).map((s) => (
                  <Button
                    key={s}
                    size="sm"
                    variant="outline"
                    disabled={saving}
                    onClick={() => moveStatus(s)}
                  >
                    {s.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>

            {/* Execution log */}
            <div>
              <p className="mb-3 text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
                Execution Log
                {logs.length > 0 && (
                  <span className="ml-2 font-normal normal-case opacity-70">({logs.length} entries)</span>
                )}
              </p>
              {loadingLogs ? (
                <div className="space-y-1.5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 animate-pulse rounded bg-[var(--muted)]" />
                  ))}
                </div>
              ) : logsError ? (
                <p className="text-sm text-rose-600">{logsError}</p>
              ) : logs.length === 0 ? (
                <p className="text-sm text-[var(--muted-foreground)]">No logs yet.</p>
              ) : (
                <div className="max-h-72 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--muted)]/30 p-3 font-mono text-xs">
                  <div className="space-y-1">
                    {logs.map((log) => (
                      <div key={log.id} className="flex gap-2">
                        <span className="shrink-0 text-slate-400">
                          {new Date(log.createdAt).toLocaleTimeString()}
                        </span>
                        <span
                          className={cn(
                            "w-10 shrink-0 font-bold uppercase",
                            LOG_LEVEL_STYLES[log.level] ?? "text-slate-600",
                          )}
                        >
                          {log.level}
                        </span>
                        <span className="text-[var(--foreground)]">{log.message}</span>
                      </div>
                    ))}
                    <div ref={logsEndRef} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
