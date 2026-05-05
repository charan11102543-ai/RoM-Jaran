export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const leadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().nullable(),
  service: z.string().min(1),
  budget: z.number().positive(),
  status: z.enum(["NEW", "QUALIFIED", "BOOKED", "FOLLOW_UP", "CLOSED"]).optional(),
  conversationSummary: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = leadSchema.parse(body);

    const lead = await prisma.lead.create({
      data: {
        name: validated.name,
        email: validated.email || null,
        service: validated.service,
        budget: validated.budget,
        status: validated.status || "NEW",
        conversationSummary: validated.conversationSummary || null,
      },
    });

    // Trigger webhook if configured
    if (process.env.WEBHOOK_URL) {
      try {
        await fetch(process.env.WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "lead.created",
            lead,
          }),
        });
      } catch (error) {
        console.error("Webhook error:", error);
      }
    }

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    console.error("Lead creation error:", error);
    return NextResponse.json(
      {
        error: "Failed to create lead",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json(leads);
  } catch (error) {
    console.error("Get leads error:", error);
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: 500 }
    );
  }
}
