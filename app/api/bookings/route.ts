import { requireAdminApiSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await requireAdminApiSession();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookings = await db.booking.findMany({
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
}
