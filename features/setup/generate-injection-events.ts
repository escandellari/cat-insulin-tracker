import type { Prisma } from "@prisma/client";
import { listScheduleDateParts, resolveScheduledAt, SCHEDULE_LOOKAHEAD_DAYS } from "@/features/scheduling";

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
  const events: Prisma.InjectionEventCreateManyInput[] = [];

  for (const datePart of listScheduleDateParts(startDate, SCHEDULE_LOOKAHEAD_DAYS)) {
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
