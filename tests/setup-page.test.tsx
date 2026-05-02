// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { stubBrowserDateDefaults, stubLocalDate } from "./helpers/fake-local-date";
import {
  completeCatStep,
  completeScheduleStep,
  goToReviewStep,
  push,
  renderBrowserDefaultsDateStep,
  renderSetupWizard,
  clickNext,
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

  it("collects the full payload, reviews it, and submits once", async () => {
    await renderSetupWizard();
    goToReviewStep({
      defaultDosage: "1.5",
      defaultNeedlesPerInjection: "2",
    });

    expect(screen.getByText("Milo")).toBeInTheDocument();
    expect(screen.getByText("08:00")).toBeInTheDocument();
    expect(screen.getByText("1.5 units")).toBeInTheDocument();
    expect(screen.getByText("2 needles")).toBeInTheDocument();
    expect(screen.getByText("America/New_York")).toBeInTheDocument();
    expect(screen.getByText("2026-01-10")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Confirm setup" }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith("/dashboard");
    });

    expect(fetch).toHaveBeenCalledWith(
      "/api/setup",
      expect.objectContaining({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          catName: "Milo",
          injectionTimes: ["08:00"],
          defaultDosage: 1.5,
          defaultNeedlesPerInjection: 2,
          timezone: "America/New_York",
          scheduleStartDate: "2026-01-10",
        }),
      }),
    );
  });

  it("shows inline validation errors and blocks progress", async () => {
    await renderSetupWizard();

    clickNext();
    expect(screen.getByText("Cat name is required")).toBeInTheDocument();
    expect(screen.queryByLabelText("Injection time 1")).not.toBeInTheDocument();

    completeCatStep();

    fireEvent.change(screen.getByLabelText("Default dosage"), {
      target: { value: "-1" },
    });
    fireEvent.change(screen.getByLabelText("Default needles per injection"), {
      target: { value: "-1" },
    });
    clickNext();

    expect(screen.getByText("At least one injection time is required")).toBeInTheDocument();
    expect(screen.getByText("Dosage must be at least 0")).toBeInTheDocument();
    expect(screen.getByText("Needles must be at least 0")).toBeInTheDocument();
    expect(screen.queryByLabelText("Timezone")).not.toBeInTheDocument();
  });

  it("preserves values when moving back and shows multiple injection times on review", async () => {
    await renderSetupWizard();
    goToReviewStep({
      injectionTimes: ["08:00", "20:00"],
      defaultDosage: "1.5",
      defaultNeedlesPerInjection: "2",
    });

    expect(screen.getByText("08:00")).toBeInTheDocument();
    expect(screen.getByText("20:00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect((screen.getByLabelText("Injection time 1") as HTMLInputElement).value).toBe("08:00");
    expect((screen.getByLabelText("Injection time 2") as HTMLInputElement).value).toBe("20:00");
    expect((screen.getByLabelText("Default dosage") as HTMLInputElement).value).toBe("1.5");
    expect((screen.getByLabelText("Default needles per injection") as HTMLInputElement).value).toBe("2");
  });

  it("shows a graceful error on repeat-submit failure and does not navigate", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "Setup already completed" }), {
          status: 409,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await renderSetupWizard();
    goToReviewStep();
    fireEvent.click(screen.getByRole("button", { name: "Confirm setup" }));

    expect(await screen.findByText("Setup already completed")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows DST-gap validation on submit and does not navigate", async () => {
    await renderSetupWizard();
    goToReviewStep({ injectionTimes: ["02:00"] });
    fireEvent.click(screen.getByRole("button", { name: "Confirm setup" }));

    expect(
      await screen.findByText(
        "Injection times must not include nonexistent local DST-gap times in the next 90 days",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirm setup" })).not.toBeInTheDocument();
    expect(fetch).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  it("blocks progress on invalid timezone input", async () => {
    await renderSetupWizard();
    completeCatStep();
    completeScheduleStep();
    fireEvent.change(screen.getByLabelText("Timezone"), {
      target: { value: "Mars/Base" },
    });

    clickNext();

    expect(screen.getByText("Timezone must be a valid IANA timezone")).toBeInTheDocument();
    expect(screen.queryByText("Confirm setup")).not.toBeInTheDocument();
  });

  it("blocks progress on impossible schedule start date", async () => {
    await renderSetupWizard({
      defaultDateValues: {
        kind: "fixed",
        timezone: "America/New_York",
        scheduleStartDate: "2026-02-29",
      },
    });
    completeCatStep();
    completeScheduleStep();

    clickNext();

    expect(screen.getByText("Start date must be a real calendar date")).toBeInTheDocument();
    expect(screen.queryByText("Confirm setup")).not.toBeInTheDocument();
  });

  it("redirects to signin when setup submit resolves to auth page", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        redirected: true,
        url: "http://localhost/auth/signin",
      }),
    );

    await renderSetupWizard();
    goToReviewStep();
    fireEvent.click(screen.getByRole("button", { name: "Confirm setup" }));

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/auth/signin");
    });
    expect(push).not.toHaveBeenCalledWith("/dashboard");
  });

  it("overrides the initial schedule start date with the browser-local day", async () => {
    await renderBrowserDefaultsDateStep();

    await waitFor(() => {
      expect((screen.getByLabelText("Timezone") as HTMLInputElement).value).toBe(
        "America/Los_Angeles",
      );
      expect((screen.getByLabelText("Schedule start date") as HTMLInputElement).value).toBe(
        "2026-01-10",
      );
    });
  });

  it("hydrates browser-default date fields only once across parent rerenders", async () => {
    stubBrowserDateDefaults();
    const { SetupWizard } = await import("@/features/setup/setup-wizard");

    function Wrapper() {
      const [renderCount, setRenderCount] = useState(0);

      return (
        <>
          <button type="button" onClick={() => setRenderCount((count) => count + 1)}>
            Rerender {renderCount}
          </button>
          <SetupWizard defaultDateValues={{ kind: "browser" }} />
        </>
      );
    }

    render(<Wrapper />);
    completeCatStep();
    completeScheduleStep();

    await waitFor(() => {
      expect((screen.getByLabelText("Timezone") as HTMLInputElement).value).toBe(
        "America/Los_Angeles",
      );
      expect((screen.getByLabelText("Schedule start date") as HTMLInputElement).value).toBe(
        "2026-01-10",
      );
    });

    stubLocalDate("2026-01-12T07:30:00.000Z", { year: 2026, month: 0, day: 11 });
    vi.stubGlobal("Intl", {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: "America/Chicago" }),
      }),
    } as typeof Intl);

    fireEvent.click(screen.getByRole("button", { name: "Rerender 0" }));

    await waitFor(() => {
      expect((screen.getByLabelText("Timezone") as HTMLInputElement).value).toBe(
        "America/Los_Angeles",
      );
      expect((screen.getByLabelText("Schedule start date") as HTMLInputElement).value).toBe(
        "2026-01-10",
      );
    });
  });

  it("keeps provided timezone and start date defaults unchanged", async () => {
    stubBrowserDateDefaults();
    await renderSetupWizard();
    completeCatStep();
    completeScheduleStep();

    expect((screen.getByLabelText("Timezone") as HTMLInputElement).value).toBe("America/New_York");
    expect((screen.getByLabelText("Schedule start date") as HTMLInputElement).value).toBe(
      "2026-01-10",
    );
  });

  it("does not overwrite touched browser-default date fields after mount", async () => {
    await renderBrowserDefaultsDateStep();

    await waitFor(() => {
      expect((screen.getByLabelText("Timezone") as HTMLInputElement).value).toBe(
        "America/Los_Angeles",
      );
    });

    fireEvent.change(screen.getByLabelText("Timezone"), {
      target: { value: "America/Chicago" },
    });

    await waitFor(() => {
      expect((screen.getByLabelText("Timezone") as HTMLInputElement).value).toBe("America/Chicago");
    });
  });
});
