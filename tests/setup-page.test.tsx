// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import {
  clickNext,
  completeCatStep,
  completeInjectionTimesStep,
  completeStartDateStep,
  goToReviewStep,
  push,
  renderSetupWizard,
} from "./helpers/setup-wizard";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

describe("Setup wizard", () => {
  beforeEach(() => {
    push.mockReset();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(null, {
          status: 303,
          headers: { location: "/dashboard" },
        }),
      ),
    );
  });

  it("collects the full 5-step payload, reviews it, and submits once", async () => {
    await renderSetupWizard();
    goToReviewStep({
      treatmentStartDate: "2026-01-12",
      morningTime: "07:30",
      eveningTime: "19:30",
      defaultDosage: "1.5",
      dueWindowMinutes: "45",
    });

    expect(screen.getByText("Milo")).toBeInTheDocument();
    expect(screen.getByText("2026-01-12")).toBeInTheDocument();
    expect(screen.getByText("07:30")).toBeInTheDocument();
    expect(screen.getByText("19:30")).toBeInTheDocument();
    expect(screen.getByText("1.5 units")).toBeInTheDocument();
    expect(screen.getByText("45 minutes")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Complete setup" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith("/dashboard");
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/setup",
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: expect.any(String),
      }),
    );

    expect(JSON.parse(vi.mocked(fetch).mock.calls[0]![1]!.body as string)).toEqual({
      catName: "Milo",
      treatmentStartDate: "2026-01-12",
      browserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      morningTime: "07:30",
      eveningTime: "19:30",
      defaultDosage: 1.5,
      dueWindowMinutes: 45,
    });
  });

  it("renders a fixed 5-step flow in the shared mobile shell with morning and evening inputs only", async () => {
    await renderSetupWizard();

    const shell = screen.getByTestId("mobile-shell");
    expect(shell.className).toContain("max-w-[390px]");
    expect(shell.className).toContain("rounded-[28px]");

    completeCatStep();
    completeStartDateStep();

    expect(screen.getByLabelText("Morning injection")).toBeInTheDocument();
    expect(screen.getByLabelText("Evening injection")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add injection time" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Injection time 1")).not.toBeInTheDocument();
  });

  it("blocks incomplete steps and shows inline validation for required fields", async () => {
    await renderSetupWizard();

    clickNext();
    expect(screen.getByText("Cat name is required")).toBeInTheDocument();

    completeCatStep();
    fireEvent.change(screen.getByLabelText("Start date"), { target: { value: "" } });
    clickNext();
    expect(screen.getByText("Start date is required")).toBeInTheDocument();

    completeStartDateStep();
    fireEvent.change(screen.getByLabelText("Morning injection"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Evening injection"), { target: { value: "" } });
    clickNext();
    expect(screen.getByText("Morning time is required")).toBeInTheDocument();
    expect(screen.getByText("Evening time is required")).toBeInTheDocument();

    completeInjectionTimesStep();
    fireEvent.change(screen.getByLabelText("Default dosage"), { target: { value: "0" } });
    fireEvent.change(screen.getByLabelText("Due window"), { target: { value: "0" } });
    clickNext();
    expect(screen.getByText("Dosage is required")).toBeInTheDocument();
    expect(screen.getByText("Due window is required")).toBeInTheDocument();
    expect(screen.queryByText("Review your settings")).not.toBeInTheDocument();
  });

  it("preserves values across Back navigation and shows all review values", async () => {
    await renderSetupWizard();
    goToReviewStep({
      treatmentStartDate: "2026-01-12",
      morningTime: "07:30",
      eveningTime: "19:30",
      defaultDosage: "1.5",
      dueWindowMinutes: "45",
    });

    expect(screen.getByText("Milo")).toBeInTheDocument();
    expect(screen.getByText("2026-01-12")).toBeInTheDocument();
    expect(screen.getByText("07:30")).toBeInTheDocument();
    expect(screen.getByText("19:30")).toBeInTheDocument();
    expect(screen.getByText("1.5 units")).toBeInTheDocument();
    expect(screen.getByText("45 minutes")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect((screen.getByLabelText("Morning injection") as HTMLInputElement).value).toBe("07:30");
    expect((screen.getByLabelText("Evening injection") as HTMLInputElement).value).toBe("19:30");

    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect((screen.getByLabelText("Start date") as HTMLInputElement).value).toBe("2026-01-12");
  });
});
