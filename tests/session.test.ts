import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { PrismaClient } from "../prisma/test/client";

import path from "path";

const TEST_DB_URL = `file:${path.resolve(__dirname, "../prisma/test/test.db")}`;

const prisma = new PrismaClient({
  datasources: { db: { url: TEST_DB_URL } },
});

describe("Database session management", () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up in correct order to respect FK constraints
    await prisma.session.deleteMany();
    await prisma.cat.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
  });

  // Test 3: session row exists in DB after sign-in
  it("creates a session row in DB", async () => {
    const user = await prisma.user.create({
      data: { email: "test@example.com", name: "Test User" },
    });

    const sessionToken = "test-session-token-" + Date.now();
    const session = await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: new Date(Date.now() + 86400000),
      },
    });

    const found = await prisma.session.findUnique({
      where: { sessionToken },
    });

    expect(found).not.toBeNull();
    expect(found?.userId).toBe(user.id);
  });

  // Test 4: clearing session simulates sign-out
  it("deleting session row simulates sign-out", async () => {
    const user = await prisma.user.create({
      data: { email: "signout@example.com", name: "Sign Out User" },
    });

    const sessionToken = "signout-token-" + Date.now();
    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: new Date(Date.now() + 86400000),
      },
    });

    // Sign out = delete session
    await prisma.session.delete({ where: { sessionToken } });

    const found = await prisma.session.findUnique({ where: { sessionToken } });
    expect(found).toBeNull();
  });
});
