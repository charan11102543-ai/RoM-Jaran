import "server-only";

export interface AdminLeadNotification {
  source: "agency-intake" | "chat" | "api" | string;
  name: string | null;
  email: string | null;
  phone?: string | null;
  clinic?: string | null;
  lineId?: string | null;
  packageInterest?: string | null;
  message?: string | null;
  leadId: string;
  dashboardUrl: string;
}

function isSlackWebhook(url: string): boolean {
  return /hooks\.slack\.com|discord(?:app)?\.com\/api\/webhooks/i.test(url);
}

function buildSlackPayload(n: AdminLeadNotification) {
  const lines = [
    `*New lead from ${n.source}*`,
    n.name && `Name: ${n.name}`,
    n.clinic && `Clinic: ${n.clinic}`,
    n.phone && `Phone: ${n.phone}`,
    n.lineId && `LINE: ${n.lineId}`,
    n.email && `Email: ${n.email}`,
    n.packageInterest && `Package: ${n.packageInterest}`,
    n.message && `Note: ${n.message}`,
    `Lead: ${n.dashboardUrl}`,
  ].filter(Boolean);
  return { text: lines.join("\n"), content: lines.join("\n") };
}

export async function notifyAdminLead(
  notification: AdminLeadNotification,
  webhookUrl: string | undefined,
): Promise<void> {
  if (!webhookUrl) return;

  const body = isSlackWebhook(webhookUrl)
    ? buildSlackPayload(notification)
    : { event: "admin.lead.created", ...notification };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("Admin notify failed", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("Admin notify error", err);
  }
}
