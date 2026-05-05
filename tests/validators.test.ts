import { describe, expect, it } from "vitest";
import {
  bookingPayloadSchema,
  chatRequestSchema,
  leadPayloadSchema,
  leadStatusSchema,
} from "@/lib/validators";

describe("chatRequestSchema", () => {
  it("accepts a valid request", () => {
    const result = chatRequestSchema.safeParse({
      sessionToken: "valid-session-token-123",
      message: "Hello, I need help",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when sessionToken is too short", () => {
    const result = chatRequestSchema.safeParse({ sessionToken: "short", message: "Hi" });
    expect(result.success).toBe(false);
  });

  it("rejects empty message", () => {
    const result = chatRequestSchema.safeParse({
      sessionToken: "valid-session-token-123",
      message: "   ",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing message", () => {
    const result = chatRequestSchema.safeParse({ sessionToken: "valid-session-token-123" });
    expect(result.success).toBe(false);
  });
});

describe("bookingPayloadSchema", () => {
  it("accepts a valid booking payload", () => {
    const result = bookingPayloadSchema.safeParse({
      leadId: "clxyz123",
      datetime: "2026-05-10T10:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing leadId", () => {
    const result = bookingPayloadSchema.safeParse({ datetime: "2026-05-10T10:00:00.000Z" });
    expect(result.success).toBe(false);
  });

  it("rejects empty leadId", () => {
    const result = bookingPayloadSchema.safeParse({ leadId: "", datetime: "2026-05-10T10:00:00.000Z" });
    expect(result.success).toBe(false);
  });

  it("rejects non-ISO datetime string", () => {
    const result = bookingPayloadSchema.safeParse({ leadId: "clxyz123", datetime: "May 10, 2026" });
    expect(result.success).toBe(false);
  });

  it("rejects missing datetime", () => {
    const result = bookingPayloadSchema.safeParse({ leadId: "clxyz123" });
    expect(result.success).toBe(false);
  });
});

describe("leadStatusSchema", () => {
  const validStatuses = ["NEW", "QUALIFIED", "BOOKED", "FOLLOW_UP", "CLOSED"];

  it.each(validStatuses)("accepts %s as a valid status", (status) => {
    expect(leadStatusSchema.safeParse(status).success).toBe(true);
  });

  it("rejects an unknown status string", () => {
    expect(leadStatusSchema.safeParse("PENDING").success).toBe(false);
  });

  it("rejects lowercase status", () => {
    expect(leadStatusSchema.safeParse("new").success).toBe(false);
  });
});

describe("leadPayloadSchema", () => {
  it("accepts a complete lead payload", () => {
    const result = leadPayloadSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      service: "AI Automation",
      budget: 15000,
    });
    expect(result.success).toBe(true);
  });

  it("accepts a minimal lead payload with no optional fields", () => {
    const result = leadPayloadSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = leadPayloadSchema.safeParse({ email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects negative budget", () => {
    const result = leadPayloadSchema.safeParse({ budget: -500 });
    expect(result.success).toBe(false);
  });
});
