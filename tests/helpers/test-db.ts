import path from "path";
import { PrismaClient } from "../../prisma/test/client";

const TEST_DB_URL = `file:${path.resolve(__dirname, "../../prisma/test/test.db")}`;

export const prisma = new PrismaClient({
  datasources: { db: { url: TEST_DB_URL } },
});

export async function resetDatabase() {
  await prisma.injectionEvent.deleteMany();
  await prisma.injectionScheduleTime.deleteMany();
  await prisma.injectionSchedule.deleteMany();
  await prisma.session.deleteMany();
  await prisma.cat.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
}
