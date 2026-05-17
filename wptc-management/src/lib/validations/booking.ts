import { z } from "zod";

export const createBookingSchema = z
  .object({
    guestId: z.string().min(1, "Guest is required"),
    roomIds: z
      .array(z.string())
      .min(1, "At least one room must be selected"),
    checkInDate: z.coerce.date({ error: "Check-in date is required" }),
    checkOutDate: z.coerce.date({
      error: "Check-out date is required",
    }),
    numberOfGuests: z.coerce
      .number()
      .int()
      .min(1, "At least 1 guest required"),
    specialRequests: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => data.checkOutDate > data.checkInDate, {
    message: "Check-out date must be after check-in date",
    path: ["checkOutDate"],
  });

export const updateBookingStatusSchema = z.object({
  bookingId: z.string().min(1),
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "CHECKED_IN",
    "CHECKED_OUT",
    "CANCELLED",
    "NO_SHOW",
  ]),
  notes: z.string().optional(),
});

export const createGuestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone number is required"),
  idType: z.string().optional(),
  idNumber: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type CreateGuestInput = z.infer<typeof createGuestSchema>;
