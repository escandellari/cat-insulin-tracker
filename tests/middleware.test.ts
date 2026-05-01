import { describe, it, expect, vi } from "vitest";

// Mock next-auth and auth to avoid loading Next.js internals
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

describe("Middleware config", () => {
  it("middleware config matcher covers app routes but excludes static/api", async () => {
    const { config } = await import("@/middleware");
    const [pattern] = config.matcher;

    // The negative lookahead must exclude these prefixes
    const excluded = ["api", "_next/static", "_next/image", "favicon.ico"];
    for (const e of excluded) {
      expect(pattern).toContain(e);
    }

    // Protected paths must NOT be excluded by the pattern
    expect(pattern).not.toContain("dashboard");
    expect(pattern).not.toContain("setup");
  });

  it("middleware config has correct matcher array", async () => {
    const { config } = await import("@/middleware");
    expect(config.matcher).toBeInstanceOf(Array);
    expect(config.matcher).toHaveLength(1);
    expect(config.matcher[0]).toContain("(?!api");
  });
});
