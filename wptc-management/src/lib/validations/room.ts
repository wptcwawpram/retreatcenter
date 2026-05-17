import { z } from "zod";

export const createRoomSchema = z.object({
  roomNumber: z
    .string()
    .min(1, "Room number is required")
    .max(10, "Room number too long"),
  buildingId: z.string().min(1, "Building is required"),
  floor: z.coerce.number().int().min(0, "Floor must be 0 or above"),
  defaultRoomType: z.enum([
    "ONE_IN_ONE",
    "TWO_IN_ONE",
    "THREE_IN_ONE",
    "FOUR_IN_ONE",
    "DORMITORY",
    "CUSTOM",
  ]),
  currentRoomType: z.enum([
    "ONE_IN_ONE",
    "TWO_IN_ONE",
    "THREE_IN_ONE",
    "FOUR_IN_ONE",
    "DORMITORY",
    "CUSTOM",
  ]),
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1"),
  bedCount: z.coerce.number().int().min(1, "Must have at least 1 bed"),
  pricePerNight: z.coerce.number().positive("Price must be positive"),
  facilities: z.array(z.string()).default([]),
  description: z.string().optional(),
  notes: z.string().optional(),
  photos: z.array(z.string()).default([]),
});

export const updateRoomSchema = createRoomSchema.partial().extend({
  id: z.string().min(1),
});

export const changeRoomTypeSchema = z.object({
  roomId: z.string().min(1),
  newType: z.enum([
    "ONE_IN_ONE",
    "TWO_IN_ONE",
    "THREE_IN_ONE",
    "FOUR_IN_ONE",
    "DORMITORY",
    "CUSTOM",
  ]),
  reason: z.string().optional(),
  isTemporary: z.boolean().default(false),
  relatedBookingId: z.string().optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type ChangeRoomTypeInput = z.infer<typeof changeRoomTypeSchema>;
