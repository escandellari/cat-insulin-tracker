import { z } from "zod";

const ONE_YEAR_IN_DAYS = 365;

const TIME_OF_DAY_PATTERN = /^(\d{2}):(\d{2})$/;

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
  treatmentStartDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date is required")
    .refine(isRealCalendarDate, "Start date must be a real calendar date"),
  morningTime: z.string().trim().min(1, "Morning time is required").refine(isRealTimeOfDay, {
    message: "Morning time must be a real 24-hour time",
  }),
  eveningTime: z.string().trim().min(1, "Evening time is required").refine(isRealTimeOfDay, {
    message: "Evening time must be a real 24-hour time",
  }),
  defaultDosage: z.coerce.number().gt(0, "Dosage is required"),
  dueWindowMinutes: z.coerce.number().int().gt(0, "Due window is required"),
};

const setupBaseSchema = z.object(setupFieldSchemas);

export const setupSchema = setupBaseSchema.superRefine((value, ctx) => {
  addStartDateRangeIssue(value.treatmentStartDate, ctx);

  if (value.morningTime === value.eveningTime) {
    ctx.addIssue({
      code: "custom",
      path: ["eveningTime"],
      message: "Evening time must be different from morning time",
    });
  }
});

const setupDateStepSchema = setupBaseSchema.pick({
  treatmentStartDate: true,
}).superRefine((value, ctx) => {
  addStartDateRangeIssue(value.treatmentStartDate, ctx);
});

export const setupStepSchemas = [
  setupBaseSchema.pick({ catName: true }),
  setupDateStepSchema,
  setupBaseSchema.pick({
    morningTime: true,
    eveningTime: true,
  }),
  setupBaseSchema.pick({
    defaultDosage: true,
    dueWindowMinutes: true,
  }),
] as const;

export type SetupFormInput = z.input<typeof setupSchema>;
export type SetupInput = z.output<typeof setupSchema>;
