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
