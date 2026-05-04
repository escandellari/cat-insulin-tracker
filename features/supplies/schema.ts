import { z } from "zod";

export const supplyTypes = ["insulin", "needles"] as const;

export const recordSupplySchema = z.object({
  catId: z.string().min(1, "Cat is required"),
  type: z.enum(supplyTypes),
  startedAt: z.string().date("Started date must be a valid date"),
  startingAmount: z.number().positive("Starting amount must be greater than zero"),
});

export type RecordSupplyInput = z.infer<typeof recordSupplySchema>;
