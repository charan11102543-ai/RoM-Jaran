export const dynamic = "force-dynamic";

import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        booking: true,
      },
    });

    return Response.json({ leads });
  } catch (error) {
    console.error("Leads fetch error:", error);
    return Response.json({ error: "Unable to fetch leads" }, { status: 500 });
  }
}
