import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

const ROUND_TRIP_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
const DAYS_AHEAD = 90;

export class NonexistentLocalTimeError extends Error {
  constructor(
    public readonly datePart: string,
    public readonly timeOfDay: string,
    public readonly timezone: string,
  ) {
    super(`Nonexistent local time: ${datePart} ${timeOfDay} ${timezone}`);
  }
}

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
  const firstDay = new Date(`${startDate}T00:00:00.000Z`);

  for (let offset = 0; offset <= DAYS_AHEAD; offset += 1) {
    const datePart = formatDatePart(addDays(firstDay, offset));

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
