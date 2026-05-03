import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { buildDashboardReadModel, getLocalDayStartUtc } from "@/features/scheduling";
import {
  MobileShell,
  mobilePrimaryButtonClassName,
  mobileSecondaryButtonClassName,
} from "@/features/setup";
import { LogInjectionWrapper } from "@/features/injections";

const statusBadgeClassNames = {
  upcoming: "bg-[#FFF8E1] text-[#8B6914]",
  due: "bg-[#FFF8E1] text-[#8B6914]",
  late: "bg-[#FFF8E1] text-[#8B6914]",
  missed: "bg-[#FEE] text-[#8E1C12]",
  logged: "bg-sage-100 text-brand-dark",
} as const;

const statusLabels = {
  upcoming: "Pending",
  due: "Due",
  late: "Late",
  missed: "Missed",
  logged: "Logged",
} as const;

function StatusBadge({ status }: { status: keyof typeof statusBadgeClassNames }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClassNames[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 mx-auto max-w-[390px] border-t border-sage-200 bg-white p-4 shadow-lg">
      <ul className="grid grid-cols-4 text-center text-sm">
        <li>
          <span aria-current="page" className="font-medium text-brand">
            Home
          </span>
        </li>
        <li>
          <span className="text-sage-600">Calendar</span>
        </li>
        <li>
          <span className="text-sage-600">Supplies</span>
        </li>
        <li>
          <span className="text-sage-600">Settings</span>
        </li>
      </ul>
    </nav>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const now = new Date();

  if (!session) {
    redirect("/auth/signin");
  }

  const userId = session.user?.id;
  if (!userId) {
    // Session exists but user.id is missing — should not happen with database strategy,
    // but guard against silent undefined being passed to Prisma.
    redirect("/auth/signin");
  }

  const cat = await prisma.cat.findFirst({
    where: { userId },
    include: {
      user: {
        select: {
          timezone: true,
        },
      },
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

  const events = await prisma.injectionEvent.findMany({
    where: {
      catId: cat.id,
      scheduledAt: {
        gte: getLocalDayStartUtc(now, cat.user.timezone),
      },
    },
    include: {
      schedule: {
        select: {
          trackingWindowMinutes: true,
          missedThresholdHours: true,
          defaultDosage: true,
        },
      },
    },
    orderBy: { scheduledAt: "asc" },
    take: 8,
  });

  const view = buildDashboardReadModel({
    catName: cat.name,
    timezone: cat.user.timezone,
    now,
    events,
  });

  return (
    <MobileShell>
      <div className="space-y-6 pb-24">
        <div className="space-y-3 pt-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-medium text-sage-950">{view.catName}</h1>
              <p className="text-sm text-sage-600">{view.currentDateLabel}</p>
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
        </div>

        {view.nextEvent ? (
          <section className="space-y-3 rounded-2xl border border-sage-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-sage-600">Next injection</p>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-2xl font-medium text-sage-950">{view.nextEvent.timeLabel}</p>
                <p className="text-sm text-sage-600">{view.nextEvent.dosageLabel}</p>
              </div>
              <div className="space-y-2 text-right">
                <StatusBadge status={view.nextEvent.status} />
                <p className="text-sm text-sage-600">{view.nextEvent.dueWindowLabel}</p>
              </div>
            </div>
            {view.nextEvent.status === "due" || view.nextEvent.status === "late" ? (
              <LogInjectionWrapper
                eventId={view.nextEvent.id}
                scheduledAt={view.nextEvent.scheduledAt}
                defaultDosage={parseFloat(view.nextEvent.dosageLabel)}
              />
            ) : (
              <button
                type="button"
                disabled
                className={`w-full cursor-not-allowed opacity-50 ${mobilePrimaryButtonClassName}`}
              >
                Log injection now
              </button>
            )}
          </section>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-sage-950">Today&apos;s injections</h2>
          <div className="space-y-3">
            {view.todaysEvents.map((event) => (
              <div key={event.id} className="rounded-2xl border border-sage-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-medium text-sage-950">{event.timeLabel}</p>
                    <p className="text-sm text-sage-600">{event.dosageLabel}</p>
                  </div>
                  <StatusBadge status={event.status} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-3 rounded-2xl border border-sage-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-sage-600">Upcoming</p>
          <ul className="space-y-3">
            {view.upcomingEvents.map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-sage-950">{event.fullDateTimeLabel}</span>
                <StatusBadge status={event.status} />
              </li>
            ))}
          </ul>
          <p className="text-center text-sm font-medium text-brand">Calendar</p>
        </section>
      </div>
      <BottomNav />
    </MobileShell>
  );
}
