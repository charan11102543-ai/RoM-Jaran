import "server-only";
import OpenAI from "openai";
import { getEnv } from "@/lib/env";
import { chatResponseSchema } from "@/lib/validators";

type ConversationTurn = {
  role: "system" | "user" | "assistant";
  content: string;
};

let client: OpenAI | null = null;

function getClient() {
  if (!client) {
    const env = getEnv();
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  return client;
}

export async function generateLeadAssistantReply(input: {
  history: ConversationTurn[];
  existingLead?: {
    name?: string | null;
    service?: string | null;
    budget?: number | null;
  } | null;
}) {
  const env = getEnv();
  const openai = getClient();

  const systemPrompt = [
    "You are an AI sales assistant for AI Automation Hustle.",
    "Your job is to qualify inbound leads and help them book an appointment.",
    "Collect these fields when missing: name, requested service, budget, preferred date/time.",
    "Ask only one or two concise follow-up questions at a time.",
    "If a budget is not clearly numeric, ask for a number instead of guessing.",
    "Return valid JSON only with this shape:",
    '{"message":"assistant reply","data":{"name":string|null,"service":string|null,"budget":number|null,"datetime":string|null}}',
    `Existing lead data: ${JSON.stringify(input.existingLead ?? {})}`,
  ].join(" ");

  const completion = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: systemPrompt }, ...input.history],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsed = chatResponseSchema.parse(JSON.parse(content));
  return parsed;
}
