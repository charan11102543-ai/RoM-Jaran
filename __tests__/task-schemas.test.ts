import { describe, it, expect } from "vitest";
import { z } from "zod";

// ── Inline the schemas from route files so tests don't import Next.js server code ──

const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
  agentId: z.string().optional(),
  spaceId: z.string().optional(),
  input: z.record(z.string(), z.unknown()).optional(),
});

const statusSchema = z.object({
  status: z.enum(["QUEUED", "RUNNING", "BLOCKED", "REVIEW", "DONE", "FAILED"]),
  reviewNote: z.string().optional(),
  errorMsg: z.string().optional(),
  output: z.record(z.string(), z.unknown()).optional(),
});

const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["LEAD_QUALIFIER", "CONTENT_AUTOMATION", "EMAIL_AUTOMATION", "N8N_ORCHESTRATOR", "CRM_MANAGER"]),
  environment: z.enum(["LOCAL", "CLOUD"]).default("LOCAL"),
  description: z.string().optional(),
  endpoint: z.string().url().optional().or(z.literal("")),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const createSpaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  agentIds: z.array(z.string()).optional(),
});

// ── Task creation ──────────────────────────────────────────────────────────────

describe("createTaskSchema", () => {
  it("accepts a minimal task with just a title", () => {
    const result = createTaskSchema.safeParse({ title: "Test task" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.priority).toBe("NORMAL");
    }
  });

  it("rejects empty title", () => {
    expect(createTaskSchema.safeParse({ title: "" }).success).toBe(false);
  });

  it("rejects title over 200 chars", () => {
    expect(createTaskSchema.safeParse({ title: "a".repeat(201) }).success).toBe(false);
  });

  it("accepts all valid priorities", () => {
    for (const p of ["LOW", "NORMAL", "HIGH", "URGENT"]) {
      expect(createTaskSchema.safeParse({ title: "t", priority: p }).success).toBe(true);
    }
  });

  it("rejects unknown priority", () => {
    expect(createTaskSchema.safeParse({ title: "t", priority: "MEDIUM" }).success).toBe(false);
  });

  it("accepts optional agentId and spaceId", () => {
    const result = createTaskSchema.safeParse({
      title: "t",
      agentId: "agent-123",
      spaceId: "space-456",
    });
    expect(result.success).toBe(true);
  });
});

// ── Status transition ──────────────────────────────────────────────────────────

describe("statusSchema", () => {
  it("accepts every valid status", () => {
    for (const s of ["QUEUED", "RUNNING", "BLOCKED", "REVIEW", "DONE", "FAILED"]) {
      expect(statusSchema.safeParse({ status: s }).success).toBe(true);
    }
  });

  it("rejects unknown status", () => {
    expect(statusSchema.safeParse({ status: "PENDING" }).success).toBe(false);
  });

  it("accepts output as a record", () => {
    const result = statusSchema.safeParse({
      status: "DONE",
      output: { result: "ok", count: 5 },
    });
    expect(result.success).toBe(true);
  });

  it("accepts reviewNote for REVIEW transition", () => {
    const result = statusSchema.safeParse({ status: "REVIEW", reviewNote: "Needs manual check" });
    expect(result.success).toBe(true);
  });
});

// ── Agent creation ─────────────────────────────────────────────────────────────

describe("createAgentSchema", () => {
  it("defaults environment to LOCAL", () => {
    const result = createAgentSchema.safeParse({ name: "Bot", type: "LEAD_QUALIFIER" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.environment).toBe("LOCAL");
  });

  it("accepts empty string endpoint (treated as no endpoint)", () => {
    expect(createAgentSchema.safeParse({ name: "Bot", type: "LEAD_QUALIFIER", endpoint: "" }).success).toBe(true);
  });

  it("accepts valid URL endpoint", () => {
    expect(createAgentSchema.safeParse({
      name: "Bot",
      type: "LEAD_QUALIFIER",
      endpoint: "https://agent.example.com/webhook",
    }).success).toBe(true);
  });

  it("rejects invalid URL endpoint", () => {
    expect(createAgentSchema.safeParse({
      name: "Bot",
      type: "LEAD_QUALIFIER",
      endpoint: "not-a-url",
    }).success).toBe(false);
  });

  it("rejects unknown agent type", () => {
    expect(createAgentSchema.safeParse({ name: "Bot", type: "UNKNOWN" }).success).toBe(false);
  });
});

// ── Space creation ─────────────────────────────────────────────────────────────

describe("createSpaceSchema", () => {
  it("accepts minimal name only", () => {
    expect(createSpaceSchema.safeParse({ name: "My Space" }).success).toBe(true);
  });

  it("accepts valid hex color", () => {
    expect(createSpaceSchema.safeParse({ name: "s", color: "#0f766e" }).success).toBe(true);
  });

  it("rejects invalid color format", () => {
    expect(createSpaceSchema.safeParse({ name: "s", color: "teal" }).success).toBe(false);
    expect(createSpaceSchema.safeParse({ name: "s", color: "#xyz" }).success).toBe(false);
  });

  it("accepts agentIds array", () => {
    const result = createSpaceSchema.safeParse({ name: "s", agentIds: ["a1", "a2"] });
    expect(result.success).toBe(true);
  });
});

// ── Pagination response envelope ──────────────────────────────────────────────

const taskListResponseSchema = z.object({
  tasks: z.array(z.unknown()),
  total: z.number().int().nonnegative(),
  limit: z.number().int().positive(),
  hasMore: z.boolean(),
});

describe("taskListResponseSchema", () => {
  it("accepts a valid paginated response", () => {
    const result = taskListResponseSchema.safeParse({
      tasks: [{ id: "t1", title: "Task 1" }],
      total: 1,
      limit: 200,
      hasMore: false,
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty tasks with hasMore=false", () => {
    expect(taskListResponseSchema.safeParse({ tasks: [], total: 0, limit: 200, hasMore: false }).success).toBe(true);
  });

  it("accepts hasMore=true when total exceeds limit", () => {
    expect(taskListResponseSchema.safeParse({ tasks: [], total: 300, limit: 200, hasMore: true }).success).toBe(true);
  });

  it("rejects missing hasMore", () => {
    expect(taskListResponseSchema.safeParse({ tasks: [], total: 0, limit: 200 }).success).toBe(false);
  });
});

// ── isPrismaNotFound ───────────────────────────────────────────────────────────

describe("isPrismaNotFound", () => {
  it("returns true for P2025 error object", async () => {
    const { isPrismaNotFound } = await import("@/lib/prisma-errors");
    expect(isPrismaNotFound({ code: "P2025" })).toBe(true);
  });

  it("returns false for other Prisma codes", async () => {
    const { isPrismaNotFound } = await import("@/lib/prisma-errors");
    expect(isPrismaNotFound({ code: "P2002" })).toBe(false);
  });

  it("returns false for null", async () => {
    const { isPrismaNotFound } = await import("@/lib/prisma-errors");
    expect(isPrismaNotFound(null)).toBe(false);
  });

  it("returns false for plain error", async () => {
    const { isPrismaNotFound } = await import("@/lib/prisma-errors");
    expect(isPrismaNotFound(new Error("oops"))).toBe(false);
  });
});
