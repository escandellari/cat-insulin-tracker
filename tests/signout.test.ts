import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  handlers: { GET: vi.fn(), POST: vi.fn() },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    cat: { findFirst: vi.fn() },
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { renderToStaticMarkup } from "react-dom/server";

describe("Dashboard sign-out UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 7: dashboard shows sign-out button
  it("renders a sign-out form/button on the dashboard", async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: "user-1", name: "Jane Doe", email: "jane@example.com" },
      expires: new Date(Date.now() + 86400000).toISOString(),
    } as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue(null);

    const { default: DashboardPage } = await import("@/app/dashboard/page");
    const jsx = await DashboardPage();
    const html = renderToStaticMarkup(jsx as React.ReactElement);

    expect(html).toContain("sign-out");
  });
});
