import { determineLeadStatus } from "@/lib/qualification";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { leadPayloadSchema } from "@/lib/validators";
import { sendWebhookEvent } from "@/lib/webhook";

export async function POST(request: Request) {
  try {
    const body = leadPayloadSchema.parse(await request.json());
    const env = getEnv();

    const lead = await db.lead.create({
      data: {
        ...body,
        status: determineLeadStatus({
          service: body.service,
          budget: body.budget,
          threshold: env.QUALIFICATION_BUDGET_THRESHOLD,
        }),
      },
    });

    if (env.WEBHOOK_URL) {
      await sendWebhookEvent(env.WEBHOOK_URL, {
        event: "lead.created",
        lead,
        source: "api",
      });
    }

    return Response.json({ lead }, { status: 201 });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unable to create lead." }, { status: 400 });
  }
}
