import { describe, it, expect, vi, beforeEach } from "vitest";
import { AUTHED_SESSION, toHtml } from "./helpers/auth";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    cat: { findFirst: vi.fn() },
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

describe("Dashboard sign-out UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 7: dashboard shows sign-out button
  it("renders a sign-out form/button on the dashboard", async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue(null);

    const { default: DashboardPage } = await import("@/app/dashboard/page");
    const html = toHtml((await DashboardPage()) as React.ReactElement);

    // Assert on the visible button label, not an attribute or CSS class
    expect(html).toContain("Sign out");
  });
});
