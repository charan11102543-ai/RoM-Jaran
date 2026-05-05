export const dynamic = "force-dynamic";

import { BookingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { isBusinessDay, isSlotInsideBusinessHours } from "@/lib/booking";
import { bookingPayloadSchema } from "@/lib/validators";
import { sendWebhookEvent } from "@/lib/webhook";

export async function POST(request: Request) {
  try {
    const body = bookingPayloadSchema.parse(await request.json());
    const requestedDate = new Date(body.datetime);

    const businessDays = env.BUSINESS_DAYS.split(",").map((d) => parseInt(d.trim()));

    if (!isBusinessDay(requestedDate, env.BUSINESS_TIMEZONE, businessDays)) {
      return Response.json({ error: "Requested slot is outside business days." }, { status: 400 });
    }

    if (
      !isSlotInsideBusinessHours({
        isoDate: body.datetime,
        businessHoursStart: env.BUSINESS_HOURS_START,
        businessHoursEnd: env.BUSINESS_HOURS_END,
        timezone: env.BUSINESS_TIMEZONE,
      })
    ) {
      return Response.json({ error: "Requested slot is outside business hours." }, { status: 400 });
    }

    const existing = await prisma.booking.findFirst({
      where: {
        datetime: requestedDate,
        status: BookingStatus.CONFIRMED,
      },
    });

    if (existing) {
      return Response.json({ error: "That time slot is already booked." }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        leadId: body.leadId,
        datetime: requestedDate,
        status: BookingStatus.CONFIRMED,
      },
    });

    await prisma.lead.update({
      where: { id: body.leadId },
      data: { status: "BOOKED" },
    });

    await sendWebhookEvent(env.WEBHOOK_URL, {
      event: "booking.created",
      booking,
    });

    return Response.json({ booking }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unable to create booking." }, { status: 400 });
  }
}
