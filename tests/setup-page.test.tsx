// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const push = vi.fn();

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
    const { SetupWizard } = await import("@/features/setup/setup-wizard");

    render(
      <SetupWizard
        initialTimezone="America/New_York"
        initialScheduleStartDate="2026-01-10"
      />,
    );

    fireEvent.change(screen.getByLabelText("Cat name"), {
      target: { value: "Milo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    fireEvent.change(screen.getByLabelText("Injection time 1"), {
      target: { value: "08:00" },
    });
    fireEvent.change(screen.getByLabelText("Default dosage"), {
      target: { value: "1.5" },
    });
    fireEvent.change(screen.getByLabelText("Default needles per injection"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Milo")).toBeInTheDocument();
    expect(screen.getByText("08:00")).toBeInTheDocument();
    expect(screen.getByText("1.5 units")) .toBeInTheDocument();
    expect(screen.getByText("2 needles")) .toBeInTheDocument();
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
    const { SetupWizard } = await import("@/features/setup/setup-wizard");

    render(
      <SetupWizard
        initialTimezone="America/New_York"
        initialScheduleStartDate="2026-01-10"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Cat name is required")).toBeInTheDocument();
    expect(screen.queryByLabelText("Injection time 1")).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Cat name"), {
      target: { value: "Milo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    fireEvent.change(screen.getByLabelText("Default dosage"), {
      target: { value: "-1" },
    });
    fireEvent.change(screen.getByLabelText("Default needles per injection"), {
      target: { value: "-1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("At least one injection time is required")).toBeInTheDocument();
    expect(screen.getByText("Dosage must be at least 0")).toBeInTheDocument();
    expect(screen.getByText("Needles must be at least 0")).toBeInTheDocument();
    expect(screen.queryByLabelText("Timezone")).not.toBeInTheDocument();
  });

  it("preserves values when moving back and shows multiple injection times on review", async () => {
    const { SetupWizard } = await import("@/features/setup/setup-wizard");

    render(
      <SetupWizard
        initialTimezone="America/New_York"
        initialScheduleStartDate="2026-01-10"
      />,
    );

    fireEvent.change(screen.getByLabelText("Cat name"), {
      target: { value: "Milo" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    fireEvent.change(screen.getByLabelText("Injection time 1"), {
      target: { value: "08:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add injection time" }));
    fireEvent.change(screen.getByLabelText("Injection time 2"), {
      target: { value: "20:00" },
    });
    fireEvent.change(screen.getByLabelText("Default dosage"), {
      target: { value: "1.5" },
    });
    fireEvent.change(screen.getByLabelText("Default needles per injection"), {
      target: { value: "2" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("08:00")).toBeInTheDocument();
    expect(screen.getByText("20:00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect((screen.getByLabelText("Injection time 1") as HTMLInputElement).value).toBe("08:00");
    expect((screen.getByLabelText("Injection time 2") as HTMLInputElement).value).toBe("20:00");
    expect((screen.getByLabelText("Default dosage") as HTMLInputElement).value).toBe("1.5");
    expect((screen.getByLabelText("Default needles per injection") as HTMLInputElement).value).toBe("2");
  });
});
