import { z } from "zod";

export const injectionSites = [
  "left-shoulder",
  "right-shoulder",
  "left-hip",
  "right-hip",
] as const;

export const logInjectionSchema = z.object({
  eventId: z.string().min(1, "Event is required"),
  actualGivenAt: z.string().min(1, "Actual time is required"),
  dosageGiven: z.number().min(0, "Dosage must be non-negative"),
  needlesUsed: z.number().int().min(0, "Needles used must be non-negative"),
  site: z.enum(injectionSites, {
    error: () => ({ message: "Injection site is required" }),
  }),
  notes: z.string().optional(),
});

export type LogInjectionInput = z.infer<typeof logInjectionSchema>;
