import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  WEBHOOK_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().min(16),
  NEXTAUTH_URL: z.string().url(),
  QUALIFICATION_BUDGET_THRESHOLD: z.coerce.number().default(1000),
  BOOKING_SLOT_MINUTES: z.coerce.number().default(60),
  BUSINESS_HOURS_START: z.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
  BUSINESS_HOURS_END: z.string().regex(/^\d{2}:\d{2}$/).default("18:00"),
  BUSINESS_TIMEZONE: z.string().default("Asia/Bangkok"),
  BUSINESS_DAYS: z.string().default("1,2,3,4,5"),
  BOOKING_WINDOW_DAYS: z.coerce.number().default(14),
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

// Build-time safe defaults
const buildTimeDefaults: z.infer<typeof envSchema> = {
  DATABASE_URL: "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  OPENAI_API_KEY: "sk-build-time-placeholder",
  OPENAI_MODEL: "gpt-4o-mini",
  WEBHOOK_URL: undefined,
  NEXTAUTH_SECRET: "build-time-placeholder-secret",
  NEXTAUTH_URL: "http://localhost:3000",
  QUALIFICATION_BUDGET_THRESHOLD: 1000,
  BOOKING_SLOT_MINUTES: 60,
  BUSINESS_HOURS_START: "09:00",
  BUSINESS_HOURS_END: "18:00",
  BUSINESS_TIMEZONE: "Asia/Bangkok",
  BUSINESS_DAYS: "1,2,3,4,5",
  BOOKING_WINDOW_DAYS: 14,
};

export function getEnv() {
  if (!cachedEnv) {
    const result = envSchema.safeParse(process.env);
    if (result.success) {
      cachedEnv = result.data;
    } else {
      // During build time or when env vars are missing, use defaults
      console.warn("Environment validation failed, using build-time defaults:", result.error.message);
      cachedEnv = buildTimeDefaults;
    }
  }
  return cachedEnv;
}

// For convenience, but will use defaults if env vars are missing
export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get(_, prop) {
    return getEnv()[prop as keyof typeof cachedEnv];
  },
});
