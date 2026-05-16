import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth";
import { isPrismaNotFound } from "@/lib/prisma-errors";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const task = await db.agentTask.findUnique({
    where: { id },
    include: {
      agent: { select: { id: true, name: true, type: true, environment: true } },
      space: { select: { id: true, name: true, color: true } },
      _count: { select: { logs: true } },
    },
  });

  if (!task) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(task);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await db.agentTask.delete({ where: { id } });
  } catch (err) {
    if (isPrismaNotFound(err)) return NextResponse.json({ error: "Not found" }, { status: 404 });
    throw err;
  }
  return new NextResponse(null, { status: 204 });
}
