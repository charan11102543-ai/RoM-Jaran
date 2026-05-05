export const dynamic = "force-dynamic";

import { requireAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { datetime: "asc" },
      include: {
        lead: {
          select: {
            name: true,
            service: true,
            status: true,
          },
        },
      },
    });

    return Response.json({ bookings });
  } catch (error) {
    console.error("Bookings fetch error:", error);
    return Response.json({ error: "Unable to fetch bookings" }, { status: 500 });
  }
}
