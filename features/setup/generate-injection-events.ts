import type { Prisma } from "@prisma/client";
import { resolveScheduledAt } from "@/features/scheduling";

const DAYS_AHEAD = 90;

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function formatDatePart(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const day = `${date.getUTCDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function generateInjectionEvents({
  catId,
  scheduleId,
  startDate,
  timezone,
  injectionTimes,
}: {
  catId: string;
  scheduleId: string;
  startDate: string;
  timezone: string;
  injectionTimes: string[];
}): Prisma.InjectionEventCreateManyInput[] {
  const firstDay = new Date(`${startDate}T00:00:00.000Z`);
  const events: Prisma.InjectionEventCreateManyInput[] = [];

  for (let offset = 0; offset <= DAYS_AHEAD; offset += 1) {
    const datePart = formatDatePart(addDays(firstDay, offset));

    for (const injectionTime of injectionTimes) {
      events.push({
        catId,
        scheduleId,
        scheduledAt: resolveScheduledAt({
          datePart,
          timeOfDay: injectionTime,
          timezone,
        }),
        status: "UPCOMING",
      });
    }
  }

  return events;
}
