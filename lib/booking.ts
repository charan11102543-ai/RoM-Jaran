import { addDays, addMinutes, getDay, isAfter } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

function parseClock(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return { hours, minutes };
}

export function generateAvailableSlots(input: {
  bookedIsoDates: string[];
  slotMinutes: number;
  businessHoursStart: string;
  businessHoursEnd: string;
  timezone: string;
  businessDays: number[];
  windowDays: number;
  now?: Date;
}) {
  const {
    bookedIsoDates,
    slotMinutes,
    businessHoursStart,
    businessHoursEnd,
    timezone,
    businessDays,
    windowDays,
    now = new Date(),
  } = input;

  const bookedSet = new Set(bookedIsoDates);
  const slots: string[] = [];
  const start = parseClock(businessHoursStart);
  const end = parseClock(businessHoursEnd);

  for (let dayOffset = 0; dayOffset < windowDays; dayOffset += 1) {
    const candidateDay = addDays(now, dayOffset);
    const zonedDayNumber = Number(formatInTimeZone(candidateDay, timezone, "i")) % 7;

    if (!businessDays.includes(zonedDayNumber)) {
      continue;
    }

    const dateKey = formatInTimeZone(candidateDay, timezone, "yyyy-MM-dd");
    let slot = fromZonedTime(
      `${dateKey}T${String(start.hours).padStart(2, "0")}:${String(start.minutes).padStart(2, "0")}:00`,
      timezone,
    );
    const cutoff = fromZonedTime(
      `${dateKey}T${String(end.hours).padStart(2, "0")}:${String(end.minutes).padStart(2, "0")}:00`,
      timezone,
    );

    while (slot < cutoff) {
      const iso = slot.toISOString();
      if (isAfter(slot, now) && !bookedSet.has(iso)) {
        slots.push(iso);
      }
      slot = addMinutes(slot, slotMinutes);
    }
  }

  return slots;
}

export function isBusinessDay(date: Date, timezone: string, businessDays: number[]) {
  const dayNumber = Number(formatInTimeZone(date, timezone, "i")) % 7;
  return businessDays.includes(dayNumber);
}

export function isSlotInsideBusinessHours(input: {
  isoDate: string;
  businessHoursStart: string;
  businessHoursEnd: string;
  timezone: string;
}) {
  const { isoDate, businessHoursStart, businessHoursEnd, timezone } = input;
  const date = new Date(isoDate);
  const time = formatInTimeZone(date, timezone, "HH:mm");
  return time >= businessHoursStart && time < businessHoursEnd;
}

export function getWeekdayName(date: Date) {
  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][getDay(date)];
}
