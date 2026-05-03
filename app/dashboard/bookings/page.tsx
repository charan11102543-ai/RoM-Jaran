import { BookingsTable } from "@/components/dashboard/bookings-table";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const bookings = await db.booking.findMany({
    include: {
      lead: {
        select: {
          name: true,
          service: true,
        },
      },
    },
    orderBy: { datetime: "asc" },
  });

  return <BookingsTable bookings={bookings} />;
}
