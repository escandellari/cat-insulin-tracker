import { auth } from "@/auth";
import { recordSupplySchema } from "@/features/supplies";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

function getUnit(type: "insulin" | "needles") {
  return type === "insulin" ? "units" : "needles";
}

export async function POST(request: Request) {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);

  if (payload === null) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = recordSupplySchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { catId, type, startedAt, startingAmount } = parsed.data;

  const cat = await prisma.cat.findFirst({
    where: { id: catId, userId },
    select: { id: true },
  });

  if (!cat) {
    return NextResponse.json({ error: "Cat not found" }, { status: 404 });
  }

  const supplyRecord = await prisma.$transaction(async (tx) => {
    await tx.supplyRecord.updateMany({
      where: { catId, type, isActive: true },
      data: { isActive: false },
    });

    return tx.supplyRecord.create({
      data: {
        catId,
        type,
        startedAt: new Date(`${startedAt}T00:00:00.000Z`),
        startingAmount,
        remainingAmount: startingAmount,
        unit: getUnit(type),
      },
    });
  });

  return NextResponse.json({ id: supplyRecord.id, type: supplyRecord.type }, { status: 201 });
}
