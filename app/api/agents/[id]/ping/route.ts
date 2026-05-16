import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const agent = await db.agentRegistry.findUnique({
    where: { id },
    select: { id: true, name: true, environment: true, endpoint: true },
  });

  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (agent.environment === "LOCAL" || !agent.endpoint) {
    return NextResponse.json({ reachable: true, latencyMs: null, note: "Local agent — no ping needed" });
  }

  const start = Date.now();
  let reachable = false;
  let statusCode: number | null = null;
  let error: string | null = null;

  try {
    const res = await fetch(agent.endpoint, {
      method: "HEAD",
      signal: AbortSignal.timeout(5000),
    });
    reachable = res.ok || res.status < 500;
    statusCode = res.status;
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  const latencyMs = Date.now() - start;
  return NextResponse.json({ reachable, latencyMs, statusCode, error });
}
