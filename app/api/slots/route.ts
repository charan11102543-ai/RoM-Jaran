import { BookingStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { generateAvailableSlots } from "@/lib/booking";
import { getEnv } from "@/lib/env";

export async function GET() {
  const env = getEnv();
  const bookings = await db.booking.findMany({
    where: { status: BookingStatus.CONFIRMED },
    select: { datetime: true },
  });

  const slots = generateAvailableSlots({
    bookedIsoDates: bookings.map((booking) => booking.datetime.toISOString()),
    slotMinutes: env.BOOKING_SLOT_MINUTES,
    businessHoursStart: env.BUSINESS_HOURS_START,
    businessHoursEnd: env.BUSINESS_HOURS_END,
    timezone: env.BUSINESS_TIMEZONE,
    businessDays: env.BUSINESS_DAYS,
    windowDays: env.BOOKING_WINDOW_DAYS,
  });

  return Response.json({ slots });
}
