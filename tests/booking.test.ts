import { describe, expect, it } from "vitest";
import { generateAvailableSlots, isBusinessDay, isSlotInsideBusinessHours } from "@/lib/booking";

describe("booking utilities", () => {
  it("generates future slots and excludes booked ones", () => {
    const now = new Date("2026-05-04T00:00:00.000Z");
    const booked = ["2026-05-04T02:00:00.000Z"];

    const slots = generateAvailableSlots({
      bookedIsoDates: booked,
      slotMinutes: 60,
      businessHoursStart: "09:00",
      businessHoursEnd: "12:00",
      timezone: "Asia/Bangkok",
      businessDays: [1, 2, 3, 4, 5],
      windowDays: 1,
      now,
    });

    expect(slots).not.toContain("2026-05-04T02:00:00.000Z");
    expect(slots.length).toBeGreaterThan(0);
  });

  it("checks business day and business hours", () => {
    const slot = "2026-05-04T02:00:00.000Z";
    expect(isBusinessDay(new Date(slot), "Asia/Bangkok", [1, 2, 3, 4, 5])).toBe(true);
    expect(
      isSlotInsideBusinessHours({
        isoDate: slot,
        businessHoursStart: "09:00",
        businessHoursEnd: "18:00",
        timezone: "Asia/Bangkok",
      }),
    ).toBe(true);
  });
});
