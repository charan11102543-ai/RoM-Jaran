"use client";

import { startTransition, useState } from "react";
import type { TaskSummary, TaskStatus } from "./types";
import { TaskStatusBadge, PriorityLabel, TASK_STATUSES } from "./task-status-badge";
import { AgentTypeBadge, EnvBadge } from "./agent-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  task: TaskSummary;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  onSelect?: (task: TaskSummary) => void;
  /** drag-and-drop: called when this card is dragged */
  onDragStart?: (taskId: string) => void;
}

export function TaskCard({ task, onStatusChange, onSelect, onDragStart }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [moving, setMoving] = useState(false);

  async function handleMove(status: TaskStatus) {
    if (moving) return;
    setMoving(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        startTransition(() => onStatusChange?.(task.id, status));
      }
    } finally {
      setMoving(false);
    }
  }

  const nextStatuses = TASK_STATUSES.filter((s) => s !== task.status);

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("taskId", task.id);
        e.dataTransfer.effectAllowed = "move";
        onDragStart?.(task.id);
      }}
      className={cn(
        "cursor-grab rounded-2xl border border-[var(--border)] bg-white/90 p-3.5 shadow-sm transition-all hover:shadow-md active:cursor-grabbing active:opacity-75",
        task.status === "BLOCKED" && "border-amber-200 bg-amber-50/50",
        task.status === "FAILED" && "border-rose-200 bg-rose-50/50",
        task.status === "DONE" && "opacity-60",
        task.status === "RUNNING" && "border-blue-200",
        moving && "opacity-50",
      )}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <button
          className="flex-1 text-left"
          onClick={() => onSelect?.(task)}
        >
          <p className="text-sm font-semibold text-[var(--foreground)] leading-snug">{task.title}</p>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          className="shrink-0 rounded-lg p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
          aria-label="Toggle actions"
        >
          {expanded ? "▲" : "▾"}
        </button>
      </div>

      {task.description && !expanded && (
        <p className="mt-1 text-xs text-[var(--muted-foreground)] line-clamp-2">{task.description}</p>
      )}

      {/* Badges */}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <PriorityLabel priority={task.priority} />
        {task._count.logs > 0 && (
          <span className="text-xs text-[var(--muted-foreground)]">· {task._count.logs} logs</span>
        )}
      </div>

      {task.agent && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <AgentTypeBadge type={task.agent.type} />
          <EnvBadge environment={task.agent.environment} />
        </div>
      )}

      {task.space && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <span
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: task.space.color }}
          />
          <span className="text-xs text-[var(--muted-foreground)]">{task.space.name}</span>
        </div>
      )}

      {task.errorMsg && (
        <p className="mt-2 rounded-lg bg-rose-50 px-2 py-1.5 text-xs text-rose-700 line-clamp-2">
          {task.errorMsg}
        </p>
      )}

      {/* Expanded action buttons */}
      {expanded && (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-[var(--border)] pt-3">
          {nextStatuses.map((s) => (
            <Button
              key={s}
              size="sm"
              variant="outline"
              disabled={moving}
              onClick={() => handleMove(s)}
              className="text-xs"
            >
              → {s.replace("_", " ")}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
