import { describe, expect, it } from "vitest";
import { deriveEventStatus } from "@/features/scheduling";

describe("deriveEventStatus", () => {
  it.each([
    {
      name: "upcoming before scheduled time",
      scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
      now: new Date("2026-01-10T12:59:59.000Z"),
      expected: "upcoming",
    },
    {
      name: "due within the tracking window",
      scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
      now: new Date("2026-01-10T13:30:00.000Z"),
      expected: "due",
    },
    {
      name: "late after the tracking window but before missed threshold",
      scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
      now: new Date("2026-01-10T14:00:00.000Z"),
      expected: "late",
    },
    {
      name: "missed at the missed threshold",
      scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
      now: new Date("2026-01-11T01:00:00.000Z"),
      expected: "missed",
    },
  ])("derives $name", ({ scheduledAt, now, expected }) => {
    expect(
      deriveEventStatus({
        scheduledAt,
        now,
        trackingWindowMinutes: 45,
        missedThresholdHours: 12,
        hasLog: false,
      }),
    ).toBe(expected);
  });

  it("prefers logged over time-based states", () => {
    expect(
      deriveEventStatus({
        scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
        now: new Date("2026-01-11T05:00:00.000Z"),
        trackingWindowMinutes: 45,
        missedThresholdHours: 12,
        hasLog: true,
      }),
    ).toBe("logged");
  });
});
