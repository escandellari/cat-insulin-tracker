import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AUTHED_SESSION } from "./helpers/auth";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

const mockEventFindFirst = vi.fn();
const mockEventUpdate = vi.fn();
const mockLogCreate = vi.fn();
const mockTransaction = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    $transaction: mockTransaction,
    injectionEvent: {
      findFirst: mockEventFindFirst,
      update: mockEventUpdate,
    },
    injectionLog: {
      create: mockLogCreate,
    },
  },
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

import { auth } from "@/auth";

const { POST } = await import("@/app/api/injections/log/route");

describe("POST /api/injections/log", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-10T13:10:00.000Z"));
    mockTransaction.mockImplementation(async (callback) => callback({
      injectionLog: { create: mockLogCreate },
      injectionEvent: { update: mockEventUpdate },
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a log and returns 201 with log id", async () => {
    mockEventFindFirst.mockResolvedValue({
      id: "event-due",
      scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
      status: "UPCOMING",
      schedule: {
        trackingWindowMinutes: 45,
        missedThresholdHours: 12,
      },
      cat: {
        user: {
          timezone: "America/New_York",
        },
      },
    });

    mockLogCreate.mockResolvedValue({
      id: "log-1",
      eventId: "event-due",
      dosageGiven: 1.5,
      needlesUsed: 1,
      actualGivenAt: "2026-01-10T13:05:00.000Z",
      site: "left-shoulder",
      notes: null,
      createdAt: new Date(),
    });

    const request = new Request("http://localhost/api/injections/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: "event-due",
        actualGivenAt: "2026-01-10T13:05",
        dosageGiven: 1.5,
        needlesUsed: 1,
        site: "left-shoulder",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(body.eventId).toBe("event-due");

    expect(mockEventFindFirst).toHaveBeenCalledWith({
      where: {
        id: "event-due",
        cat: { userId: AUTHED_SESSION.user.id },
      },
      select: {
        id: true,
        scheduledAt: true,
        status: true,
        schedule: {
          select: {
            trackingWindowMinutes: true,
            missedThresholdHours: true,
          },
        },
        cat: {
          select: {
            user: {
              select: {
                timezone: true,
              },
            },
          },
        },
      },
    });
    expect(mockLogCreate).toHaveBeenCalledWith({
      data: {
        eventId: "event-due",
        actualGivenAt: new Date("2026-01-10T18:05:00.000Z"),
        dosageGiven: 1.5,
        needlesUsed: 1,
        site: "left-shoulder",
        notes: undefined,
      },
    });
    expect(mockEventUpdate).toHaveBeenCalledWith({
      where: { id: "event-due" },
      data: { status: "COMPLETED" },
    });
    expect(mockTransaction).toHaveBeenCalledTimes(1);
  });

  it("returns 401 when not signed in", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const request = new Request("http://localhost/api/injections/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: "event-due",
        actualGivenAt: "2026-01-10T13:05",
        dosageGiven: 1.5,
        needlesUsed: 1,
        site: "left-shoulder",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(mockEventFindFirst).not.toHaveBeenCalled();
  });

  it("returns 404 when event not found", async () => {
    mockEventFindFirst.mockResolvedValue(null);

    const request = new Request("http://localhost/api/injections/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: "non-existent",
        actualGivenAt: "2026-01-10T13:05",
        dosageGiven: 1.5,
        needlesUsed: 1,
        site: "left-shoulder",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(404);

    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  it("returns 400 for invalid input", async () => {
    const request = new Request("http://localhost/api/injections/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: "",
        actualGivenAt: "abc",
        dosageGiven: -1,
        needlesUsed: -1,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty("errors");
    expect(body.errors.actualGivenAt).toEqual(["Actual time must be a valid date and time"]);
    expect(mockTransaction).not.toHaveBeenCalled();
  });

  it("returns 409 with clear error when event already has a log", async () => {
    mockEventFindFirst.mockResolvedValue({
      id: "event-due",
      scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
      status: "UPCOMING",
      schedule: {
        trackingWindowMinutes: 45,
        missedThresholdHours: 12,
      },
      cat: {
        user: {
          timezone: "America/New_York",
        },
      },
    });
    mockLogCreate.mockRejectedValue({
      code: "P2002",
      meta: { target: ["eventId"] },
    });

    const request = new Request("http://localhost/api/injections/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: "event-due",
        actualGivenAt: "2026-01-10T13:05",
        dosageGiven: 1.5,
        needlesUsed: 1,
        site: "left-shoulder",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Injection already logged for this event",
    });
    expect(mockEventUpdate).not.toHaveBeenCalled();
  });

  it("returns duplicate-specific 409 for already completed events", async () => {
    mockEventFindFirst.mockResolvedValue({
      id: "event-completed",
      scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
      status: "COMPLETED",
      schedule: {
        trackingWindowMinutes: 45,
        missedThresholdHours: 12,
      },
      cat: {
        user: {
          timezone: "America/New_York",
        },
      },
    });

    const request = new Request("http://localhost/api/injections/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: "event-completed",
        actualGivenAt: "2026-01-10T13:05",
        dosageGiven: 1.5,
        needlesUsed: 1,
        site: "left-shoulder",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Injection already logged for this event",
    });
    expect(mockTransaction).not.toHaveBeenCalled();
    expect(mockLogCreate).not.toHaveBeenCalled();
    expect(mockEventUpdate).not.toHaveBeenCalled();
  });

  it("returns 409 when the event is not due or late", async () => {
    mockEventFindFirst.mockResolvedValue({
      id: "event-upcoming",
      scheduledAt: new Date("2026-01-10T13:30:00.000Z"),
      status: "UPCOMING",
      schedule: {
        trackingWindowMinutes: 45,
        missedThresholdHours: 12,
      },
      cat: {
        user: {
          timezone: "America/New_York",
        },
      },
    });

    const request = new Request("http://localhost/api/injections/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: "event-upcoming",
        actualGivenAt: "2026-01-10T13:05",
        dosageGiven: 1.5,
        needlesUsed: 1,
        site: "left-shoulder",
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: "Injection can only be logged for due or late events",
    });
    expect(mockLogCreate).not.toHaveBeenCalled();
    expect(mockEventUpdate).not.toHaveBeenCalled();
  });
});
