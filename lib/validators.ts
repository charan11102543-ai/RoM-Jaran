import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .transform((value) => value || null)
  .nullable()
  .optional();

export const chatRequestSchema = z.object({
  sessionToken: z.string().min(10),
  message: z.string().trim().min(1),
});

export const chatResponseSchema = z.object({
  message: z.string().min(1),
  data: z.object({
    name: z.string().trim().nullable(),
    service: z.string().trim().nullable(),
    budget: z.number().int().nonnegative().nullable(),
    datetime: z.string().datetime().nullable(),
  }),
});

export const leadPayloadSchema = z.object({
  name: optionalTrimmedString,
  email: z.string().email().nullable().optional(),
  service: optionalTrimmedString,
  budget: z.coerce.number().int().nonnegative().nullable().optional(),
  conversationSummary: optionalTrimmedString,
});

export const bookingPayloadSchema = z.object({
  leadId: z.string().min(1),
  datetime: z.string().datetime(),
});

export const leadStatusSchema = z.enum(["NEW", "QUALIFIED", "BOOKED", "FOLLOW_UP", "CLOSED"]);

export const agencyPackageSchema = z.enum(["starter", "growth", "scale", "unsure"]);

export const intakePayloadSchema = z.object({
  name: z.string().trim().min(1, "กรุณากรอกชื่อ").max(120),
  clinic: z.string().trim().min(1, "กรุณากรอกชื่อคลินิก").max(200),
  phone: z.string().trim().min(8, "กรุณากรอกเบอร์โทร").max(40),
  email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  lineId: z.string().trim().max(100).optional().or(z.literal("")),
  packageInterest: agencyPackageSchema.default("unsure"),
  message: z.string().trim().max(2000).optional().or(z.literal("")),
});

export type IntakePayload = z.infer<typeof intakePayloadSchema>;
