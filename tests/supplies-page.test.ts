import { beforeEach, describe, expect, it, vi } from "vitest";
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
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    cat: {
      findFirst: vi.fn(),
    },
    supplyRecord: {
      findMany: vi.fn(),
    },
  },
}));

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function getSuppliesPage() {
  const { default: Page } = await import("@/app/supplies/page");
  return Page;
}

describe("Supplies page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders current inventory cards, estimate text, history, and low warning state", async () => {
    vi.mocked(auth).mockResolvedValue(AUTHED_SESSION as any);
    vi.mocked(prisma.cat.findFirst).mockResolvedValue({
      id: "cat-1",
      userId: AUTHED_SESSION.user.id,
      name: "Milo",
      user: { timezone: "America/New_York" },
      injectionSchedules: [{ defaultDosage: { toString: () => "1.5" } }],
    } as any);
    vi.mocked(prisma.supplyRecord.findMany).mockResolvedValue([
      {
        id: "supply-insulin-active",
        type: "insulin",
        startedAt: new Date("2026-01-12T00:00:00.000Z"),
        startingAmount: { toString: () => "12" },
        remainingAmount: { toString: () => "12" },
        unit: "units",
        isActive: true,
        createdAt: new Date("2026-01-12T00:00:00.000Z"),
      },
      {
        id: "supply-needles-active",
        type: "needles",
        startedAt: new Date("2026-01-10T00:00:00.000Z"),
        startingAmount: { toString: () => "10" },
        remainingAmount: { toString: () => "10" },
        unit: "needles",
        isActive: true,
        createdAt: new Date("2026-01-10T00:00:00.000Z"),
      },
      {
        id: "supply-insulin-history",
        type: "insulin",
        startedAt: new Date("2026-01-01T00:00:00.000Z"),
        startingAmount: { toString: () => "100" },
        remainingAmount: { toString: () => "20" },
        unit: "units",
        isActive: false,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    ] as any);

    const SuppliesPage = await getSuppliesPage();
    const html = toHtml((await SuppliesPage()) as React.ReactElement);

    expect(html).toContain("Supplies");
    expect(html).toContain("Track insulin and needle inventory");
    expect(html).toContain("Insulin running low — Consider ordering...");
    expect(html).toContain("Current insulin vial");
    expect(html).toContain("Needle inventory");
    expect(html).toContain("Supply history");
    expect(html).toContain("Est. depletion");
    expect(html).toContain("estimate");
    expect(html).toContain("Record new vial");
    expect(html).toContain("Record new pack");
  });
});
