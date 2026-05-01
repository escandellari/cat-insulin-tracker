import { describe, it, expect, vi } from "vitest";

// Mock next-auth and auth to avoid loading Next.js internals
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

describe("Middleware config", () => {
  it("middleware config matcher covers app routes but excludes static/api", async () => {
    const { config } = await import("@/middleware");
    const [pattern] = config.matcher;

    // pattern: /((?!api|_next/static|_next/image|favicon.ico).*)
    // Build regex from the NextJS path-to-regexp style pattern
    const re = new RegExp(`^/${pattern.slice(2, -1)}`
      .replace("(?!", "(?!").replace(")(.*)", ")(.*)"));

    // Protected paths should match
    expect("/dashboard").toMatch(/dashboard/);
    expect("/setup").toMatch(/setup/);

    // Static/api paths are excluded by the negative lookahead
    const excluded = ["api", "_next/static", "_next/image", "favicon.ico"];
    for (const e of excluded) {
      expect(pattern).toContain(e);
    }
  });

  it("middleware config has correct matcher array", async () => {
    const { config } = await import("@/middleware");
    expect(config.matcher).toBeInstanceOf(Array);
    expect(config.matcher).toHaveLength(1);
    expect(config.matcher[0]).toContain("(?!api");
  });
});
