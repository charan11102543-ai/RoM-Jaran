import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdminApiSession } from "@/lib/auth";

const TERMINAL_STATUSES = ["DONE", "FAILED"] as const;
const DEFAULT_THRESHOLD_DAYS = 7;

const archiveSchema = z.object({
  // Archive tasks older than this many days (default: 7)
  olderThanDays: z.coerce.number().int().positive().default(DEFAULT_THRESHOLD_DAYS),
  // Only archive these statuses (default: DONE + FAILED)
  statuses: z
    .array(z.enum(["DONE", "FAILED"]))
    .min(1)
    .default([...TERMINAL_STATUSES]),
  // Dry-run: count what would be archived without changing anything
  dryRun: z.boolean().default(false),
});

/** POST /api/tasks/archive — archive terminal tasks older than N days */
export async function POST(req: NextRequest) {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const parsed = archiveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { olderThanDays, statuses, dryRun } = parsed.data;
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

  const where = {
    status: { in: statuses as ("DONE" | "FAILED")[] },
    archivedAt: null,
    updatedAt: { lt: cutoff },
  };

  if (dryRun) {
    const count = await db.agentTask.count({ where });
    return NextResponse.json({ dryRun: true, wouldArchive: count, cutoff });
  }

  const result = await db.agentTask.updateMany({
    where,
    data: { archivedAt: new Date() },
  });

  return NextResponse.json({ archived: result.count, cutoff });
}

/** DELETE /api/tasks/archive — permanently delete already-archived tasks */
export async function DELETE(req: NextRequest) {
  const session = await requireAdminApiSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db.agentTask.deleteMany({
    where: { archivedAt: { not: null } },
  });

  return NextResponse.json({ deleted: result.count });
}
