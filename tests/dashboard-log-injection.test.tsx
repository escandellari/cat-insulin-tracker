import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTHED_SESSION, toHtml } from "./helpers/auth";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

const mockCatFindFirst = vi.fn();
const mockEventFindMany = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    cat: {
      findFirst: mockCatFindFirst,
    },
    injectionEvent: {
      findMany: mockEventFindMany,
    },
  },
}));

import { auth } from "@/auth";

async function getDashboardPage() {
  const { default: Page } = await import("@/app/dashboard/page");
  return Page;
}

describe("Dashboard log injection flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T13:10:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("enables 'Log injection now' button when event is due", async () => {
    vi.mocked(auth as any).mockResolvedValue(AUTHED_SESSION as any);
    mockCatFindFirst.mockResolvedValue({
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
    mockEventFindMany.mockResolvedValue([
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
    ] as any);

    const DashboardPage = await getDashboardPage();
    const html = toHtml((await DashboardPage()) as React.ReactElement);

    expect(html).not.toContain("disabled");
    expect(html).toContain("Log injection now");
  });

  it("disables 'Log injection now' button when no due event", async () => {
    vi.mocked(auth as any).mockResolvedValue(AUTHED_SESSION as any);
    mockCatFindFirst.mockResolvedValue({
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
    mockEventFindMany.mockResolvedValue([
      {
        id: "event-upcoming",
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

    expect(html).toContain("disabled");
    expect(html).toContain("Log injection now");
  });

  it("shows 'Logged' status for completed events", async () => {
    vi.mocked(auth as any).mockResolvedValue(AUTHED_SESSION as any);
    mockCatFindFirst.mockResolvedValue({
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
    mockEventFindMany.mockResolvedValue([
      {
        id: "event-logged",
        status: "COMPLETED",
        scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
        schedule: {
          id: "schedule-1",
          trackingWindowMinutes: 45,
          defaultDosage: { toString: () => "1.5" },
        },
      },
    ] as any);

    const DashboardPage = await getDashboardPage();
    const html = toHtml((await DashboardPage()) as React.ReactElement);

    expect(html).toContain("Logged");
    expect(html).toContain("1.5 units");
  });
});
