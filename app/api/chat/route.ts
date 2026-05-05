export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateUUID } from "@/lib/utils";
import { env } from "@/lib/env";
import { sendWebhookEvent } from "@/lib/webhook";
import { determineLeadStatus, getNextAction } from "@/lib/qualification";
import { z } from "zod";

const chatSchema = z.object({
  message: z.string().min(1),
  sessionToken: z.string().optional(),
});

// Initialize OpenAI
const openaiApiKey = env.OPENAI_API_KEY;
const openaiModel = env.OPENAI_MODEL;

async function extractLeadInfo(messages: Array<{ role: string; content: string }>) {
  try {
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: openaiModel,
        messages: [
          {
            role: "system",
            content: `You are a lead qualification assistant. Extract the following information from the conversation:
- name: Person's full name
- service: Service they're interested in
- budget: Budget in THB (numeric only)
- datetime: Preferred appointment date/time

Return ONLY valid JSON without markdown formatting, with null for missing fields.
Example: {"name":"John Doe","service":"Web Design","budget":50000,"datetime":"2025-05-15 14:00"}`,
          },
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || "{}";

    // Try to parse JSON response
    try {
      const parsed = JSON.parse(content);
      return {
        name: parsed.name || null,
        service: parsed.service || null,
        budget: parsed.budget ? parseInt(parsed.budget) : null,
        datetime: parsed.datetime || null,
      };
    } catch {
      return {
        name: null,
        service: null,
        budget: null,
        datetime: null,
      };
    }
  } catch (error) {
    console.error("OpenAI extraction error:", error);
    return {
      name: null,
      service: null,
      budget: null,
      datetime: null,
    };
  }
}

async function generateAIResponse(
  messages: Array<{ role: string; content: string }>,
  extractedData: any
) {
  try {
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY not configured");
    }

    const systemPrompt = `You are a friendly and professional lead qualification assistant for a business services company. 
Your goal is to:
1. Collect lead information: name, service needed, budget, and preferred appointment time
2. Qualify the lead based on their needs and budget
3. Be conversational and helpful

If you have their name, service, and budget, offer to book an appointment.
Keep responses concise (1-2 sentences).`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: openaiModel,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages.map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    return data.choices[0]?.message?.content || "How can I help you today?";
  } catch (error) {
    console.error("OpenAI response error:", error);
    return "I apologize for the technical issue. Please try again.";
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = chatSchema.parse(body);

    let sessionToken = validated.sessionToken;
    let session;

    // Find or create session
    if (sessionToken) {
      session = await prisma.chatSession.findUnique({
        where: { sessionToken },
        include: { messages: true },
      });
    }

    if (!session) {
      sessionToken = generateUUID();
      session = await prisma.chatSession.create({
        data: {
          sessionToken,
          messages: {
            create: {
              role: "SYSTEM",
              content: "Chat session initiated",
            },
          },
        },
        include: { messages: true },
      });
    }

    // Store user message
    await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "USER",
        content: validated.message,
      },
    });

    // Get conversation history
    const history = await prisma.chatMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: "asc" },
    });

    const messages = history.map((m: { role: string; content: string }) => ({
      role: m.role === "ASSISTANT" ? "assistant" : "user",
      content: m.content,
    }));

    // Extract lead data
    const extractedData = await extractLeadInfo(messages);

    // Generate AI response
    const aiResponse = await generateAIResponse(messages, extractedData);

    // Store AI response
    const savedMessage = await prisma.chatMessage.create({
      data: {
        sessionId: session.id,
        role: "ASSISTANT",
        content: aiResponse,
        extractedJson: extractedData,
      },
    });

    // Check if we have enough data to create lead
    let leadId = null;
    let leadStatus = "new";
    let nextAction: "collect_info" | "offer_booking" | "confirm_booking" = "collect_info";

    if (extractedData.name && extractedData.service && extractedData.budget) {
      if (!session.leadId) {
        // Create lead with qualification logic
        const status = determineLeadStatus({
          service: extractedData.service,
          budget: extractedData.budget,
          threshold: env.QUALIFICATION_BUDGET_THRESHOLD,
        });

        const lead = await prisma.lead.create({
          data: {
            name: extractedData.name,
            service: extractedData.service,
            budget: extractedData.budget,
            status,
            conversationSummary: aiResponse,
          },
        });

        // Update session with lead
        await prisma.chatSession.update({
          where: { id: session.id },
          data: { leadId: lead.id },
        });

        leadId = lead.id;
        leadStatus = lead.status.toLowerCase();

        // Trigger webhook if configured
        await sendWebhookEvent(env.WEBHOOK_URL, {
          event: "lead.created",
          lead: {
            id: lead.id,
            name: lead.name,
            service: lead.service,
            budget: lead.budget,
            status: lead.status,
          },
        });

        nextAction = getNextAction({
          status: lead.status,
          preferredDateTime: extractedData.datetime,
        });
      } else {
        // Get existing lead for next action
        const existingLead = await prisma.lead.findUnique({
          where: { id: session.leadId },
        });

        leadId = session.leadId;
        leadStatus = existingLead?.status.toLowerCase() || "new";
        nextAction = getNextAction({
          status: existingLead?.status || "NEW",
          preferredDateTime: extractedData.datetime,
        });
      }
    }

    return NextResponse.json({
      message: aiResponse,
      data: extractedData,
      leadId,
      status: leadStatus,
      nextAction,
      sessionToken,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      {
        error: "Failed to process chat message",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
