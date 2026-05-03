import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default("gpt-4o-mini"),
  WEBHOOK_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(16),
  NEXTAUTH_URL: z.string().url(),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(8),
  QUALIFICATION_BUDGET_THRESHOLD: z.coerce.number().int().nonnegative(),
  BOOKING_SLOT_MINUTES: z.coerce.number().int().positive(),
  BUSINESS_HOURS_START: z.string().regex(/^\d{2}:\d{2}$/),
  BUSINESS_HOURS_END: z.string().regex(/^\d{2}:\d{2}$/),
  BUSINESS_TIMEZONE: z.string().min(1),
  BUSINESS_DAYS: z
    .string()
    .default("1,2,3,4,5")
    .transform((value) =>
      value
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isInteger(item) && item >= 0 && item <= 6),
    ),
  BOOKING_WINDOW_DAYS: z.coerce.number().int().positive().default(7),
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }

  return cachedEnv;
}
