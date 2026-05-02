import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createSetup, setupSchema } from "@/features/setup";
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

  await createSetup(prisma, userId, parsed.data);

  return NextResponse.redirect(new URL("/dashboard", request.url), 303);
}
