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

  return <SetupWizard defaultDateValues={{ kind: "browser" }} />;
}
