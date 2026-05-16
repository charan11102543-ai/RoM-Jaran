import { requireAdminApiSession } from "@/lib/auth";
import { getDashboardStats } from "@/lib/stats";

export async function GET() {
  const session = await requireAdminApiSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const stats = await getDashboardStats();
  return Response.json(stats);
}
