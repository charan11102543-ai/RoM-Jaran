import { ChatRole } from "@prisma/client";
import { generateLeadAssistantReply } from "@/lib/ai";
import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { getNextAction, determineLeadStatus } from "@/lib/qualification";
import { chatRequestSchema } from "@/lib/validators";
import { sendWebhookEvent } from "@/lib/webhook";

export async function POST(request: Request) {
  try {
    const body = chatRequestSchema.parse(await request.json());
    const env = getEnv();

    const session =
      (await db.chatSession.findUnique({
        where: { sessionToken: body.sessionToken },
        include: {
          lead: true,
          messages: {
            orderBy: { createdAt: "asc" },
            take: 12,
          },
        },
      })) ??
      (await db.chatSession.create({
        data: { sessionToken: body.sessionToken },
        include: {
          lead: true,
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      }));

    const history = session.messages
      .map((message) => ({
        role:
          message.role === ChatRole.ASSISTANT
            ? ("assistant" as const)
            : message.role === ChatRole.SYSTEM
              ? ("system" as const)
              : ("user" as const),
        content: message.content,
      }))
      .concat({ role: "user" as const, content: body.message });

    const aiResult = await generateLeadAssistantReply({
      history,
      existingLead: session.lead
        ? {
            name: session.lead.name,
            service: session.lead.service,
            budget: session.lead.budget,
          }
        : null,
    });

    await db.chatMessage.create({
      data: {
        sessionId: session.id,
        role: ChatRole.USER,
        content: body.message,
      },
    });

    const nextLeadData = {
      name: aiResult.data.name ?? session.lead?.name ?? null,
      service: aiResult.data.service ?? session.lead?.service ?? null,
      budget: aiResult.data.budget ?? session.lead?.budget ?? null,
      conversationSummary: body.message,
    };

    const nextStatus = determineLeadStatus({
      service: nextLeadData.service,
      budget: nextLeadData.budget,
      currentStatus: session.lead?.status,
      threshold: env.QUALIFICATION_BUDGET_THRESHOLD,
    });

    let lead = session.lead;
    let createdLead = false;

    if (!lead) {
      lead = await db.lead.create({
        data: {
          ...nextLeadData,
          status: nextStatus,
          chatSessions: {
            connect: { id: session.id },
          },
        },
      });
      createdLead = true;
    } else {
      lead = await db.lead.update({
        where: { id: lead.id },
        data: {
          name: nextLeadData.name,
          service: nextLeadData.service,
          budget: nextLeadData.budget,
          conversationSummary: body.message,
          status: nextStatus,
        },
      });
    }

    if (!session.leadId) {
      await db.chatSession.update({
        where: { id: session.id },
        data: { leadId: lead.id },
      });
    }

    await db.chatMessage.create({
      data: {
        sessionId: session.id,
        role: ChatRole.ASSISTANT,
        content: aiResult.message,
        extractedJson: aiResult.data,
      },
    });

    if (createdLead) {
      await sendWebhookEvent(env.WEBHOOK_URL, {
        event: "lead.created",
        lead,
        source: "chat",
      });
    }

    return Response.json({
      message: aiResult.message,
      data: aiResult.data,
      leadId: lead.id,
      status: lead.status.toLowerCase().replace("_", "-"),
      nextAction: getNextAction({
        status: lead.status,
        preferredDateTime: aiResult.data.datetime,
      }),
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Unable to process chat request." }, { status: 400 });
  }
}
