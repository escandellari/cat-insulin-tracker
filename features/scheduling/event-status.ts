export type DerivedEventStatus = "upcoming" | "due" | "late" | "missed" | "logged";

export function deriveEventStatus({
  scheduledAt,
  now,
  trackingWindowMinutes,
  missedThresholdHours,
  hasLog,
}: {
  scheduledAt: Date;
  now: Date;
  trackingWindowMinutes: number;
  missedThresholdHours: number;
  hasLog: boolean;
}) {
  if (hasLog) {
    return "logged" satisfies DerivedEventStatus;
  }

  const diffMs = now.getTime() - scheduledAt.getTime();

  if (diffMs < 0) {
    return "upcoming" satisfies DerivedEventStatus;
  }

  const dueWindowMs = trackingWindowMinutes * 60 * 1000;
  if (diffMs <= dueWindowMs) {
    return "due" satisfies DerivedEventStatus;
  }

  const missedThresholdMs = missedThresholdHours * 60 * 60 * 1000;
  if (diffMs < missedThresholdMs) {
    return "late" satisfies DerivedEventStatus;
  }

  return "missed" satisfies DerivedEventStatus;
}
