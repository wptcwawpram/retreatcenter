import { z } from "zod";

export const createPaymentSchema = z.object({
  bookingId: z.string().min(1, "Booking is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  method: z.enum([
    "CASH",
    "MOBILE_MONEY",
    "BANK_TRANSFER",
    "PAYSTACK",
    "CHEQUE",
    "MANUAL",
  ]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
