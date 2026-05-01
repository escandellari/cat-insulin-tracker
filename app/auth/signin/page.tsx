import { signIn } from "@/auth";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <h1 className="text-3xl font-bold">Cat Insulin Tracker</h1>
        <p className="text-muted-foreground">Sign in to manage your cat&apos;s insulin schedule</p>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </main>
  );
}
