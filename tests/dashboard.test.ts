import { describe, it, expect, vi, beforeEach } from "vitest";
import { AUTHED_SESSION, toHtml } from "./helpers/auth";

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
    cat: {
      findFirst: vi.fn(),
    },
  },
}));

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

async function getDashboardPage() {
  const { default: Page } = await import("@/app/dashboard/page");
  return Page;
}

describe("Dashboard page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test 1: unauthenticated redirect
  it("redirects unauthenticated user to /auth/signin", async () => {
    vi.mocked(auth).mockResolvedValue(null);

    const DashboardPage = await getDashboardPage();
    await expect(DashboardPage()).rejects.toThrow("REDIRECT:/auth/signin");
    expect(redirect).toHaveBeenCalledWith("/auth/signin");
  });

  // Test 2: authenticated user with no cat sees empty state CTA
  it("returns JSX with empty-state CTA when user has no cat", async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue(null);

    const DashboardPage = await getDashboardPage();
    const html = toHtml((await DashboardPage()) as React.ReactElement);

    expect(html).toContain("Set up your cat");
    expect(html).toContain('href="/setup"');
  });

  // Test 6: dashboard renders user name/email alongside CTA
  it("renders signed-in user's name in dashboard", async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue(null);

    const DashboardPage = await getDashboardPage();
    const html = toHtml((await DashboardPage()) as React.ReactElement);

    expect(html).toContain("Jane Doe");
  });
});
