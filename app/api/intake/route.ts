import { db } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { notifyAdminLead } from "@/lib/notifications";
import { intakePayloadSchema } from "@/lib/validators";

const PACKAGE_LABEL: Record<string, string> = {
  starter: "Starter (6,000 THB/เดือน)",
  growth: "Growth (9,500 THB/เดือน)",
  scale: "Scale (15,000 THB/เดือน)",
  unsure: "ยังไม่แน่ใจ — ขอคำแนะนำ",
};

export async function POST(request: Request) {
  let payload: ReturnType<typeof intakePayloadSchema.parse>;
  try {
    payload = intakePayloadSchema.parse(await request.json());
  } catch (error) {
    const message =
      error instanceof Error && "issues" in error
        ? (error as { issues: { message: string }[] }).issues[0]?.message
        : "ข้อมูลไม่ถูกต้อง";
    return Response.json({ error: message ?? "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const env = getEnv();
  const summary = [
    `[Agency Inquiry] ${PACKAGE_LABEL[payload.packageInterest]}`,
    `Clinic: ${payload.clinic}`,
    `Phone: ${payload.phone}`,
    payload.lineId ? `LINE: ${payload.lineId}` : null,
    payload.message ? `\nข้อความ:\n${payload.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const lead = await db.lead.create({
    data: {
      name: payload.name,
      email: payload.email || null,
      service: `Agency: ${PACKAGE_LABEL[payload.packageInterest]}`,
      conversationSummary: summary,
    },
  });

  await notifyAdminLead(
    {
      source: "agency-intake",
      leadId: lead.id,
      name: payload.name,
      email: payload.email || null,
      phone: payload.phone,
      clinic: payload.clinic,
      lineId: payload.lineId || null,
      packageInterest: PACKAGE_LABEL[payload.packageInterest],
      message: payload.message || null,
      dashboardUrl: `${env.NEXTAUTH_URL}/dashboard/leads`,
    },
    env.ADMIN_NOTIFY_WEBHOOK_URL || undefined,
  );

  return Response.json({ ok: true, leadId: lead.id }, { status: 201 });
}
