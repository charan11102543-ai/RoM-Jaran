import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default("gpt-4o-mini"),
  WEBHOOK_URL: z.string().default(""),
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

  ADMIN_NOTIFY_WEBHOOK_URL: z.string().url().optional().or(z.literal("")),
  STRIPE_PAYMENT_LINK_SETUP: z.string().url().optional().or(z.literal("")),
  STRIPE_PAYMENT_LINK_STARTER: z.string().url().optional().or(z.literal("")),
  STRIPE_PAYMENT_LINK_GROWTH: z.string().url().optional().or(z.literal("")),
  STRIPE_PAYMENT_LINK_SCALE: z.string().url().optional().or(z.literal("")),
  BUSINESS_NAME: z.string().default("AI Automation Hustle"),
  BUSINESS_LINE_OA_URL: z.string().url().optional().or(z.literal("")),
  BUSINESS_LINE_OA_ID: z.string().optional().or(z.literal("")),
  BUSINESS_CONTACT_EMAIL: z.string().email().optional().or(z.literal("")),
  BUSINESS_CONTACT_PHONE: z.string().optional().or(z.literal("")),

  // PromptPay (Thai market preferred over Stripe for SMB)
  PROMPTPAY_NUMBER: z.string().optional().or(z.literal("")),
  PROMPTPAY_DISPLAY_NAME: z.string().optional().or(z.literal("")),

  // Static asset paths under /public — drop QR images here
  LINE_QR_PATH: z.string().default("/assets/line-qr.png"),
  PROMPTPAY_QR_PATH: z.string().default("/assets/promptpay-qr.png"),
});

let cachedEnv: z.infer<typeof envSchema> | null = null;

export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }

  return cachedEnv;
}
