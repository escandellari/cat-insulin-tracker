import { z } from "zod";

const ONE_YEAR_IN_DAYS = 365;

function isValidTimezone(timezone: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

function addStartDateRangeIssue(scheduleStartDate: string, ctx: z.RefinementCtx) {
  const startDate = new Date(`${scheduleStartDate}T00:00:00.000Z`);
  const cutoff = new Date();
  cutoff.setUTCHours(0, 0, 0, 0);
  cutoff.setUTCDate(cutoff.getUTCDate() - ONE_YEAR_IN_DAYS);

  if (startDate < cutoff) {
    ctx.addIssue({
      code: "custom",
      path: ["scheduleStartDate"],
      message: "Start date cannot be more than 1 year in the past",
    });
  }
}

export const setupFieldSchemas = {
  catName: z.string().trim().min(1, "Cat name is required"),
  injectionTimes: z
    .array(z.string().trim())
    .transform((times) => times.filter(Boolean))
    .pipe(
      z
        .array(z.string().regex(/^\d{2}:\d{2}$/))
        .refine((times) => new Set(times).size === times.length, {
          message: "Injection times must be unique",
        })
        .min(1, "At least one injection time is required"),
    ),
  defaultDosage: z.coerce.number().min(0, "Dosage must be at least 0"),
  defaultNeedlesPerInjection: z.coerce.number().int().min(0, "Needles must be at least 0"),
  timezone: z
    .string()
    .trim()
    .min(1, "Timezone is required")
    .refine(isValidTimezone, "Timezone must be a valid IANA timezone"),
  scheduleStartDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date is required"),
};

const setupBaseSchema = z.object(setupFieldSchemas);

export const setupSchema = setupBaseSchema.superRefine((value, ctx) => {
  addStartDateRangeIssue(value.scheduleStartDate, ctx);
});

const setupDateStepSchema = setupBaseSchema.pick({
  timezone: true,
  scheduleStartDate: true,
}).superRefine((value, ctx) => {
  addStartDateRangeIssue(value.scheduleStartDate, ctx);
});

export const setupStepSchemas = [
  setupBaseSchema.pick({ catName: true }),
  setupBaseSchema.pick({
    injectionTimes: true,
    defaultDosage: true,
    defaultNeedlesPerInjection: true,
  }),
  setupDateStepSchema,
] as const;

export type SetupFormInput = z.input<typeof setupSchema>;
export type SetupInput = z.output<typeof setupSchema>;
