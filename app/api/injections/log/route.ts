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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = logInjectionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { eventId, actualGivenAt, dosageGiven, needlesUsed, site, notes } = parsed.data;

    const event = await prisma.injectionEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 },
      );
    }

    const log = await prisma.injectionLog.create({
      data: {
        eventId,
        actualGivenAt: actualGivenAt,
        dosageGiven,
        needlesUsed,
        site,
        notes,
      },
    });

    await prisma.injectionEvent.update({
      where: { id: eventId },
      data: { status: "COMPLETED" },
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
