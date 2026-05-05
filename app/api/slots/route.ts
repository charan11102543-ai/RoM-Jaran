export const dynamic = "force-dynamic";

import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { generateAvailableSlots } from "@/lib/booking";
import { env } from "@/lib/env";

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      where: { status: BookingStatus.CONFIRMED },
      select: { datetime: true },
    });

    const businessDays = env.BUSINESS_DAYS.split(",").map((d) => parseInt(d.trim()));

    const slots = generateAvailableSlots({
      bookedIsoDates: bookings.map((booking) => booking.datetime.toISOString()),
      slotMinutes: env.BOOKING_SLOT_MINUTES,
      businessHoursStart: env.BUSINESS_HOURS_START,
      businessHoursEnd: env.BUSINESS_HOURS_END,
      timezone: env.BUSINESS_TIMEZONE,
      businessDays,
      windowDays: env.BOOKING_WINDOW_DAYS,
    });

    return Response.json({ slots });
  } catch (error) {
    console.error("Slots error:", error);
    return Response.json({ error: "Unable to fetch slots" }, { status: 500 });
  }
}
