import { describe, expect, it, vi, beforeEach } from "vitest";
import { AUTHED_SESSION } from "./helpers/auth";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

const mockEventFindUnique = vi.fn();
const mockEventUpdate = vi.fn();
const mockLogCreate = vi.fn();

vi.mock("@/lib/db", () => ({
  prisma: {
    injectionEvent: {
      findUnique: mockEventFindUnique,
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
  });

  it("creates a log and returns 201 with log id", async () => {
    mockEventFindUnique.mockResolvedValue({
      id: "event-due",
      catId: "cat-1",
      scheduleId: "schedule-1",
      scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
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
        actualGivenAt: "2026-01-10T13:05:00.000Z",
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

    expect(mockEventFindUnique).toHaveBeenCalledWith({
      where: { id: "event-due" },
    });
    expect(mockLogCreate).toHaveBeenCalledWith({
      data: {
        eventId: "event-due",
        actualGivenAt: "2026-01-10T13:05:00.000Z",
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
  });

  it("returns 404 when event not found", async () => {
    mockEventFindUnique.mockResolvedValue(null);

    const request = new Request("http://localhost/api/injections/log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventId: "non-existent",
        actualGivenAt: "2026-01-10T13:05:00.000Z",
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
        dosageGiven: -1,
        needlesUsed: -1,
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty("errors");
  });

  it("returns 409 with clear error when event already has a log", async () => {
    mockEventFindUnique.mockResolvedValue({
      id: "event-due",
      catId: "cat-1",
      scheduleId: "schedule-1",
      scheduledAt: new Date("2026-01-10T13:00:00.000Z"),
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
        actualGivenAt: "2026-01-10T13:05:00.000Z",
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
});
