import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh, push: vi.fn() }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("RecordSupplyForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: "supply-1", type: "insulin" }),
    } as Response);
  });

  it("submits the correct payload for new vial and new pack actions", async () => {
    const { RecordSupplyForm } = await import("@/features/supplies/record-supply-form");
    const user = userEvent.setup();

    const { rerender } = render(
      <RecordSupplyForm catId="cat-1" type="insulin" buttonLabel="Record new vial" />,
    );

    await user.click(screen.getByText("Record new vial"));
    await user.type(screen.getByLabelText("Opened date"), "2026-01-12");
    await user.type(screen.getByLabelText("Initial amount"), "100");
    await user.click(screen.getByText("Save supply"));

    expect(mockFetch).toHaveBeenLastCalledWith(
      "/api/supplies",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          catId: "cat-1",
          type: "insulin",
          startedAt: "2026-01-12",
          startingAmount: 100,
        }),
      }),
    );

    rerender(<RecordSupplyForm catId="cat-1" type="needles" buttonLabel="Record new pack" />);

    await user.click(screen.getByText("Record new pack"));
    await user.type(screen.getByLabelText("Last restock"), "2026-01-13");
    await user.type(screen.getByLabelText("Pack size"), "10");
    await user.click(screen.getByText("Save supply"));

    expect(mockFetch).toHaveBeenLastCalledWith(
      "/api/supplies",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          catId: "cat-1",
          type: "needles",
          startedAt: "2026-01-13",
          startingAmount: 10,
        }),
      }),
    );
    expect(mockRefresh).toHaveBeenCalledTimes(2);
  });
});
