import type { PrismaClient } from "@prisma/client";
import type { SetupInput } from "./schema";
import { generateInjectionEvents } from "./generate-injection-events";

export async function createSetup(prisma: PrismaClient, userId: string, input: SetupInput) {
  return prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { timezone: input.timezone },
    });

    const cat = await tx.cat.create({
      data: {
        userId,
        name: input.catName,
      },
    });

    const schedule = await tx.injectionSchedule.create({
      data: {
        catId: cat.id,
        defaultDosage: input.defaultDosage,
        defaultNeedlesPerInjection: input.defaultNeedlesPerInjection,
        times: {
          create: input.injectionTimes.map((timeOfDay, sortOrder) => ({
            timeOfDay,
            sortOrder,
          })),
        },
      },
    });

    await tx.injectionEvent.createMany({
      data: generateInjectionEvents({
        catId: cat.id,
        scheduleId: schedule.id,
        startDate: input.scheduleStartDate,
        timezone: input.timezone,
        injectionTimes: input.injectionTimes,
      }),
    });

    return { cat, schedule };
  });
}
