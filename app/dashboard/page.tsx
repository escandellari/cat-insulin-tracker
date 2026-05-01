import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/auth/signin");
  }

  const cat = await prisma.cat.findFirst({
    where: { userId: session.user?.id as string },
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

        {!cat && (
          <div className="rounded-lg border p-6 text-center space-y-4">
            <p className="text-lg font-medium">
              Welcome! Set up your cat&apos;s profile
            </p>
            <a
              href="/setup"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Set up your cat&apos;s profile
            </a>
          </div>
        )}
      </div>
    </main>
  );
}
