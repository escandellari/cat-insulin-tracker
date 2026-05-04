import { auth, signOut } from "@/auth";
import { buildSuppliesReadModel, RecordSupplyForm } from "@/features/supplies";
import { MobileShell, mobileSecondaryButtonClassName } from "@/features/setup";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto max-w-[390px] border-t border-sage-200 bg-white p-4 shadow-lg">
      <ul className="grid grid-cols-4 text-center text-sm">
        <li>
          <span className="text-sage-600">Home</span>
        </li>
        <li>
          <span className="text-sage-600">Calendar</span>
        </li>
        <li>
          <span aria-current="page" className="font-medium text-brand">
            Supplies
          </span>
        </li>
        <li>
          <span className="text-sage-600">Settings</span>
        </li>
      </ul>
    </nav>
  );
}

export default async function SuppliesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const cat = await prisma.cat.findFirst({
    where: { userId: session.user.id },
    include: {
      user: { select: { timezone: true } },
      injectionSchedules: {
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!cat) {
    redirect("/setup");
  }

  const supplies = await prisma.supplyRecord.findMany({
    where: { catId: cat.id },
    orderBy: { createdAt: "desc" },
  });

  const view = buildSuppliesReadModel({
    supplies: supplies as never[],
    defaultDosage: Number(cat.injectionSchedules[0]?.defaultDosage?.toString() ?? 0),
  });

  return (
    <MobileShell>
      <div className="space-y-6 pb-24">
        <div className="flex items-start justify-between gap-4 pt-2">
          <div>
            <h1 className="text-2xl font-medium text-sage-950">Supplies</h1>
            <p className="text-sm text-sage-600">Track insulin and needle inventory</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/auth/signin" });
            }}
          >
            <button type="submit" className={`text-sm ${mobileSecondaryButtonClassName}`} aria-label="sign-out">
              Sign out
            </button>
          </form>
        </div>

        {view.warningText ? (
          <div className="rounded-xl border border-[#F5E6B3] bg-[#FFF8E1] px-4 py-3 text-sm font-medium text-[#8B6914]">
            {view.warningText}
          </div>
        ) : null}

        <section className="grid grid-cols-2 gap-3">
          {[view.insulinCard, view.needlesCard].map((card) =>
            card ? (
              <div key={card.id} className="rounded-2xl border border-sage-200 bg-white p-4 shadow-sm">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-sage-600">{card.title}</p>
                <p className="mt-2 text-2xl font-medium text-sage-950">{card.remainingAmountLabel}</p>
                <p className="text-sm text-sage-600">{card.estimateLabel}</p>
              </div>
            ) : null,
          )}
        </section>

        {view.insulinCard ? (
          <section className="space-y-3 rounded-2xl border border-sage-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-sage-600">Current insulin vial</p>
            <p className="text-sm text-sage-600">Opened date: {view.insulinCard.startedAtLabel}</p>
            <p className="text-sm text-sage-600">Initial amount: {view.insulinCard.startingAmountLabel}</p>
            <p className="text-sm text-sage-600">Remaining: {view.insulinCard.remainingAmountLabel}</p>
            <p className="text-sm text-sage-600">Est. depletion: {view.insulinCard.estimateLabel}</p>
            <RecordSupplyForm catId={cat.id} type="insulin" buttonLabel="Record new vial" />
          </section>
        ) : null}

        {view.needlesCard ? (
          <section className="space-y-3 rounded-2xl border border-sage-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-sage-600">Needle inventory</p>
            <p className="text-sm text-sage-600">Last restock: {view.needlesCard.startedAtLabel}</p>
            <p className="text-sm text-sage-600">Pack size: {view.needlesCard.startingAmountLabel}</p>
            <p className="text-sm text-sage-600">Remaining: {view.needlesCard.remainingAmountLabel}</p>
            <p className="text-sm text-sage-600">Est. depletion: {view.needlesCard.estimateLabel}</p>
            <RecordSupplyForm catId={cat.id} type="needles" buttonLabel="Record new pack" />
          </section>
        ) : null}

        <section className="space-y-3 rounded-2xl border border-sage-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sage-600">Supply history</p>
          <ul className="space-y-3">
            {view.history.map((supply) => (
              <li key={supply.id} className="flex items-center justify-between gap-4 border-b border-sage-100 pb-3 text-sm last:border-b-0 last:pb-0">
                <span className="text-sage-950">
                  {supply.type === "insulin" ? "New vial" : "New pack"} · {supply.startingAmount.toString()} {supply.unit}
                </span>
                <span className="text-sage-600">{supply.startedAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}</span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-sage-600">Projected depletion is an estimate.</p>
        </section>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
