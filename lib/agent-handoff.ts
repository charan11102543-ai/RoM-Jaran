import "server-only";
import { db } from "@/lib/db";

export interface HandoffPayload {
  taskId: string;
  taskTitle: string;
  taskDescription: string | null;
  taskPriority: string;
  taskInput: unknown;
  agentId: string;
  agentName: string;
  agentType: string;
  spaceId: string | null;
  spaceName: string | null;
  callbackUrl: string;
  triggeredAt: string;
}

export async function dispatchCloudHandoff(
  taskId: string,
  endpoint: string,
): Promise<{ ok: boolean; error?: string }> {
  const task = await db.agentTask.findUnique({
    where: { id: taskId },
    include: {
      agent: { select: { id: true, name: true, type: true } },
      space: { select: { id: true, name: true } },
    },
  });

  if (!task) return { ok: false, error: "Task not found" };

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const payload: HandoffPayload = {
    taskId: task.id,
    taskTitle: task.title,
    taskDescription: task.description,
    taskPriority: task.priority,
    taskInput: task.input,
    agentId: task.agent?.id ?? "",
    agentName: task.agent?.name ?? "",
    agentType: task.agent?.type ?? "",
    spaceId: task.spaceId,
    spaceName: task.space?.name ?? null,
    callbackUrl: `${baseUrl}/api/tasks/${taskId}/status`,
    triggeredAt: new Date().toISOString(),
  };

  let ok = false;
  let errorMsg: string | undefined;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    ok = res.ok;
    if (!res.ok) {
      errorMsg = `HTTP ${res.status}: ${await res.text().catch(() => "")}`;
    }
  } catch (err) {
    errorMsg = err instanceof Error ? err.message : String(err);
  }

  await db.executionLog.create({
    data: {
      taskId,
      level: ok ? "info" : "error",
      message: ok
        ? `Dispatched to cloud agent at ${endpoint}`
        : `Cloud handoff failed: ${errorMsg}`,
      metadata: { endpoint, ok },
    },
  });

  return ok ? { ok: true } : { ok: false, error: errorMsg };
}
