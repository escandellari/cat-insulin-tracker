// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SignInPage from "@/app/auth/signin/page";

describe("Sign-in page", () => {
  it("renders the shared mobile shell and green Google CTA", () => {
    render(<SignInPage />);

    const shell = screen.getByTestId("mobile-shell");
    expect(shell.className).toContain("max-w-[390px]");
    expect(shell).toHaveTextContent("Cat Insulin Tracker");

    const cta = screen.getByRole("button", { name: "Sign in with Google" });
    expect(cta.className).toContain("bg-brand");
  });
});
