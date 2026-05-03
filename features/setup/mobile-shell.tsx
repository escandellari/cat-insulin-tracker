import type { ReactNode } from "react";

export const mobilePrimaryButtonClassName = "rounded-full bg-brand px-6 py-3.5 font-medium text-white";
export const mobileSecondaryButtonClassName =
  "rounded-full border border-sage-200 bg-white px-6 py-3.5 font-medium text-sage-950";

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#eef8f2] to-white px-4 py-8">
      <div
        data-testid="mobile-shell"
        className="mx-auto max-w-[390px] rounded-[28px] border border-sage-200 bg-white p-6 shadow-sm"
      >
        {children}
      </div>
    </div>
  );
}
