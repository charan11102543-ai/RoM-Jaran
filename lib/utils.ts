import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format number as Thai currency (THB)
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
  }).format(value);
}

/**
 * Convert string to Title Case
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Format date to Thai locale
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Format date to short format (DD/MM/YYYY)
 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Format time to HH:MM format
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Generate UUID v4
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Sleep for given milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get business hours array for today
 */
export function getBusinessHours(
  startHour: string,
  endHour: string
): { hours: number; display: string }[] {
  const [startH] = startHour.split(":").map(Number);
  const [endH] = endHour.split(":").map(Number);

  const hours: { hours: number; display: string }[] = [];
  for (let h = startH; h < endH; h++) {
    hours.push({
      hours: h,
      display: `${h.toString().padStart(2, "0")}:00`,
    });
  }
  return hours;
}

/**
 * Check if date is within business days
 */
export function isBusinessDay(date: Date, businessDays: number[]): boolean {
  const day = date.getDay();
  return businessDays.includes(day);
}

/**
 * Parse comma-separated business days (0=Sun, 1=Mon, ..., 6=Sat)
 */
export function parseBusinessDays(daysString: string): number[] {
  return daysString.split(",").map((d) => parseInt(d.trim()));
}

/**
 * Get next available business day
 */
export function getNextBusinessDay(
  startDate: Date,
  businessDays: number[]
): Date {
  const date = new Date(startDate);
  date.setDate(date.getDate() + 1);

  while (!isBusinessDay(date, businessDays)) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

/**
 * Parse environment variable or return default
 */
export function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || defaultValue || "";
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone format (basic Thai format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+66|0)[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/[\s-()]/g, ""));
}

/**
 * Truncate text to given length with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + "...";
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format date and time for display
 */
export function formatDateTime(value: Date | string): string {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

/**
 * Format number as percentage
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}
