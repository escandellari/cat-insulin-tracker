import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTHED_SESSION, toHtml } from "./helpers/auth";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    cat: {
      findFirst: vi.fn(),
    },
    injectionEvent: {
      findMany: vi.fn(),
    },
    supplyRecord: {
      findMany: vi.fn(),
    },
  },
}));

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

async function getDashboardPage() {
  const { default: Page } = await import("@/app/dashboard/page");
  return Page;
}

describe("Dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Test 1: unauthenticated redirect
  it("redirects unauthenticated user to /auth/signin", async () => {
    vi.mocked(auth as any).mockResolvedValue(null);

    const DashboardPage = await getDashboardPage();
    await expect(DashboardPage()).rejects.toThrow("REDIRECT:/auth/signin");
    expect(redirect).toHaveBeenCalledWith("/auth/signin");
  });

  it("redirects signed-in user with no cat to /setup", async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue(null);

    const DashboardPage = await getDashboardPage();
    await expect(DashboardPage()).rejects.toThrow("REDIRECT:/setup");
    expect(redirect).toHaveBeenCalledWith("/setup");
  });

  it("renders cat name and current date in the dashboard header", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T13:00:00.000Z"));

    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue({
      id: "cat-1",
      name: "Milo",
      userId: AUTHED_SESSION.user.id,
      user: {
        timezone: "America/New_York",
      },
      createdAt: new Date(),
    } as any);
    vi.mocked(prisma.injectionEvent.findMany).mockResolvedValue([]);

    const DashboardPage = await getDashboardPage();
    const html = toHtml((await DashboardPage()) as React.ReactElement);

    expect(html).toContain("Milo");
    expect(html).toContain("Jan 10, 2026");
  });

  it("renders the upcoming section with localized future-day events", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T12:00:00.000Z"));

    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue({
      id: "cat-1",
      name: "Milo",
      userId: AUTHED_SESSION.user.id,
      user: {
        timezone: "America/New_York",
      },
      createdAt: new Date(),
    } as any);
    vi.mocked(prisma.injectionEvent.findMany).mockResolvedValue([
      {
        id: "event-1",
        status: "UPCOMING",
        scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
      },
      {
        id: "event-2",
        status: "UPCOMING",
        scheduledAt: new Date("2026-01-11T13:00:00.000Z"),
      },
    ] as any);

    const DashboardPage = await getDashboardPage();
    const html = toHtml((await DashboardPage()) as React.ReactElement);

    expect(html).toContain("Upcoming");
    expect(html).toContain("Jan 11, 2026, 8:00 AM");
    expect(html).not.toContain("2026-01-10T13:00:00.000Z");
  });

  it("localizes current-day events without leaking raw timestamps", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T13:00:00.000Z"));

    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue({
      id: "cat-1",
      name: "Milo",
      userId: AUTHED_SESSION.user.id,
      user: {
        timezone: "America/New_York",
      },
      createdAt: new Date(),
    } as any);
    vi.mocked(prisma.injectionEvent.findMany).mockImplementation(async (args: any) => {
      const events = [
        {
          id: "event-past",
          status: "UPCOMING",
          scheduledAt: new Date("2026-01-10T12:59:59.000Z"),
        },
        {
          id: "event-now",
          status: "UPCOMING",
          scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
        },
      ];

      return events.filter((event) => event.scheduledAt >= args.where.scheduledAt.gte) as any;
    });

    const DashboardPage = await getDashboardPage();
    const html = toHtml((await DashboardPage()) as React.ReactElement);

    expect(html).toContain("8:00 AM");
    expect(html).not.toContain("2026-01-10T12:59:59.000Z");
  });

  it("renders prototype dashboard sections with the next action, today's injections, upcoming events, and Home nav active", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T13:10:00.000Z"));

    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue({
      id: "cat-1",
      name: "Milo",
      userId: AUTHED_SESSION.user.id,
      user: {
        timezone: "America/New_York",
      },
      injectionSchedules: [
        {
          id: "schedule-1",
          trackingWindowMinutes: 45,
          defaultDosage: { toString: () => "1.5" },
        },
      ],
      createdAt: new Date(),
    } as any);
    vi.mocked(prisma.injectionEvent.findMany).mockResolvedValue([
      {
        id: "event-due",
        status: "UPCOMING",
        scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
        schedule: {
          id: "schedule-1",
          trackingWindowMinutes: 45,
          defaultDosage: { toString: () => "1.5" },
        },
      },
      {
        id: "event-later-today",
        status: "UPCOMING",
        scheduledAt: new Date("2026-01-11T01:00:00.000Z"),
        schedule: {
          id: "schedule-1",
          trackingWindowMinutes: 45,
          defaultDosage: { toString: () => "1.5" },
        },
      },
      {
        id: "event-tomorrow",
        status: "UPCOMING",
        scheduledAt: new Date("2026-01-11T13:00:00.000Z"),
        schedule: {
          id: "schedule-1",
          trackingWindowMinutes: 45,
          defaultDosage: { toString: () => "1.5" },
        },
      },
    ] as any);

    const DashboardPage = await getDashboardPage();
    const html = toHtml((await DashboardPage()) as React.ReactElement);

    expect(html).toContain("Milo");
    expect(html).toContain("Jan 10, 2026");
    expect(html).toContain("Next injection");
    expect(html).toContain("8:00 AM");
    expect(html).toContain("1.5 units");
    expect(html).toContain("45 minute window");
    expect(html).toContain("Log injection now");
    expect(html).not.toContain("disabled");
    expect(html).toContain("Today&#x27;s injections");
    expect(html).toContain("Upcoming");
    expect(html).toContain("Jan 11, 2026, 8:00 AM");
    expect(html).toContain("Home");
    expect(html).toContain('aria-current="page"');
  });

  it("renders supply summary cards and low warning state", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T13:10:00.000Z"));

    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue({
      id: "cat-1",
      name: "Milo",
      userId: AUTHED_SESSION.user.id,
      user: {
        timezone: "America/New_York",
      },
      injectionSchedules: [
        {
          id: "schedule-1",
          trackingWindowMinutes: 45,
          defaultDosage: { toString: () => "1.5" },
        },
      ],
      createdAt: new Date(),
    } as any);
    vi.mocked(prisma.injectionEvent.findMany).mockResolvedValue([] as any);
    vi.mocked((prisma as any).supplyRecord.findMany).mockResolvedValue([
      {
        id: "supply-insulin-active",
        type: "insulin",
        startedAt: new Date("2026-01-12T00:00:00.000Z"),
        startingAmount: { toString: () => "12" },
        remainingAmount: { toString: () => "12" },
        unit: "units",
        isActive: true,
        createdAt: new Date("2026-01-12T00:00:00.000Z"),
      },
      {
        id: "supply-needles-active",
        type: "needles",
        startedAt: new Date("2026-01-10T00:00:00.000Z"),
        startingAmount: { toString: () => "10" },
        remainingAmount: { toString: () => "10" },
        unit: "needles",
        isActive: true,
        createdAt: new Date("2026-01-10T00:00:00.000Z"),
      },
    ] as any);

    const DashboardPage = await getDashboardPage();
    const html = toHtml((await DashboardPage()) as React.ReactElement);

    expect(html).toContain("Insulin running low — Consider ordering...");
    expect(html).toContain("12 units");
    expect(html).toContain("10 needles");
    expect(html).toContain("days remaining");
  });

  it("keeps missed early-today events in today's section while leaving tomorrow in upcoming", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-11T04:30:00.000Z"));

    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue({
      id: "cat-1",
      name: "Milo",
      userId: AUTHED_SESSION.user.id,
      user: {
        timezone: "America/New_York",
      },
      createdAt: new Date(),
    } as any);
    vi.mocked(prisma.injectionEvent.findMany).mockImplementation(async (args: any) => {
      const events = [
        {
          id: "event-missed",
          status: "UPCOMING",
          scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
          schedule: {
            trackingWindowMinutes: 45,
            missedThresholdHours: 12,
            defaultDosage: { toString: () => "1.5" },
          },
        },
        {
          id: "event-next-day",
          status: "UPCOMING",
          scheduledAt: new Date("2026-01-11T13:00:00.000Z"),
          schedule: {
            trackingWindowMinutes: 45,
            missedThresholdHours: 12,
            defaultDosage: { toString: () => "1.5" },
          },
        },
      ];

      return events.filter((event) => event.scheduledAt >= args.where.scheduledAt.gte) as any;
    });

    const DashboardPage = await getDashboardPage();
    const html = toHtml((await DashboardPage()) as React.ReactElement);

    expect(html).toContain("Today&#x27;s injections");
    expect(html).toContain("Missed");
    expect(html).toContain("Jan 11, 2026, 8:00 AM");
  });

  it("treats persisted completed events as logged until log relations exist", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T15:00:00.000Z"));

    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue({
      id: "cat-1",
      name: "Milo",
      userId: AUTHED_SESSION.user.id,
      user: {
        timezone: "America/New_York",
      },
      createdAt: new Date(),
    } as any);
    vi.mocked(prisma.injectionEvent.findMany).mockResolvedValue([
      {
        id: "event-completed",
        status: "COMPLETED",
        scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
        schedule: {
          trackingWindowMinutes: 45,
          missedThresholdHours: 12,
          defaultDosage: { toString: () => "1.5" },
        },
      },
      {
        id: "event-next",
        status: "UPCOMING",
        scheduledAt: new Date("2026-01-11T13:00:00.000Z"),
        schedule: {
          trackingWindowMinutes: 45,
          missedThresholdHours: 12,
          defaultDosage: { toString: () => "1.5" },
        },
      },
    ] as any);

    const DashboardPage = await getDashboardPage();
    const html = toHtml((await DashboardPage()) as React.ReactElement);

    expect(html).toContain("Logged");
    expect(html).toContain("Jan 11, 2026, 8:00 AM");
    expect(html).not.toContain("Late");
  });
});
