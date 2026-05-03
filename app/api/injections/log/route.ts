import { auth } from "@/auth";
import { deriveEventStatus } from "@/features/scheduling";
import { fromZonedTime } from "date-fns-tz";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { logInjectionSchema } from "@/features/injections";

function isDuplicateEventLogError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002" &&
    "meta" in error &&
    typeof error.meta === "object" &&
    error.meta !== null &&
    "target" in error.meta &&
    Array.isArray(error.meta.target) &&
    error.meta.target.includes("eventId")
  );
}

function hasPersistedLogState(status: string | null | undefined) {
  return status === "COMPLETED" || status === "LATE" || status === "PARTIAL";
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const parsed = logInjectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { eventId, actualGivenAt, dosageGiven, needlesUsed, site, notes } = parsed.data;

    const event = await prisma.injectionEvent.findFirst({
      where: {
        id: eventId,
        cat: { userId },
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

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 },
      );
    }

    if (hasPersistedLogState(event.status)) {
      return NextResponse.json(
        { error: "Injection already logged for this event" },
        { status: 409 },
      );
    }

    const eventStatus = deriveEventStatus({
      scheduledAt: event.scheduledAt,
      now: new Date(),
      trackingWindowMinutes: event.schedule?.trackingWindowMinutes ?? 30,
      missedThresholdHours: event.schedule?.missedThresholdHours ?? 12,
      hasLog: false,
    });

    if (eventStatus !== "due" && eventStatus !== "late") {
      return NextResponse.json(
        { error: "Injection can only be logged for due or late events" },
        { status: 409 },
      );
    }

    const log = await prisma.$transaction(async (tx) => {
      const createdLog = await tx.injectionLog.create({
        data: {
          eventId,
          actualGivenAt: fromZonedTime(actualGivenAt, event.cat.user.timezone),
          dosageGiven,
          needlesUsed,
          site,
          notes,
        },
      });

      await tx.injectionEvent.update({
        where: { id: eventId },
        data: { status: "COMPLETED" },
      });

      return createdLog;
    });

    return NextResponse.json(
      { id: log.id, eventId: log.eventId },
      { status: 201 },
    );
  } catch (error) {
    if (isDuplicateEventLogError(error)) {
      return NextResponse.json(
        { error: "Injection already logged for this event" },
        { status: 409 },
      );
    }

    console.error("Error in POST /api/injections/log:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
