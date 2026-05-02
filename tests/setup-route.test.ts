import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTHED_SESSION } from "./helpers/auth";
import { prisma, resetDatabase } from "./helpers/test-db";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/db", async () => {
  const { prisma } = await import("./helpers/test-db");
  return { prisma };
});

import { auth } from "@/auth";

describe("POST /api/setup", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    await resetDatabase();
  });

  it("creates cat, schedule, events, and redirects to dashboard", async () => {
    await prisma.user.create({
      data: {
        id: AUTHED_SESSION.user.id,
        email: AUTHED_SESSION.user.email,
        name: AUTHED_SESSION.user.name,
      },
    });
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);

    const { POST } = await import("@/app/api/setup/route");
    const request = new Request("http://localhost/api/setup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        catName: "Milo",
        injectionTimes: ["08:00", "20:00"],
        defaultDosage: 1.5,
        defaultNeedlesPerInjection: 2,
        timezone: "America/New_York",
        scheduleStartDate: "2026-01-10",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/dashboard");

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: AUTHED_SESSION.user.id },
    });
    expect(user.timezone).toBe("America/New_York");

    const cat = await prisma.cat.findFirstOrThrow({
      where: { userId: AUTHED_SESSION.user.id },
    });
    expect(cat.name).toBe("Milo");

    const schedule = await prisma.injectionSchedule.findFirstOrThrow({
      where: { catId: cat.id },
      include: { times: true },
    });
    expect(schedule.defaultDosage.toString()).toBe("1.5");
    expect(schedule.defaultNeedlesPerInjection).toBe(2);
    expect(schedule.isActive).toBe(true);
    expect(schedule.times.map((time) => time.timeOfDay)).toEqual(["08:00", "20:00"]);

    const events = await prisma.injectionEvent.findMany({
      where: { scheduleId: schedule.id },
      orderBy: { scheduledAt: "asc" },
    });
    expect(events).toHaveLength(182);
    expect(events[0]?.status).toBe("UPCOMING");
    expect(events[0]?.scheduledAt.toISOString()).toBe("2026-01-10T13:00:00.000Z");
    expect(events[1]?.scheduledAt.toISOString()).toBe("2026-01-11T01:00:00.000Z");
    expect(events.at(-1)?.scheduledAt.toISOString()).toBe("2026-04-11T00:00:00.000Z");
  });

  it.each([
    {
      name: "missing injection times",
      payload: {
        catName: "Milo",
        injectionTimes: [],
        defaultDosage: 1.5,
        defaultNeedlesPerInjection: 2,
        timezone: "America/New_York",
        scheduleStartDate: "2026-01-10",
      },
      field: "injectionTimes",
    },
    {
      name: "past start date older than one year",
      payload: {
        catName: "Milo",
        injectionTimes: ["08:00"],
        defaultDosage: 1.5,
        defaultNeedlesPerInjection: 2,
        timezone: "America/New_York",
        scheduleStartDate: "2020-01-10",
      },
      field: "scheduleStartDate",
    },
  ])("returns 400 for $name", async ({ payload, field }) => {
    await prisma.user.create({
      data: {
        id: AUTHED_SESSION.user.id,
        email: AUTHED_SESSION.user.email,
        name: AUTHED_SESSION.user.name,
      },
    });
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);

    const { POST } = await import("@/app/api/setup/route");
    const request = new Request("http://localhost/api/setup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.errors[field]).toBeTruthy();
  });

  it("returns 400 for duplicate injection times and persists nothing", async () => {
    await prisma.user.create({
      data: {
        id: AUTHED_SESSION.user.id,
        email: AUTHED_SESSION.user.email,
        name: AUTHED_SESSION.user.name,
      },
    });
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);

    const { POST } = await import("@/app/api/setup/route");
    const request = new Request("http://localhost/api/setup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        catName: "Milo",
        injectionTimes: ["08:00", "08:00"],
        defaultDosage: 1.5,
        defaultNeedlesPerInjection: 2,
        timezone: "America/New_York",
        scheduleStartDate: "2026-01-10",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.errors.injectionTimes).toContain("Injection times must be unique");
    expect(await prisma.cat.count()).toBe(0);
    expect(await prisma.injectionSchedule.count()).toBe(0);
    expect(await prisma.injectionScheduleTime.count()).toBe(0);
    expect(await prisma.injectionEvent.count()).toBe(0);
  });

  it("returns 400 for invalid timezone and persists nothing", async () => {
    await prisma.user.create({
      data: {
        id: AUTHED_SESSION.user.id,
        email: AUTHED_SESSION.user.email,
        name: AUTHED_SESSION.user.name,
      },
    });
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);

    const { POST } = await import("@/app/api/setup/route");
    const request = new Request("http://localhost/api/setup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        catName: "Milo",
        injectionTimes: ["08:00"],
        defaultDosage: 1.5,
        defaultNeedlesPerInjection: 2,
        timezone: "Mars/Base",
        scheduleStartDate: "2026-01-10",
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.errors.timezone).toContain("Timezone must be a valid IANA timezone");
    expect(await prisma.cat.count()).toBe(0);
    expect(await prisma.injectionSchedule.count()).toBe(0);
    expect(await prisma.injectionScheduleTime.count()).toBe(0);
    expect(await prisma.injectionEvent.count()).toBe(0);
  });

  it("returns 409 for repeat setup submission and does not create duplicate records", async () => {
    await prisma.user.create({
      data: {
        id: AUTHED_SESSION.user.id,
        email: AUTHED_SESSION.user.email,
        name: AUTHED_SESSION.user.name,
      },
    });
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);

    const { POST } = await import("@/app/api/setup/route");
    const payload = {
      catName: "Milo",
      injectionTimes: ["08:00", "20:00"],
      defaultDosage: 1.5,
      defaultNeedlesPerInjection: 2,
      timezone: "America/New_York",
      scheduleStartDate: "2026-01-10",
    };

    const firstResponse = await POST(
      new Request("http://localhost/api/setup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }),
    );

    expect(firstResponse.status).toBe(303);

    const response = await POST(
      new Request("http://localhost/api/setup", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.error).toBe("Setup already completed");
    expect(await prisma.cat.count()).toBe(1);
    expect(await prisma.injectionSchedule.count()).toBe(1);
    expect(await prisma.injectionScheduleTime.count()).toBe(2);
    expect(await prisma.injectionEvent.count()).toBe(182);
  });
});
