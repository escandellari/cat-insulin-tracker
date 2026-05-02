import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();

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
  });

  if (!cat) {
    redirect("/setup");
  }

  const upcomingEvents = await prisma.injectionEvent.findMany({
    where: {
      catId: cat.id,
      status: "UPCOMING",
    },
    orderBy: { scheduledAt: "asc" },
    take: 5,
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              {session.user?.name ?? session.user?.email}
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/auth/signin" });
            }}
          >
            <button
              type="submit"
              className="text-sm text-muted-foreground hover:text-foreground"
              aria-label="sign-out"
            >
              Sign out
            </button>
          </form>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-medium">Upcoming injections</h2>
          <ul className="space-y-2">
            {upcomingEvents.map((event) => (
              <li key={event.id}>{event.scheduledAt.toISOString()}</li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
