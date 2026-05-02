import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

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
