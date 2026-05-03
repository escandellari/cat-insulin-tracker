import { signIn } from "@/auth";
import { MobileShell, mobilePrimaryButtonClassName } from "@/features/setup";

export default function SignInPage() {
  return (
    <MobileShell>
      <div className="space-y-6 text-center">
        <div className="space-y-3">
          <div className="text-4xl">🐱</div>
          <h1 className="text-2xl font-medium text-sage-950">Cat Insulin Tracker</h1>
          <p className="text-sm text-sage-600">Sign in to manage your cat&apos;s insulin schedule</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/dashboard" });
          }}
        >
          <button
            type="submit"
            className={`w-full ${mobilePrimaryButtonClassName} hover:bg-brand-dark`}
          >
            Sign in with Google
          </button>
        </form>
      </div>
    </MobileShell>
  );
}
