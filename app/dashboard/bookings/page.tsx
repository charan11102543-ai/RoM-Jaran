import { BookingsTable } from "@/components/dashboard/bookings-table";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const bookings = await prisma.booking.findMany({
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
