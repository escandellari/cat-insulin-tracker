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

const INVALID_SUPPLY_CASES = [
  {
    label: "invalid type",
    payload: { type: "food", startedAt: "2026-01-12", startingAmount: 100 },
    errorField: "type",
  },
  {
    label: "non-positive amount",
    payload: { type: "needles", startedAt: "2026-01-12", startingAmount: 0 },
    errorField: "startingAmount",
  },
  {
    label: "malformed started date",
    payload: { type: "insulin", startedAt: "2026-13-99", startingAmount: 100 },
    errorField: "startedAt",
  },
] as const;

async function seedAuthedCat() {
  await prisma.user.create({
    data: {
      id: AUTHED_SESSION.user.id,
      email: AUTHED_SESSION.user.email,
      name: AUTHED_SESSION.user.name,
      timezone: "America/New_York",
      emailVerified: null,
      createdAt: "",
    },
  });

  const cat = await prisma.cat.create({
    data: {
      userId: AUTHED_SESSION.user.id,
      name: "Milo",
      treatmentStartDate: new Date("2026-01-10T00:00:00.000Z"),
    },
  });

  const schedule = await prisma.injectionSchedule.create({
    data: {
      catId: cat.id,
      defaultDosage: 1.5,
      defaultNeedlesPerInjection: 1,
      trackingWindowMinutes: 45,
    },
  });

  await prisma.injectionScheduleTime.createMany({
    data: [
      { scheduleId: schedule.id, timeOfDay: "08:00", sortOrder: 0 },
      { scheduleId: schedule.id, timeOfDay: "20:00", sortOrder: 1 },
    ],
  });

  vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
  return cat;
}

describe("POST /api/supplies", () => {
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

  it("records new insulin inventory as the active supply", async () => {
    const cat = await seedAuthedCat();
    const { POST } = await import("@/app/api/supplies/route");

    const response = await POST(
      new Request("http://localhost/api/supplies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          catId: cat.id,
          type: "insulin",
          startedAt: "2026-01-12",
          startingAmount: 100,
        }),
      }),
    );

    expect(response.status).toBe(201);

    const supplies = await prisma.supplyRecord.findMany({
      where: { catId: cat.id },
      orderBy: { createdAt: "asc" },
    });

    expect(supplies).toHaveLength(1);
    expect(supplies[0]).toMatchObject({
      catId: cat.id,
      type: "insulin",
      startingAmount: 100,
      remainingAmount: 100,
      unit: "units",
      isActive: true,
    });
  });

  it("deactivates the prior active record of the same type and preserves history", async () => {
    const cat = await seedAuthedCat();
    await prisma.supplyRecord.create({
      data: {
        catId: cat.id,
        type: "insulin",
        startedAt: new Date("2026-01-01T00:00:00.000Z"),
        startingAmount: 80,
        remainingAmount: 20,
        unit: "units",
      },
    });

    const { POST } = await import("@/app/api/supplies/route");
    const response = await POST(
      new Request("http://localhost/api/supplies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          catId: cat.id,
          type: "insulin",
          startedAt: "2026-01-12",
          startingAmount: 100,
        }),
      }),
    );

    expect(response.status).toBe(201);

    const supplies = await prisma.supplyRecord.findMany({
      where: { catId: cat.id, type: "insulin" },
      orderBy: { startedAt: "asc" },
    });

    expect(supplies).toHaveLength(2);
    expect(supplies[0].isActive).toBe(false);
    expect(supplies[0].remainingAmount).toBe(20);
    expect(supplies[1]).toMatchObject({
      isActive: true,
      startingAmount: 100,
      remainingAmount: 100,
    });
  });

  it.each(INVALID_SUPPLY_CASES)("returns field errors for $label", async ({ payload, errorField }) => {
    const cat = await seedAuthedCat();
    const { POST } = await import("@/app/api/supplies/route");

    const response = await POST(
      new Request("http://localhost/api/supplies", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ catId: cat.id, ...payload }),
      }),
    );

    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.errors[errorField]).toBeTruthy();
    expect(await prisma.supplyRecord.count()).toBe(0);
  });
});
