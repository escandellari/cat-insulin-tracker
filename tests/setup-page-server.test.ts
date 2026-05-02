import { beforeEach, describe, expect, it, vi } from "vitest";
import { AUTHED_SESSION } from "./helpers/auth";

vi.mock("@/auth", () => ({
  auth: vi.fn(),
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

async function getSetupPage() {
  const { default: Page } = await import("@/app/setup/page");
  return Page;
}

describe("Setup page redirects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects users with a cat back to /dashboard", async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue({ id: "cat-1" } as any);

    const SetupPage = await getSetupPage();

    await expect(Promise.resolve().then(() => SetupPage())).rejects.toThrow(
      "REDIRECT:/dashboard",
    );
    expect(redirect).toHaveBeenCalledWith("/dashboard");
  });
});
