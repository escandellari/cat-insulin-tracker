import { z } from "zod";
import { scheduleHasDstGap } from "@/features/scheduling";

const ONE_YEAR_IN_DAYS = 365;

const TIME_OF_DAY_PATTERN = /^(\d{2}):(\d{2})$/;

function isValidTimezone(timezone: string) {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone }).format();
    return true;
  } catch {
    return false;
  }
}

function isRealCalendarDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isRealTimeOfDay(value: string) {
  const match = TIME_OF_DAY_PATTERN.exec(value);

  if (!match) {
    return false;
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
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
        .array(z.string().refine(isRealTimeOfDay, "Injection times must be real 24-hour times"))
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
  scheduleStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date is required")
    .refine(isRealCalendarDate, "Start date must be a real calendar date"),
};

const setupBaseSchema = z.object(setupFieldSchemas);

export const setupSchema = setupBaseSchema.superRefine((value, ctx) => {
  addStartDateRangeIssue(value.scheduleStartDate, ctx);

  if (
    !ctx.issues.length &&
    scheduleHasDstGap({
      startDate: value.scheduleStartDate,
      timezone: value.timezone,
      injectionTimes: value.injectionTimes,
    })
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["injectionTimes"],
      message: "Injection times must not include nonexistent local DST-gap times in the next 90 days",
    });
  }
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
