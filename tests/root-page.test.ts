import { beforeEach, describe, expect, it, vi } from "vitest";

import { redirect } from "next/navigation";

describe("Root page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects users into the app flow via /dashboard", async () => {
    const { default: HomePage } = await import("@/app/page");

    expect(() => HomePage()).toThrow("REDIRECT:/dashboard");
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });
});
