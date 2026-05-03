import type { ReactNode } from "react";

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
