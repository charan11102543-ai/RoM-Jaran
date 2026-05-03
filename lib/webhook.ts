import "server-only";

export async function sendWebhookEvent(url: string, payload: Record<string, unknown>) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error("Webhook failed", response.status, await response.text());
    }
  } catch (error) {
    console.error("Webhook request error", error);
  }
}
