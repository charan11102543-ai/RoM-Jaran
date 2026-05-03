import { describe, expect, it } from "vitest";

function conversionRate(total: number, booked: number) {
  return total === 0 ? 0 : booked / total;
}

describe("stats calculations", () => {
  it("avoids divide-by-zero", () => {
    expect(conversionRate(0, 0)).toBe(0);
  });

  it("computes booked over total", () => {
    expect(conversionRate(10, 4)).toBe(0.4);
  });
});
