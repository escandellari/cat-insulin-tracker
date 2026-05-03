import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockRefresh = vi.fn();

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: mockRefresh }),
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

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
    
    render(
      <LogInjectionWrapper
        eventId="event-due"
        scheduledAt={new Date("2026-01-10T13:00:00.000Z")}
        defaultDosage={1.5}
      />
    );

    // Sheet should not be visible initially
    expect(screen.queryByText("Log Injection")).not.toBeInTheDocument();

    // Click the button
    await userEvent.click(screen.getByText("Log injection now"));

    // Sheet should now be visible with prefilled data
    expect(screen.getByText("Log Injection")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1.5")).toBeInTheDocument();
  });

  it("submits form and closes sheet on success", async () => {
    const { LogInjectionWrapper } = await import("@/features/injections/log-injection-wrapper");
    
    render(
      <LogInjectionWrapper
        eventId="event-due"
        scheduledAt={new Date("2026-01-10T13:00:00.000Z")}
        defaultDosage={1.5}
      />
    );

    // Open sheet
    await userEvent.click(screen.getByText("Log injection now"));
    
    // Submit form
    await userEvent.click(screen.getByText("Log injection"));

    // Should have called the API
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/injections/log",
      expect.objectContaining({ method: "POST" })
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

    render(
      <LogInjectionWrapper
        eventId="event-due"
        scheduledAt={new Date("2026-01-10T13:00:00.000Z")}
        defaultDosage={1.5}
      />
    );

    await userEvent.click(screen.getByText("Log injection now"));
    await userEvent.click(screen.getByText("Log injection"));

    expect(await screen.findByText("Injection already logged for this event")).toBeInTheDocument();
    expect(screen.getByText("Log Injection")).toBeInTheDocument();
    expect(mockRefresh).not.toHaveBeenCalled();
  });
});
