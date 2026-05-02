import { auth } from "@/auth";
import { SetupWizard } from "@/features/setup";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

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
        <SetupWizard defaultDateValues={{ kind: "browser" }} />
      </div>
    </main>
  );
}
