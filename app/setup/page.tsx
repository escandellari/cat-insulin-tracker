import { auth } from "@/auth";
import { SetupWizard } from "@/features/setup";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function SetupPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const cat = await prisma.cat.findFirst({
    where: { userId: session.user.id },
  });

  if (cat) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        <SetupWizard initialTimezone="UTC" initialScheduleStartDate={getToday()} />
      </div>
    </main>
  );
}
