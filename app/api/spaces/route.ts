import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  agentIds: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const spaces = await db.space.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { tasks: true } },
      agents: { include: { agent: { select: { id: true, name: true, type: true, environment: true, isActive: true } } } },
    },
  });

  return NextResponse.json(spaces);
}

export async function POST(req: NextRequest) {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { agentIds, color, ...rest } = parsed.data;
  const space = await db.space.create({
    data: {
      ...rest,
      color: color ?? "#0f766e",
      agents: agentIds?.length
        ? { create: agentIds.map((agentId) => ({ agentId })) }
        : undefined,
    },
    include: {
      agents: { include: { agent: true } },
    },
  });

  return NextResponse.json(space, { status: 201 });
}
