import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth";
import { isPrismaNotFound } from "@/lib/prisma-errors";

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  agentIds: z.array(z.string()).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const space = await db.space.findUnique({
    where: { id },
    include: {
      _count: { select: { tasks: true } },
      agents: {
        include: {
          agent: { select: { id: true, name: true, type: true, environment: true, isActive: true } },
        },
      },
      tasks: {
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        select: { id: true, title: true, status: true, priority: true, agentId: true },
        take: 50,
      },
    },
  });

  if (!space) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(space);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { agentIds, ...rest } = parsed.data;

  let space;
  try {
    space = await db.space.update({
      where: { id },
      data: {
        ...rest,
        ...(agentIds !== undefined && {
          agents: {
            deleteMany: {},
            create: agentIds.map((agentId) => ({ agentId })),
          },
        }),
      },
      include: {
        _count: { select: { tasks: true } },
        agents: {
          include: {
            agent: { select: { id: true, name: true, type: true, environment: true, isActive: true } },
          },
        },
      },
    });
  } catch (err) {
    if (isPrismaNotFound(err)) return NextResponse.json({ error: "Space not found" }, { status: 404 });
    throw err;
  }

  return NextResponse.json(space);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await db.space.delete({ where: { id } });
  } catch (err) {
    if (isPrismaNotFound(err)) return NextResponse.json({ error: "Space not found" }, { status: 404 });
    throw err;
  }
  return new NextResponse(null, { status: 204 });
}
