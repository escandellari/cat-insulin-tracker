import { z } from "zod";

export const logInjectionSchema = z.object({
  eventId: z.string().min(1, "Event is required"),
  actualGivenAt: z.string().min(1, "Actual time is required"),
  dosageGiven: z.number().min(0, "Dosage must be non-negative"),
  needlesUsed: z.number().int().min(0, "Needles used must be non-negative"),
  notes: z.string().optional(),
});

export type LogInjectionInput = z.infer<typeof logInjectionSchema>;
