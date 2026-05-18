import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth";
import { dispatchCloudHandoff } from "@/lib/agent-handoff";
import { isPrismaNotFound } from "@/lib/prisma-errors";

const schema = z.object({
  status: z.enum(["QUEUED", "RUNNING", "BLOCKED", "REVIEW", "DONE", "FAILED"]),
  reviewNote: z.string().optional(),
  errorMsg: z.string().optional(),
  output: z.record(z.string(), z.unknown()).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { status, reviewNote, errorMsg, output } = parsed.data;
  const now = new Date();

  const previous = await db.agentTask.findUnique({
    where: { id },
    select: {
      status: true,
      agent: { select: { environment: true, endpoint: true, name: true } },
    },
  });

  if (!previous) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  // No-op guard: same status → return current task without a DB write or log entry
  if (previous.status === status) {
    const current = await db.agentTask.findUnique({ where: { id } });
    if (!current) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(current);
  }

  let task;
  try {
    task = await db.agentTask.update({
      where: { id },
      data: {
        status,
        reviewNote,
        errorMsg,
        output: output as never,
        startedAt: status === "RUNNING" ? now : undefined,
        completedAt: ["DONE", "FAILED"].includes(status) ? now : undefined,
      },
    });
  } catch (err) {
    if (isPrismaNotFound(err)) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    throw err;
  }

  await db.executionLog.create({
    data: {
      taskId: id,
      level: status === "FAILED" ? "error" : "info",
      message: `Status changed to ${status}`,
      metadata: { previousStatus: previous.status },
    },
  });

  // Cloud handoff: fire-and-forget only on a genuine *transition into* RUNNING.
  // Skip if task was already RUNNING (dedup: prevents double-dispatch on rapid DnD/poll races).
  if (
    status === "RUNNING" &&
    previous.status !== "RUNNING" &&
    previous.agent?.environment === "CLOUD" &&
    previous.agent?.endpoint
  ) {
    dispatchCloudHandoff(id, previous.agent.endpoint).catch(() => {
      // failure is logged inside dispatchCloudHandoff
    });
  }

  return NextResponse.json(task);
}
