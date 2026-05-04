import { getSupplyProjection } from "./projections";

type SupplyRecordSource = {
  id: string;
  type: "insulin" | "needles";
  startedAt: Date;
  startingAmount: { toString(): string } | number | string;
  remainingAmount: { toString(): string } | number | string;
  unit: string;
  isActive: boolean;
  createdAt: Date;
};

function toNumber(value: { toString(): string } | number | string) {
  return typeof value === "number" ? value : Number(value.toString());
}

export function buildSuppliesReadModel({
  supplies,
  defaultDosage,
}: {
  supplies: SupplyRecordSource[];
  defaultDosage: number;
}) {
  const active = supplies.filter((supply) => supply.isActive);
  const activeInsulin = active.find((supply) => supply.type === "insulin") ?? null;
  const activeNeedles = active.find((supply) => supply.type === "needles") ?? null;

  const toCard = (supply: SupplyRecordSource | null, title: string) => {
    if (!supply) return null;

    const projection = getSupplyProjection({
      type: supply.type,
      remainingAmount: toNumber(supply.remainingAmount),
      defaultDosage,
    });

    return {
      id: supply.id,
      title,
      type: supply.type,
      startedAtLabel: supply.startedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
      startingAmountLabel: `${toNumber(supply.startingAmount)} ${supply.unit}`,
      remainingAmountLabel: `${toNumber(supply.remainingAmount)} ${supply.unit}`,
      estimateLabel: `${projection.daysRemaining} days remaining estimate`,
      warning: projection.warning,
    };
  };

  const insulinCard = toCard(activeInsulin, "Current insulin vial");
  const needlesCard = toCard(activeNeedles, "Needle inventory");
  const warningCard = [insulinCard, needlesCard].find((card) => card?.warning);

  return {
    insulinCard,
    needlesCard,
    history: [...supplies].sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime()),
    warningText: warningCard
      ? `${warningCard.type === "insulin" ? "Insulin" : "Needles"} running low — Consider ordering...`
      : null,
  };
}
