import { describe, expect, it } from "vitest";
import { generateAvailableSlots, isBusinessDay, isSlotInsideBusinessHours } from "@/lib/booking";

describe("isBusinessDay", () => {
  it("returns true for a weekday in the configured business days", () => {
    // 2026-05-04 is a Monday (UTC)
    const monday = new Date("2026-05-04T10:00:00Z");
    expect(isBusinessDay(monday, "Asia/Bangkok", [1, 2, 3, 4, 5])).toBe(true);
  });

  it("returns false for Saturday when only Mon-Fri configured", () => {
    // 2026-05-02 is a Saturday (UTC)
    const saturday = new Date("2026-05-02T10:00:00Z");
    expect(isBusinessDay(saturday, "Asia/Bangkok", [1, 2, 3, 4, 5])).toBe(false);
  });

  it("returns false for Sunday when only Mon-Fri configured", () => {
    const sunday = new Date("2026-05-03T10:00:00Z");
    expect(isBusinessDay(sunday, "Asia/Bangkok", [1, 2, 3, 4, 5])).toBe(false);
  });
});

describe("isSlotInsideBusinessHours", () => {
  it("returns true for slot within business hours (10:00 Bangkok = 03:00 UTC)", () => {
    expect(
      isSlotInsideBusinessHours({
        isoDate: "2026-05-04T03:00:00.000Z",
        businessHoursStart: "09:00",
        businessHoursEnd: "18:00",
        timezone: "Asia/Bangkok",
      })
    ).toBe(true);
  });

  it("returns false for slot before business hours start (07:00 Bangkok = 00:00 UTC)", () => {
    expect(
      isSlotInsideBusinessHours({
        isoDate: "2026-05-04T00:00:00.000Z",
        businessHoursStart: "09:00",
        businessHoursEnd: "18:00",
        timezone: "Asia/Bangkok",
      })
    ).toBe(false);
  });

  it("returns false for slot at or after end of business hours (18:00 Bangkok = 11:00 UTC)", () => {
    expect(
      isSlotInsideBusinessHours({
        isoDate: "2026-05-04T11:00:00.000Z",
        businessHoursStart: "09:00",
        businessHoursEnd: "18:00",
        timezone: "Asia/Bangkok",
      })
    ).toBe(false);
  });
});

describe("generateAvailableSlots", () => {
  it("returns an empty array when windowDays is 0", () => {
    const slots = generateAvailableSlots({
      bookedIsoDates: [],
      slotMinutes: 60,
      businessHoursStart: "09:00",
      businessHoursEnd: "18:00",
      timezone: "Asia/Bangkok",
      businessDays: [1, 2, 3, 4, 5],
      windowDays: 0,
    });
    expect(slots).toHaveLength(0);
  });

  it("generates slots only in the future", () => {
    const now = new Date("2026-05-04T12:00:00.000Z");
    const slots = generateAvailableSlots({
      bookedIsoDates: [],
      slotMinutes: 60,
      businessHoursStart: "09:00",
      businessHoursEnd: "18:00",
      timezone: "Asia/Bangkok",
      businessDays: [1, 2, 3, 4, 5],
      windowDays: 1,
      now,
    });
    for (const slot of slots) {
      expect(new Date(slot) > now).toBe(true);
    }
  });

  it("excludes already-booked slots", () => {
    const now = new Date("2026-05-04T00:00:00.000Z");
    const allSlots = generateAvailableSlots({
      bookedIsoDates: [],
      slotMinutes: 60,
      businessHoursStart: "09:00",
      businessHoursEnd: "18:00",
      timezone: "Asia/Bangkok",
      businessDays: [1, 2, 3, 4, 5],
      windowDays: 1,
      now,
    });

    expect(allSlots.length).toBeGreaterThan(0);

    const toBook = allSlots.slice(0, 1);
    const remaining = generateAvailableSlots({
      bookedIsoDates: toBook,
      slotMinutes: 60,
      businessHoursStart: "09:00",
      businessHoursEnd: "18:00",
      timezone: "Asia/Bangkok",
      businessDays: [1, 2, 3, 4, 5],
      windowDays: 1,
      now,
    });

    expect(remaining).toHaveLength(allSlots.length - 1);
  });

  it("skips weekend days when businessDays excludes them", () => {
    // Start on a Friday, window of 4 days covers Fri, Sat, Sun, Mon
    const friday = new Date("2026-05-01T00:00:00.000Z");
    const slots = generateAvailableSlots({
      bookedIsoDates: [],
      slotMinutes: 60,
      businessHoursStart: "09:00",
      businessHoursEnd: "17:00",
      timezone: "UTC",
      businessDays: [1, 2, 3, 4, 5],
      windowDays: 4,
      now: friday,
    });
    const slotDays = new Set(slots.map((s) => new Date(s).getDay()));
    expect(slotDays.has(0)).toBe(false);
    expect(slotDays.has(6)).toBe(false);
  });
});
