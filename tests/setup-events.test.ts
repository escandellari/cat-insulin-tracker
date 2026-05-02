import { describe, expect, it } from "vitest";
import { generateInjectionEvents } from "@/features/setup";

describe("generateInjectionEvents", () => {
  it("emits the full inclusive 90-day range in UTC", () => {
    const events = generateInjectionEvents({
      catId: "cat-1",
      scheduleId: "schedule-1",
      startDate: "2026-01-10",
      timezone: "America/New_York",
      injectionTimes: ["08:00", "20:00"],
    });

    expect(events).toHaveLength(182);
    expect(events[0]?.scheduledAt.toISOString()).toBe("2026-01-10T13:00:00.000Z");
    expect(events[1]?.scheduledAt.toISOString()).toBe("2026-01-11T01:00:00.000Z");
    expect(events.at(-1)?.scheduledAt.toISOString()).toBe("2026-04-11T00:00:00.000Z");
  });

  it("keeps local clock times stable across DST changes", () => {
    const events = generateInjectionEvents({
      catId: "cat-1",
      scheduleId: "schedule-1",
      startDate: "2026-03-07",
      timezone: "America/New_York",
      injectionTimes: ["08:00"],
    });

    expect(events[0]?.scheduledAt.toISOString()).toBe("2026-03-07T13:00:00.000Z");
    expect(events[1]?.scheduledAt.toISOString()).toBe("2026-03-08T12:00:00.000Z");
    expect(events[2]?.scheduledAt.toISOString()).toBe("2026-03-09T12:00:00.000Z");
  });

  it("throws for nonexistent local DST-gap times instead of silently shifting them", () => {
    expect(() =>
      generateInjectionEvents({
        catId: "cat-1",
        scheduleId: "schedule-1",
        startDate: "2026-03-07",
        timezone: "America/New_York",
        injectionTimes: ["02:00"],
      }),
    ).toThrowError("Nonexistent local time: 2026-03-08 02:00 America/New_York");
  });
});
