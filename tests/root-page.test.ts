import { beforeEach, describe, expect, it, vi } from "vitest";

import { redirect } from "next/navigation";

describe("Root page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects users into the app flow via /auth/signin", async () => {
    const { default: HomePage } = await import("@/app/page");

    expect(() => HomePage()).toThrow("REDIRECT:/auth/signin");
    expect(redirect).toHaveBeenCalledWith("/auth/signin");
  });
});
