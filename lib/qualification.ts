import type { LeadStatus } from "@prisma/client";

export function determineLeadStatus(input: {
  service?: string | null;
  budget?: number | null;
  currentStatus?: LeadStatus;
  threshold: number;
}): LeadStatus {
  const { service, budget, currentStatus, threshold } = input;

  if (currentStatus === "BOOKED" || currentStatus === "CLOSED" || currentStatus === "FOLLOW_UP") {
    return currentStatus;
  }

  if (service && budget != null && budget >= threshold) {
    return "QUALIFIED";
  }

  return "NEW";
}

export function getNextAction(input: {
  status: LeadStatus;
  preferredDateTime?: string | null;
}) {
  if (input.status === "BOOKED") {
    return "confirm_booking" as const;
  }

  if (input.status === "QUALIFIED") {
    return input.preferredDateTime ? ("confirm_booking" as const) : ("offer_booking" as const);
  }

  return "collect_info" as const;
}
