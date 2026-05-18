import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { intakePayloadSchema, agencyPackageSchema } from "@/lib/validators";

describe("intake validators", () => {
  it("accepts a minimal valid payload", () => {
    const result = intakePayloadSchema.parse({
      name: "Dr. A",
      clinic: "Test Dental",
      phone: "0812345678",
    });
    expect(result.name).toBe("Dr. A");
    expect(result.packageInterest).toBe("unsure");
  });

  it("accepts a full payload", () => {
    const result = intakePayloadSchema.parse({
      name: "Dr. B",
      clinic: "Med Spa Pro",
      phone: "0898765432",
      email: "b@medspa.com",
      lineId: "@medspa",
      packageInterest: "growth",
      message: "ปัจจุบันรับ lead จาก LINE OA วันละ ~10 ราย",
    });
    expect(result.email).toBe("b@medspa.com");
    expect(result.packageInterest).toBe("growth");
  });

  it("rejects missing name", () => {
    expect(() =>
      intakePayloadSchema.parse({ clinic: "X", phone: "0812345678" }),
    ).toThrow();
  });

  it("rejects too-short phone", () => {
    expect(() =>
      intakePayloadSchema.parse({ name: "A", clinic: "X", phone: "123" }),
    ).toThrow();
  });

  it("rejects invalid email when provided", () => {
    expect(() =>
      intakePayloadSchema.parse({
        name: "A",
        clinic: "X",
        phone: "0812345678",
        email: "not-an-email",
      }),
    ).toThrow();
  });

  it("treats empty email as valid (optional)", () => {
    const result = intakePayloadSchema.parse({
      name: "A",
      clinic: "X",
      phone: "0812345678",
      email: "",
    });
    expect(result.email).toBe("");
  });

  it("accepts all package values", () => {
    for (const pkg of ["starter", "growth", "scale", "unsure"] as const) {
      expect(agencyPackageSchema.parse(pkg)).toBe(pkg);
    }
  });

  it("rejects unknown package", () => {
    expect(() => agencyPackageSchema.parse("enterprise")).toThrow();
  });
});

describe("notification helper", () => {
  it("does not throw when webhook URL is undefined", async () => {
    const { notifyAdminLead } = await import("@/lib/notifications");
    await expect(
      notifyAdminLead(
        {
          source: "agency-intake",
          leadId: "test",
          name: "Test",
          email: null,
          dashboardUrl: "http://localhost:3000/dashboard/leads",
        },
        undefined,
      ),
    ).resolves.toBeUndefined();
  });

  it("posts to the webhook URL when provided", async () => {
    const calls: Array<{ url: string; body: string }> = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
      calls.push({ url: String(url), body: String(init?.body ?? "") });
      return new Response("ok", { status: 200 });
    }) as typeof fetch;

    try {
      const { notifyAdminLead } = await import("@/lib/notifications");
      await notifyAdminLead(
        {
          source: "agency-intake",
          leadId: "lead_xyz",
          name: "Dr. C",
          email: null,
          clinic: "Test Clinic",
          phone: "0812345678",
          dashboardUrl: "http://localhost:3000/dashboard/leads",
        },
        "https://example.com/webhook",
      );

      expect(calls).toHaveLength(1);
      expect(calls[0].url).toBe("https://example.com/webhook");
      const parsed = JSON.parse(calls[0].body);
      expect(parsed.event).toBe("admin.lead.created");
      expect(parsed.leadId).toBe("lead_xyz");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("uses Slack-style payload for slack webhooks", async () => {
    const calls: Array<{ body: string }> = [];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = (async (_url: string | URL | Request, init?: RequestInit) => {
      calls.push({ body: String(init?.body ?? "") });
      return new Response("ok", { status: 200 });
    }) as typeof fetch;

    try {
      const { notifyAdminLead } = await import("@/lib/notifications");
      await notifyAdminLead(
        {
          source: "agency-intake",
          leadId: "lead_slack",
          name: "Dr. D",
          email: null,
          clinic: "Slack Clinic",
          dashboardUrl: "http://localhost:3000/dashboard/leads",
        },
        "https://hooks.slack.com/services/T00/B00/XYZ",
      );

      expect(calls).toHaveLength(1);
      const parsed = JSON.parse(calls[0].body);
      expect(parsed.text).toContain("New lead from agency-intake");
      expect(parsed.text).toContain("Slack Clinic");
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
