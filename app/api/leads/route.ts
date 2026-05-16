import { requireAdminApiSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await requireAdminApiSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const leads = await db.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      booking: true,
    },
  });

  return Response.json({ leads });
}
