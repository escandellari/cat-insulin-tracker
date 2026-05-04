import { z } from "zod";

function isValidDateTimeLocal(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);

  if (!match) {
    return false;
  }

  const [, year, month, day, hour, minute] = match;
  const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute)));

  return (
    parsed.getUTCFullYear() === Number(year) &&
    parsed.getUTCMonth() === Number(month) - 1 &&
    parsed.getUTCDate() === Number(day) &&
    parsed.getUTCHours() === Number(hour) &&
    parsed.getUTCMinutes() === Number(minute)
  );
}

export const injectionSites = [
  "left-shoulder",
  "right-shoulder",
  "left-hip",
  "right-hip",
] as const;

export const logInjectionSchema = z.object({
  eventId: z.string().min(1, "Event is required"),
  actualGivenAt: z
    .string()
    .min(1, "Actual time is required")
    .refine(isValidDateTimeLocal, "Actual time must be a valid date and time"),
  dosageGiven: z.number().min(0, "Dosage must be non-negative"),
  needlesUsed: z.number().int().min(0, "Needles used must be non-negative"),
  site: z.enum(injectionSites, {
    error: () => ({ message: "Injection site is required" }),
  }),
  notes: z.string().optional(),
});

export type LogInjectionInput = z.infer<typeof logInjectionSchema>;
