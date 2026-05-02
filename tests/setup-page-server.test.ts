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
    initialTimezone,
    initialScheduleStartDate,
  }: {
    initialTimezone: string;
    initialScheduleStartDate: string;
  }) =>
    createElement("div", {
      "data-timezone": initialTimezone,
      "data-start-date": initialScheduleStartDate,
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

  it("seeds the setup wizard start date from local date parts", async () => {
    const RealDate = Date;

    class FakeDate extends RealDate {
      constructor(value?: string | number | Date) {
        super(value ?? "2026-01-11T07:30:00.000Z");
      }

      getFullYear() {
        return 2026;
      }

      getMonth() {
        return 0;
      }

      getDate() {
        return 10;
      }

      toISOString() {
        return "2026-01-11T07:30:00.000Z";
      }

      static now() {
        return new RealDate("2026-01-11T07:30:00.000Z").valueOf();
      }
    }

    vi.stubGlobal("Date", FakeDate as unknown as DateConstructor);
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue(null);

    const SetupPage = await getSetupPage();
    const html = toHtml(await SetupPage());

    expect(html).toContain('data-start-date="2026-01-10"');
  });
});
