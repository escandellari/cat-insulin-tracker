import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockRefresh = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: mockRefresh }),
}));

vi.mock("date-fns-tz", () => ({
  formatInTimeZone: vi.fn(() => "2026-01-10T08:10"),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

function createUser() {
  return userEvent.setup();
}

describe("LogInjectionWrapper", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRefresh.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "log-1", eventId: "event-due" }),
    } as Response);
  });

  it("shows sheet when 'Log injection now' is clicked", async () => {
    const { LogInjectionWrapper } = await import("@/features/injections/log-injection-wrapper");
    const user = createUser();
    
    render(
      <LogInjectionWrapper
        eventId="event-due"
        scheduledAt={new Date("2026-01-10T13:00:00.000Z")}
        defaultDosage={1.5}
        timezone="America/New_York"
      />
    );

    // Sheet should not be visible initially
    expect(screen.queryByText("Log Injection")).not.toBeInTheDocument();

    // Click the button
    await user.click(screen.getByText("Log injection now"));

    // Sheet should now be visible with prefilled data
    expect(screen.getByText("Log Injection")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1.5")).toBeInTheDocument();
    expect(screen.getByRole("combobox")).toHaveValue("left-shoulder");
    expect(screen.getByDisplayValue("2026-01-10T08:10")).toBeInTheDocument();
  });

  it("submits form and closes sheet on success", async () => {
    const { LogInjectionWrapper } = await import("@/features/injections/log-injection-wrapper");
    const user = createUser();
    
    render(
      <LogInjectionWrapper
        eventId="event-due"
        scheduledAt={new Date("2026-01-10T13:00:00.000Z")}
        defaultDosage={1.5}
        timezone="America/New_York"
      />
    );

    // Open sheet
    await user.click(screen.getByText("Log injection now"));
    
    // Submit form
    await user.click(screen.getByText("Log injection"));

    // Should have called the API
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/injections/log",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"site":"left-shoulder"'),
      })
    );
    expect(mockRefresh).toHaveBeenCalled();
    expect(screen.queryByText("Log Injection")).not.toBeInTheDocument();
  });

  it("shows a clear duplicate error and keeps sheet open", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: () => Promise.resolve({ error: "Injection already logged for this event" }),
    } as Response);

    const { LogInjectionWrapper } = await import("@/features/injections/log-injection-wrapper");
    const user = createUser();

    render(
      <LogInjectionWrapper
        eventId="event-due"
        scheduledAt={new Date("2026-01-10T13:00:00.000Z")}
        defaultDosage={1.5}
        timezone="America/New_York"
      />
    );

    await user.click(screen.getByText("Log injection now"));
    await user.click(screen.getByText("Log injection"));

    expect(await screen.findByText("Injection already logged for this event")).toBeInTheDocument();
    expect(screen.getByText("Log Injection")).toBeInTheDocument();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
