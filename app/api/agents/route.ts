import { NextRequest, NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["LEAD_QUALIFIER", "CONTENT_AUTOMATION", "EMAIL_AUTOMATION", "N8N_ORCHESTRATOR", "CRM_MANAGER"]),
  environment: z.enum(["LOCAL", "CLOUD"]).default("LOCAL"),
  description: z.string().optional(),
  endpoint: z.string().url().optional().or(z.literal("")),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const agents = await db.agentRegistry.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { tasks: true } },
      spaces: { include: { space: { select: { id: true, name: true, color: true } } } },
    },
  });

  return NextResponse.json(agents);
}

export async function POST(req: NextRequest) {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { endpoint, ...rest } = parsed.data;
  const agent = await db.agentRegistry.create({
    data: { ...rest, endpoint: endpoint || null } as Prisma.AgentRegistryCreateInput,
  });

  return NextResponse.json(agent, { status: 201 });
}
