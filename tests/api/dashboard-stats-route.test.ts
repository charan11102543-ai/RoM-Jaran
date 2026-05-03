import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdminApiSession = vi.fn();
const getDashboardStats = vi.fn();

vi.mock("@/lib/auth", () => ({
  requireAdminApiSession,
}));

vi.mock("@/lib/stats", () => ({
  getDashboardStats,
}));

describe("GET /api/dashboard/stats", () => {
  beforeEach(() => {
    vi.resetModules();
    requireAdminApiSession.mockReset();
    getDashboardStats.mockReset();
  });

  it("returns unauthorized without a session", async () => {
    requireAdminApiSession.mockResolvedValue(null);
    const { GET } = await import("@/app/api/dashboard/stats/route");
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns stats for authenticated admins", async () => {
    requireAdminApiSession.mockResolvedValue({ user: { id: "admin" } });
    getDashboardStats.mockResolvedValue({
      totalLeads: 10,
      qualifiedLeads: 5,
      bookedLeads: 3,
      conversionRate: 0.3,
    });

    const { GET } = await import("@/app/api/dashboard/stats/route");
    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      totalLeads: 10,
      qualifiedLeads: 5,
      bookedLeads: 3,
      conversionRate: 0.3,
    });
  });
});
