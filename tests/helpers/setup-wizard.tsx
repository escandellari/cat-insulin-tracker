import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import type { SetupWizardDateDefaults } from "@/features/setup/setup-wizard-helpers";
import { stubBrowserDateDefaults } from "./fake-local-date";

export const push = vi.fn();

export const DEFAULT_WIZARD_PROPS = {
  defaultDateValues: {
    kind: "fixed",
    timezone: "America/New_York",
    scheduleStartDate: "2026-01-10",
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
  completeScheduleStep();
}

export function clickNext() {
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
}

export function completeCatStep(catName = "Milo") {
  fireEvent.change(screen.getByLabelText("Cat name"), {
    target: { value: catName },
  });
  clickNext();
}

export function completeScheduleStep({
  injectionTimes = ["08:00"],
  defaultDosage,
  defaultNeedlesPerInjection,
}: {
  injectionTimes?: string[];
  defaultDosage?: string;
  defaultNeedlesPerInjection?: string;
} = {}) {
  fireEvent.change(screen.getByLabelText("Injection time 1"), {
    target: { value: injectionTimes[0] ?? "08:00" },
  });

  injectionTimes.slice(1).forEach((time, index) => {
    fireEvent.click(screen.getByRole("button", { name: "Add injection time" }));
    fireEvent.change(screen.getByLabelText(`Injection time ${index + 2}`), {
      target: { value: time },
    });
  });

  if (defaultDosage !== undefined) {
    fireEvent.change(screen.getByLabelText("Default dosage"), {
      target: { value: defaultDosage },
    });
  }

  if (defaultNeedlesPerInjection !== undefined) {
    fireEvent.change(screen.getByLabelText("Default needles per injection"), {
      target: { value: defaultNeedlesPerInjection },
    });
  }

  clickNext();
}

export function goToReviewStep(options?: Parameters<typeof completeScheduleStep>[0]) {
  completeCatStep();
  completeScheduleStep(options);
  clickNext();
}
