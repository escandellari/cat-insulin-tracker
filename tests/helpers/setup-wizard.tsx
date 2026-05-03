import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import type { SetupWizardDateDefaults } from "@/features/setup/setup-wizard-helpers";
import { stubBrowserDateDefaults } from "./fake-local-date";

export const push = vi.fn();

export const DEFAULT_WIZARD_PROPS = {
  defaultDateValues: {
    kind: "fixed",
    treatmentStartDate: "2026-01-10",
  },
} as const;

export async function renderSetupWizard(props: { defaultDateValues?: SetupWizardDateDefaults } = {}) {
  const { SetupWizard } = await import("@/features/setup/setup-wizard");

  render(<SetupWizard {...DEFAULT_WIZARD_PROPS} {...props} />);
}

export async function renderBrowserDefaultsDateStep() {
  stubBrowserDateDefaults();
  await renderSetupWizard({
    defaultDateValues: {
      kind: "browser",
    },
  });
  completeCatStep();
  completeStartDateStep();
}

export function clickNext() {
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

export function completeCatStep(catName = "Milo") {
  fireEvent.change(screen.getByLabelText("Cat name"), {
    target: { value: catName },
  });
  clickNext();
}

export function completeStartDateStep(treatmentStartDate = "2026-01-10") {
  fireEvent.change(screen.getByLabelText("Start date"), {
    target: { value: treatmentStartDate },
  });
  clickNext();
}

export function completeInjectionTimesStep({
  morningTime = "08:00",
  eveningTime = "20:00",
}: {
  morningTime?: string;
  eveningTime?: string;
} = {}) {
  fireEvent.change(screen.getByLabelText("Morning injection"), {
    target: { value: morningTime },
  });
  fireEvent.change(screen.getByLabelText("Evening injection"), {
    target: { value: eveningTime },
  });
  clickNext();
}

export function completeDosageStep({
  defaultDosage,
  dueWindowMinutes,
}: {
  defaultDosage?: string;
  dueWindowMinutes?: string;
} = {}) {
  if (defaultDosage !== undefined) {
    fireEvent.change(screen.getByLabelText("Default dosage"), {
      target: { value: defaultDosage },
    });
  }

  if (dueWindowMinutes !== undefined) {
    fireEvent.change(screen.getByLabelText("Due window"), {
      target: { value: dueWindowMinutes },
    });
  }

  clickNext();
}

export function goToReviewStep(options?: {
  treatmentStartDate?: string;
  morningTime?: string;
  eveningTime?: string;
  defaultDosage?: string;
  dueWindowMinutes?: string;
}) {
  completeCatStep();
  completeStartDateStep(options?.treatmentStartDate);
  completeInjectionTimesStep(options);
  completeDosageStep(options);
}
