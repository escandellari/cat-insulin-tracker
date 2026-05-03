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

const VALID_SETUP_PAYLOAD = {
  catName: "Milo",
  treatmentStartDate: "2026-01-10",
  browserTimezone: "America/Los_Angeles",
  morningTime: "08:00",
  eveningTime: "20:00",
  defaultDosage: 1.5,
  dueWindowMinutes: 45,
};

async function seedAuthedUser() {
  await prisma.user.create({
    data: {
      id: AUTHED_SESSION.user.id,
      email: AUTHED_SESSION.user.email,
      name: AUTHED_SESSION.user.name,
      timezone: "America/New_York",
    },
  });
  vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
}

function createSetupRequest(body: BodyInit) {
  return new Request("http://localhost/api/setup", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
  });
}

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

  it("persists morning/evening times, due window, treatment start date, and redirects to dashboard", async () => {
    await seedAuthedUser();

    const { POST } = await import("@/app/api/setup/route");
    const request = createSetupRequest(JSON.stringify(VALID_SETUP_PAYLOAD));

    const response = await POST(request);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://localhost/dashboard");

    const cat = await prisma.cat.findFirstOrThrow({
      where: { userId: AUTHED_SESSION.user.id },
    });
    expect(cat.name).toBe("Milo");
    expect(cat.treatmentStartDate.toISOString()).toBe("2026-01-10T00:00:00.000Z");

    const schedule = await prisma.injectionSchedule.findFirstOrThrow({
      where: { catId: cat.id },
      include: { times: true },
    });
    expect(schedule.defaultDosage.toString()).toBe("1.5");
    expect(schedule.defaultNeedlesPerInjection).toBe(1);
    expect(schedule.trackingWindowMinutes).toBe(45);
    expect(schedule.isActive).toBe(true);
    expect(schedule.times.map((time) => time.timeOfDay)).toEqual(["08:00", "20:00"]);

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: AUTHED_SESSION.user.id },
    });
    expect(user.timezone).toBe("America/Los_Angeles");

    const events = await prisma.injectionEvent.findMany({
      where: { scheduleId: schedule.id },
      orderBy: { scheduledAt: "asc" },
      take: 2,
    });
    expect(events.map((event) => event.scheduledAt.toISOString())).toEqual([
      "2026-01-10T16:00:00.000Z",
      "2026-01-11T04:00:00.000Z",
    ]);
  });

  it("returns field errors for DST-gap times instead of raising a 500", async () => {
    await seedAuthedUser();

    const { POST } = await import("@/app/api/setup/route");
    const request = createSetupRequest(
      JSON.stringify({
        ...VALID_SETUP_PAYLOAD,
        treatmentStartDate: "2026-03-07",
        browserTimezone: "America/New_York",
        morningTime: "02:00",
      }),
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      errors: {
        morningTime: ["Time does not exist in your timezone because of daylight saving time"],
      },
    });
  });

  it("returns past-date errors on treatmentStartDate", async () => {
    await seedAuthedUser();

    const { POST } = await import("@/app/api/setup/route");
    const oldDate = new Date();
    oldDate.setUTCHours(0, 0, 0, 0);
    oldDate.setUTCDate(oldDate.getUTCDate() - 366);
    const treatmentStartDate = oldDate.toISOString().slice(0, 10);
    const request = createSetupRequest(
      JSON.stringify({
        ...VALID_SETUP_PAYLOAD,
        treatmentStartDate,
      }),
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      errors: {
        treatmentStartDate: ["Start date cannot be more than 1 year in the past"],
      },
    });
  });

  it("returns 400 for malformed times instead of crashing during DST checks", async () => {
    await seedAuthedUser();

    const { POST } = await import("@/app/api/setup/route");
    const request = createSetupRequest(
      JSON.stringify({
        ...VALID_SETUP_PAYLOAD,
        morningTime: "99:99",
      }),
    );

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      errors: {
        morningTime: ["Morning time must be a real 24-hour time"],
      },
    });
  });
});
