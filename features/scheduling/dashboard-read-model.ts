import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { deriveEventStatus, type DerivedEventStatus } from "./event-status";

type DashboardEventSource = {
  id: string;
  scheduledAt: Date;
  status?: string | null;
  schedule?: {
    trackingWindowMinutes?: number | null;
    missedThresholdHours?: number | null;
    defaultDosage?: { toString(): string } | number | string | null;
  } | null;
  injectionLog?: unknown | null;
};

function hasPersistedLogState(event: DashboardEventSource) {
  return event.status === "COMPLETED" || event.status === "LATE" || event.status === "PARTIAL";
}

export type DashboardEvent = {
  id: string;
  scheduledAt: Date;
  status: DerivedEventStatus;
  timeLabel: string;
  fullDateTimeLabel: string;
  dosageLabel: string;
  dueWindowLabel: string;
  localDateKey: string;
};

function formatCurrentDate(now: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(now);
}

function formatTime(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDateTime(date: Date, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function buildDashboardReadModel({
  catName,
  timezone,
  now,
  events,
}: {
  catName: string;
  timezone: string;
  now: Date;
  events: DashboardEventSource[];
}) {
  const todayKey = formatInTimeZone(now, timezone, "yyyy-MM-dd");

  const dashboardEvents = [...events]
    .sort((left, right) => left.scheduledAt.getTime() - right.scheduledAt.getTime())
    .map((event) => {
      const trackingWindowMinutes = event.schedule?.trackingWindowMinutes ?? 30;
      const missedThresholdHours = event.schedule?.missedThresholdHours ?? 12;
      const dosage = event.schedule?.defaultDosage;

      return {
        id: event.id,
        scheduledAt: event.scheduledAt,
        status: deriveEventStatus({
          scheduledAt: event.scheduledAt,
          now,
          trackingWindowMinutes,
          missedThresholdHours,
          hasLog: Boolean(event.injectionLog) || hasPersistedLogState(event),
        }),
        timeLabel: formatTime(event.scheduledAt, timezone),
        fullDateTimeLabel: formatDateTime(event.scheduledAt, timezone),
        dosageLabel: `${String(dosage ?? "") || "—"} units`,
        dueWindowLabel: `${trackingWindowMinutes} minute window`,
        localDateKey: formatInTimeZone(event.scheduledAt, timezone, "yyyy-MM-dd"),
      } satisfies DashboardEvent;
    });

  const todaysEvents = dashboardEvents.filter((event) => event.localDateKey === todayKey);
  const upcomingEvents = dashboardEvents.filter((event) => event.localDateKey > todayKey);
  const nextEvent = dashboardEvents.find((event) => event.status !== "missed" && event.status !== "logged") ?? null;

  return {
    catName,
    currentDateLabel: formatCurrentDate(now, timezone),
    nextEvent,
    todaysEvents,
    upcomingEvents,
  };
}

export function getLocalDayStartUtc(now: Date, timezone: string) {
  return fromZonedTime(`${formatInTimeZone(now, timezone, "yyyy-MM-dd")}T00:00:00`, timezone);
}
