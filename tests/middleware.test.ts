import { describe, it, expect, vi } from "vitest";

// Mock next-auth and auth to avoid loading Next.js internals
vi.mock("@/auth", () => ({
  auth: vi.fn(),
}));

describe("Middleware config", () => {
  it("matcher excludes auth, api, and static paths from middleware", async () => {
    const { config } = await import("@/middleware");
    const [pattern] = config.matcher;
    // Next.js anchors the matcher pattern at start and end when evaluating paths
    const re = new RegExp("^" + pattern + "$");

    // These must NOT be intercepted by middleware (excluded via negative lookahead)
    expect(re.test("/auth/signin")).toBe(false);
    expect(re.test("/auth/callback/google")).toBe(false);
    expect(re.test("/api/auth/session")).toBe(false);
    expect(re.test("/_next/static/chunk.js")).toBe(false);
    expect(re.test("/_next/image")).toBe(false);
    expect(re.test("/favicon.ico")).toBe(false);
  });

  it("matcher intercepts protected app routes", async () => {
    const { config } = await import("@/middleware");
    const [pattern] = config.matcher;
    const re = new RegExp("^" + pattern + "$");

    expect(re.test("/dashboard")).toBe(true);
    expect(re.test("/setup")).toBe(true);
  });

  it("middleware config has correct matcher array", async () => {
    const { config } = await import("@/middleware");
    expect(config.matcher).toBeInstanceOf(Array);
    expect(config.matcher).toHaveLength(1);
    expect(config.matcher[0]).toContain("(?!api|auth");
  });
});
