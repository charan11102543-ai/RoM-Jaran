export const dynamic = "force-dynamic";

import { requireAdminSession } from "@/lib/auth";
import { getDashboardStats } from "@/lib/stats";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const stats = await getDashboardStats();
    return Response.json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    return Response.json({ error: "Unable to fetch stats" }, { status: 500 });
  }
}
