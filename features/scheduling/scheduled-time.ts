import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { listScheduleDateParts, SCHEDULE_LOOKAHEAD_DAYS } from "./date-parts";

const ROUND_TRIP_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";

export class NonexistentLocalTimeError extends Error {
  constructor(
    public readonly datePart: string,
    public readonly timeOfDay: string,
    public readonly timezone: string,
  ) {
    super(`Nonexistent local time: ${datePart} ${timeOfDay} ${timezone}`);
  }
}

export function resolveScheduledAt({
  datePart,
  timeOfDay,
  timezone,
}: {
  datePart: string;
  timeOfDay: string;
  timezone: string;
}) {
  const localDateTime = `${datePart}T${timeOfDay}:00`;
  const scheduledAt = fromZonedTime(localDateTime, timezone);

  if (formatInTimeZone(scheduledAt, timezone, ROUND_TRIP_FORMAT) !== localDateTime) {
    throw new NonexistentLocalTimeError(datePart, timeOfDay, timezone);
  }

  return scheduledAt;
}

export function scheduleHasDstGap({
  startDate,
  timezone,
  injectionTimes,
}: {
  startDate: string;
  timezone: string;
  injectionTimes: string[];
}) {
  for (const datePart of listScheduleDateParts(startDate, SCHEDULE_LOOKAHEAD_DAYS)) {
    for (const timeOfDay of injectionTimes) {
      try {
        resolveScheduledAt({ datePart, timeOfDay, timezone });
      } catch (error) {
        if (error instanceof NonexistentLocalTimeError) {
          return true;
        }

        throw error;
      }
    }
  }

  return false;
}

export function formatScheduledAt(date: Date, timezone: string) {
  return formatInTimeZone(date, timezone, "MMM d, yyyy, h:mm a");
}
