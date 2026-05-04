import type { RecordSupplyInput } from "./schema";

export type SupplyWarning = "low" | "critical" | null;

export function getSupplyProjection({
  type,
  remainingAmount,
  defaultDosage,
}: {
  type: RecordSupplyInput["type"];
  remainingAmount: number;
  defaultDosage: number;
}) {
  const dailyUsage = type === "insulin" ? defaultDosage * 2 : 2;
  const daysRemaining = dailyUsage > 0 ? remainingAmount / dailyUsage : Infinity;

  let warning: SupplyWarning = null;
  if (daysRemaining <= 1) {
    warning = "critical";
  } else if (daysRemaining <= 5) {
    warning = "low";
  }

  return {
    dailyUsage,
    daysRemaining,
    warning,
  };
}
