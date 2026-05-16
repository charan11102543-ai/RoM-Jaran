import { cn } from "@/lib/utils";
import type { TaskStatus, TaskPriority } from "./types";

const STATUS_STYLES: Record<TaskStatus, string> = {
  QUEUED: "bg-slate-100 text-slate-700",
  RUNNING: "bg-blue-100 text-blue-700 animate-pulse",
  BLOCKED: "bg-amber-100 text-amber-700",
  REVIEW: "bg-violet-100 text-violet-700",
  DONE: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-rose-100 text-rose-700",
};

const STATUS_DOTS: Record<TaskStatus, string> = {
  QUEUED: "bg-slate-400",
  RUNNING: "bg-blue-500",
  BLOCKED: "bg-amber-500",
  REVIEW: "bg-violet-500",
  DONE: "bg-emerald-500",
  FAILED: "bg-rose-500",
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: "text-slate-500",
  NORMAL: "text-slate-700",
  HIGH: "text-amber-600 font-bold",
  URGENT: "text-rose-600 font-bold",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "↓ Low",
  NORMAL: "— Normal",
  HIGH: "↑ High",
  URGENT: "!! Urgent",
};

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold", STATUS_STYLES[status])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOTS[status])} />
      {status.replace("_", " ")}
    </span>
  );
}

export function PriorityLabel({ priority }: { priority: TaskPriority }) {
  return (
    <span className={cn("text-xs", PRIORITY_STYLES[priority])}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export const TASK_STATUSES: TaskStatus[] = ["QUEUED", "RUNNING", "BLOCKED", "REVIEW", "DONE", "FAILED"];
