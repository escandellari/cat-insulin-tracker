import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createSetup, setupSchema, SetupAlreadyExistsError } from "@/features/setup";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.redirect(new URL("/auth/signin", request.url), 303);
  }

  const payload = await request.json();
  const parsed = setupSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    await createSetup(prisma, userId, parsed.data);
  } catch (error) {
    if (error instanceof SetupAlreadyExistsError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    throw error;
  }

  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}
