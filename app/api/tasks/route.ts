import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth";

const createSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  agentId: z.string().optional(),
  spaceId: z.string().optional(),
  input: z.record(z.unknown()).optional(),
});

const TASK_LIMIT_DEFAULT = 200;
const TASK_LIMIT_MAX = 500;
const ACTIVE_STATUSES = ["QUEUED", "RUNNING", "BLOCKED", "REVIEW"] as const;

export async function GET(req: NextRequest) {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const agentId = searchParams.get("agentId");
  const spaceId = searchParams.get("spaceId");
  // ?active=true returns only non-terminal tasks for lighter polling
  const activeOnly = searchParams.get("active") === "true";
  // ?includeArchived=true includes tasks where archivedAt is set
  const includeArchived = searchParams.get("includeArchived") === "true";

  const rawLimit = parseInt(searchParams.get("limit") ?? String(TASK_LIMIT_DEFAULT), 10);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), TASK_LIMIT_MAX) : TASK_LIMIT_DEFAULT;

  const where = {
    ...(activeOnly
      ? { status: { in: [...ACTIVE_STATUSES] as ("QUEUED" | "RUNNING" | "BLOCKED" | "REVIEW" | "DONE" | "FAILED")[] } }
      : status
        ? { status: status as "QUEUED" | "RUNNING" | "BLOCKED" | "REVIEW" | "DONE" | "FAILED" }
        : {}),
    ...(agentId ? { agentId } : {}),
    ...(spaceId ? { spaceId } : {}),
    // Exclude archived tasks unless explicitly requested
    ...(!includeArchived ? { archivedAt: null } : {}),
  };

  const [tasks, total] = await Promise.all([
    db.agentTask.findMany({
      where,
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: limit,
      include: {
        agent: { select: { id: true, name: true, type: true, environment: true } },
        space: { select: { id: true, name: true, color: true } },
        _count: { select: { logs: true } },
      },
    }),
    db.agentTask.count({ where }),
  ]);

  return NextResponse.json({ tasks, total, limit, hasMore: total > limit });
}

export async function POST(req: NextRequest) {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const task = await db.agentTask.create({
    data: parsed.data,
    include: {
      agent: { select: { id: true, name: true, type: true } },
      space: { select: { id: true, name: true, color: true } },
    },
  });

  return NextResponse.json(task, { status: 201 });
}
