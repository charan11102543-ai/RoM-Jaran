import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock server-only so it doesn't throw in test environment
vi.mock("server-only", () => ({}));

// Mock the db module
vi.mock("@/lib/db", () => ({
  db: {
    agentTask: {
      findUnique: vi.fn(),
    },
    executionLog: {
      create: vi.fn(),
    },
  },
}));

import { db } from "@/lib/db";
import { dispatchCloudHandoff } from "@/lib/agent-handoff";

const mockDb = db as {
  agentTask: { findUnique: ReturnType<typeof vi.fn> };
  executionLog: { create: ReturnType<typeof vi.fn> };
};

const BASE_TASK = {
  id: "task-1",
  title: "Test Task",
  description: "desc",
  priority: "NORMAL",
  input: { key: "value" },
  spaceId: "space-1",
  agent: { id: "agent-1", name: "Lead Bot", type: "LEAD_QUALIFIER" },
  space: { id: "space-1", name: "Lead Pipeline" },
};

describe("dispatchCloudHandoff", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mockDb.executionLog.create.mockResolvedValue({});
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  });

  it("returns { ok: false } when task is not found", async () => {
    mockDb.agentTask.findUnique.mockResolvedValue(null);

    const result = await dispatchCloudHandoff("task-1", "https://agent.example.com");
    expect(result).toEqual({ ok: false, error: "Task not found" });
  });

  it("calls fetch with correct payload shape", async () => {
    mockDb.agentTask.findUnique.mockResolvedValue(BASE_TASK);

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      text: async () => "",
    });
    vi.stubGlobal("fetch", fetchMock);

    await dispatchCloudHandoff("task-1", "https://agent.example.com/webhook");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("https://agent.example.com/webhook");
    expect(options.method).toBe("POST");

    const body = JSON.parse(options.body as string);
    expect(body.taskId).toBe("task-1");
    expect(body.agentId).toBe("agent-1");
    expect(body.callbackUrl).toBe("http://localhost:3000/api/tasks/task-1/status");
    expect(body.taskInput).toEqual({ key: "value" });

    vi.unstubAllGlobals();
  });

  it("returns { ok: true } on successful HTTP response", async () => {
    mockDb.agentTask.findUnique.mockResolvedValue(BASE_TASK);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => "" }));

    const result = await dispatchCloudHandoff("task-1", "https://agent.example.com/webhook");
    expect(result.ok).toBe(true);
    vi.unstubAllGlobals();
  });

  it("returns { ok: false, error } on HTTP error response", async () => {
    mockDb.agentTask.findUnique.mockResolvedValue(BASE_TASK);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => "Service Unavailable",
    }));

    const result = await dispatchCloudHandoff("task-1", "https://agent.example.com/webhook");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("503");
    vi.unstubAllGlobals();
  });

  it("returns { ok: false, error } on network error", async () => {
    mockDb.agentTask.findUnique.mockResolvedValue(BASE_TASK);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    const result = await dispatchCloudHandoff("task-1", "https://agent.example.com/webhook");
    expect(result.ok).toBe(false);
    expect(result.error).toContain("ECONNREFUSED");
    vi.unstubAllGlobals();
  });

  it("creates an info ExecutionLog on success", async () => {
    mockDb.agentTask.findUnique.mockResolvedValue(BASE_TASK);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => "" }));

    await dispatchCloudHandoff("task-1", "https://agent.example.com/webhook");

    expect(mockDb.executionLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          taskId: "task-1",
          level: "info",
        }),
      }),
    );
    vi.unstubAllGlobals();
  });

  it("creates an error ExecutionLog on failure", async () => {
    mockDb.agentTask.findUnique.mockResolvedValue(BASE_TASK);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("timeout")));

    await dispatchCloudHandoff("task-1", "https://agent.example.com/webhook");

    expect(mockDb.executionLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          taskId: "task-1",
          level: "error",
        }),
      }),
    );
    vi.unstubAllGlobals();
  });

  it("includes triggeredAt as a valid ISO timestamp", async () => {
    mockDb.agentTask.findUnique.mockResolvedValue(BASE_TASK);
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, text: async () => "" });
    vi.stubGlobal("fetch", fetchMock);

    await dispatchCloudHandoff("task-1", "https://agent.example.com/webhook");

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(() => new Date(body.triggeredAt)).not.toThrow();
    expect(new Date(body.triggeredAt).getTime()).toBeGreaterThan(0);
    vi.unstubAllGlobals();
  });
});
