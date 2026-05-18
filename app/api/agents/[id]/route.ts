import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth";
import { isPrismaNotFound } from "@/lib/prisma-errors";

const patchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  endpoint: z.string().url().optional().or(z.literal("")).optional(),
  isActive: z.boolean().optional(),
  environment: z.enum(["LOCAL", "CLOUD"]).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

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

  let agent;
  try {
    agent = await db.agentRegistry.update({
      where: { id },
      data: parsed.data as Prisma.AgentRegistryUpdateInput,
    });
  } catch (err) {
    if (isPrismaNotFound(err)) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    throw err;
  }

  return NextResponse.json(agent);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  try {
    await db.agentRegistry.delete({ where: { id } });
  } catch (err) {
    if (isPrismaNotFound(err)) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    throw err;
  }
  return new NextResponse(null, { status: 204 });
}
