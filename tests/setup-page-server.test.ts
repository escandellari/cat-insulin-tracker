import { beforeEach, describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { AUTHED_SESSION, toHtml } from "./helpers/auth";

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

vi.mock("@/features/setup", () => ({
  SetupWizard: ({
    defaultDateValues,
  }: {
    defaultDateValues: { kind: string; timezone?: string; scheduleStartDate?: string };
  }) =>
    createElement("div", {
      "data-default-kind": defaultDateValues.kind,
      "data-timezone": defaultDateValues.timezone,
      "data-start-date": defaultDateValues.scheduleStartDate,
    }),
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
    vi.unstubAllGlobals();
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

  it("passes only the browser-default sentinel to the setup wizard", async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue(null);

    const SetupPage = await getSetupPage();
    const html = toHtml(await SetupPage());

    expect(html).toContain('data-default-kind="browser"');
    expect(html).not.toContain("data-timezone=");
    expect(html).not.toContain("data-start-date=");
  });
});
