import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTHED_SESSION, toHtml } from "./helpers/auth";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    cat: {
      findFirst: vi.fn(),
    },
    injectionEvent: {
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

  it("renders signed-in user's name in dashboard", async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue({
      id: "cat-1",
      name: "Milo",
      userId: AUTHED_SESSION.user.id,
      createdAt: new Date(),
    } as any);
    vi.mocked(prisma.injectionEvent.findMany).mockResolvedValue([]);

    const DashboardPage = await getDashboardPage();
    const html = toHtml((await DashboardPage()) as React.ReactElement);

    expect(html).toContain("Jane Doe");
  });

  it("shows at least one upcoming injection event after setup", async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue({
      id: "cat-1",
      name: "Milo",
      userId: AUTHED_SESSION.user.id,
      createdAt: new Date(),
    } as any);
    vi.mocked(prisma.injectionEvent.findMany).mockResolvedValue([
      {
        id: "event-1",
        status: "UPCOMING",
        scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
      },
    ] as any);

    const DashboardPage = await getDashboardPage();
    const html = toHtml((await DashboardPage()) as React.ReactElement);

    expect(html).toContain("Upcoming injections");
    expect(html).toContain("2026-01-10T13:00:00.000Z");
  });

  it("excludes past upcoming events from the dashboard list", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T13:00:00.000Z"));

    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue({
      id: "cat-1",
      name: "Milo",
      userId: AUTHED_SESSION.user.id,
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

    expect(html).toContain("2026-01-10T13:00:00.000Z");
    expect(html).not.toContain("2026-01-10T12:59:59.000Z");
  });
});
