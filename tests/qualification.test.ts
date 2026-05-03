import { describe, expect, it } from "vitest";
import { determineLeadStatus, getNextAction } from "@/lib/qualification";

describe("qualification logic", () => {
  it("marks a lead qualified when service and threshold budget exist", () => {
    expect(
      determineLeadStatus({
        service: "AI automation audit",
        budget: 2500,
        threshold: 1000,
      }),
    ).toBe("QUALIFIED");
  });

  it("keeps booked status sticky", () => {
    expect(
      determineLeadStatus({
        service: "AI automation audit",
        budget: 100,
        threshold: 1000,
        currentStatus: "BOOKED",
      }),
    ).toBe("BOOKED");
  });

  it("returns the correct next action", () => {
    expect(getNextAction({ status: "NEW" })).toBe("collect_info");
    expect(getNextAction({ status: "QUALIFIED" })).toBe("offer_booking");
    expect(getNextAction({ status: "QUALIFIED", preferredDateTime: new Date().toISOString() })).toBe("confirm_booking");
  });
});
