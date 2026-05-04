import { describe, expect, it } from "vitest";
import { getSupplyProjection } from "@/features/supplies/projections";

describe("getSupplyProjection", () => {
  it("uses default dosage twice daily for insulin", () => {
    expect(
      getSupplyProjection({
        type: "insulin",
        remainingAmount: 9,
        defaultDosage: 1.5,
      }),
    ).toEqual({
      dailyUsage: 3,
      daysRemaining: 3,
      warning: "low",
    });
  });

  it("uses 2 needles per day and maps warning thresholds exactly", () => {
    expect(
      getSupplyProjection({
        type: "needles",
        remainingAmount: 12,
        defaultDosage: 1.5,
      }),
    ).toEqual({
      dailyUsage: 2,
      daysRemaining: 6,
      warning: null,
    });

    expect(
      getSupplyProjection({
        type: "needles",
        remainingAmount: 10,
        defaultDosage: 1.5,
      }).warning,
    ).toBe("low");

    expect(
      getSupplyProjection({
        type: "needles",
        remainingAmount: 2,
        defaultDosage: 1.5,
      }).warning,
    ).toBe("critical");
  });
});
