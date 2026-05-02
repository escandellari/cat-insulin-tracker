import { Prisma, type PrismaClient } from "@prisma/client";
import type { SetupInput } from "./schema";
import { generateInjectionEvents } from "./generate-injection-events";

export class SetupAlreadyExistsError extends Error {
  constructor() {
    super("Setup already completed");
  }
}

export async function createSetup(prisma: PrismaClient, userId: string, input: SetupInput) {
  try {
    return await prisma.$transaction(async (tx) => {
      const existingCat = await tx.cat.findFirst({
        where: { userId },
        select: { id: true },
      });

      if (existingCat) {
        throw new SetupAlreadyExistsError();
      }

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
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new SetupAlreadyExistsError();
    }

    throw error;
  }
}
