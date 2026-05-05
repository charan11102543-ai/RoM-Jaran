import { describe, expect, it } from "vitest";
import { determineLeadStatus, getNextAction } from "@/lib/qualification";

describe("determineLeadStatus", () => {
  it("returns QUALIFIED when budget meets threshold and service is present", () => {
    expect(
      determineLeadStatus({ service: "Web Design", budget: 5000, threshold: 1000 })
    ).toBe("QUALIFIED");
  });

  it("returns QUALIFIED when budget exactly equals threshold", () => {
    expect(
      determineLeadStatus({ service: "Automation", budget: 1000, threshold: 1000 })
    ).toBe("QUALIFIED");
  });

  it("returns NEW when budget is below threshold", () => {
    expect(
      determineLeadStatus({ service: "Web Design", budget: 500, threshold: 1000 })
    ).toBe("NEW");
  });

  it("returns NEW when service is null even with large budget", () => {
    expect(
      determineLeadStatus({ service: null, budget: 9999, threshold: 1000 })
    ).toBe("NEW");
  });

  it("returns NEW when budget is null", () => {
    expect(
      determineLeadStatus({ service: "SEO", budget: null, threshold: 1000 })
    ).toBe("NEW");
  });

  it("preserves BOOKED status regardless of budget", () => {
    expect(
      determineLeadStatus({ service: "SEO", budget: 9999, currentStatus: "BOOKED", threshold: 1000 })
    ).toBe("BOOKED");
  });

  it("preserves CLOSED status regardless of budget", () => {
    expect(
      determineLeadStatus({ service: "SEO", budget: 9999, currentStatus: "CLOSED", threshold: 1000 })
    ).toBe("CLOSED");
  });

  it("preserves FOLLOW_UP status regardless of budget", () => {
    expect(
      determineLeadStatus({ service: "SEO", budget: 9999, currentStatus: "FOLLOW_UP", threshold: 1000 })
    ).toBe("FOLLOW_UP");
  });

  it("re-evaluates when currentStatus is NEW", () => {
    expect(
      determineLeadStatus({ service: "SEO", budget: 5000, currentStatus: "NEW", threshold: 1000 })
    ).toBe("QUALIFIED");
  });
});

describe("getNextAction", () => {
  it("returns collect_info for NEW status", () => {
    expect(getNextAction({ status: "NEW" })).toBe("collect_info");
  });

  it("returns collect_info for NEW status even with a datetime", () => {
    expect(
      getNextAction({ status: "NEW", preferredDateTime: "2026-05-10T10:00:00Z" })
    ).toBe("collect_info");
  });

  it("returns offer_booking for QUALIFIED without a preferred datetime", () => {
    expect(getNextAction({ status: "QUALIFIED", preferredDateTime: null })).toBe("offer_booking");
  });

  it("returns offer_booking for QUALIFIED when preferredDateTime is undefined", () => {
    expect(getNextAction({ status: "QUALIFIED" })).toBe("offer_booking");
  });

  it("returns confirm_booking for QUALIFIED with a preferred datetime", () => {
    expect(
      getNextAction({ status: "QUALIFIED", preferredDateTime: "2026-05-10T10:00:00Z" })
    ).toBe("confirm_booking");
  });

  it("returns confirm_booking for BOOKED status", () => {
    expect(getNextAction({ status: "BOOKED" })).toBe("confirm_booking");
  });

  it("returns collect_info for FOLLOW_UP status", () => {
    expect(getNextAction({ status: "FOLLOW_UP" })).toBe("collect_info");
  });

  it("returns collect_info for CLOSED status", () => {
    expect(getNextAction({ status: "CLOSED" })).toBe("collect_info");
  });
});
