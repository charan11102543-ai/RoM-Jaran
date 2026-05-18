import "server-only";

export interface AdminLeadNotification {
  source: "agency-intake" | "chat" | "api" | string;
  sourcePage?: string | null;
  createdAt: string;
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

function isDiscordWebhook(url: string): boolean {
  return /discord(?:app)?\.com\/api\/webhooks/i.test(url);
}

function isSlackWebhook(url: string): boolean {
  return /hooks\.slack\.com/i.test(url);
}

function truncate(value: string, maxLength: number): string {
  return value.length > maxLength ? `${value.slice(0, maxLength - 3)}...` : value;
}

function buildDiscordPayload(n: AdminLeadNotification) {
  const fields = [
    { name: "Clinic / Business", value: n.clinic || n.name || "Not provided", inline: true },
    { name: "Contact", value: [n.phone, n.lineId && `LINE: ${n.lineId}`, n.email].filter(Boolean).join("\n") || "Not provided", inline: true },
    { name: "Package", value: n.packageInterest || "Not specified", inline: true },
    { name: "Source", value: [n.source, n.sourcePage].filter(Boolean).join("\n") || "Unknown", inline: false },
    { name: "Pain point / Message", value: truncate(n.message || "No message provided", 900), inline: false },
    { name: "Lead dashboard", value: n.dashboardUrl, inline: false },
  ];

  return {
    content: `New intake lead: **${n.clinic || n.name || "Unknown clinic"}**`,
    embeds: [
      {
        title: "New Lead Notification",
        color: 0x0f766e,
        fields,
        timestamp: n.createdAt,
      },
    ],
    allowed_mentions: { parse: [] },
  };
}

function buildSlackPayload(n: AdminLeadNotification) {
  const lines = [
    `*New lead from ${n.source}*`,
    `Time: ${n.createdAt}`,
    n.sourcePage && `Source page: ${n.sourcePage}`,
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

  const body = isDiscordWebhook(webhookUrl)
    ? buildDiscordPayload(notification)
    : isSlackWebhook(webhookUrl)
      ? buildSlackPayload(notification)
      : { event: "admin.lead.created", ...notification };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error("Admin notify failed", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("Admin notify error", err);
  }
}
