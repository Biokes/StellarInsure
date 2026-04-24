import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import PolicyDetailPage from "./page";

describe("PolicyDetailPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the policy summary after loading completes", () => {
    render(<PolicyDetailPage params={{ policyId: "weather-alpha" }} />);

    expect(screen.getByText(/loading policy data/i)).toBeInTheDocument();

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole("heading", { name: /northern plains weather guard/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /export summary/i })).toBeInTheDocument();
  });

  it("renders an empty claim state for policies without claims", () => {
    render(<PolicyDetailPage params={{ policyId: "flight-orbit" }} />);

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByText(/no claims filed yet/i)).toBeInTheDocument();
  });

  it("shows validation errors when the assistance form is submitted empty", async () => {
    render(<PolicyDetailPage params={{ policyId: "weather-alpha" }} />);

    act(() => {
      vi.runAllTimers();
    });

    fireEvent.click(screen.getByRole("button", { name: /save handoff draft/i }));

    expect(screen.getByText(/enter the contact name/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a valid email address/i)).toBeInTheDocument();
    expect(screen.getByText(/enter a phone number/i)).toBeInTheDocument();
  });

  it("formats the review amount and rejects values above coverage", () => {
    render(<PolicyDetailPage params={{ policyId: "weather-alpha" }} />);

    act(() => {
      vi.runAllTimers();
    });

    const amountInput = screen.getByLabelText(/review amount/i);
    fireEvent.change(amountInput, { target: { value: "12500" } });

    expect(amountInput).toHaveValue("12,500");

    fireEvent.click(screen.getByRole("button", { name: /save handoff draft/i }));

    expect(screen.getByText(/requested review amount cannot exceed the policy coverage/i)).toBeInTheDocument();
  });

  it("adds a pending claim card after a valid support handoff submission", () => {
    render(<PolicyDetailPage params={{ policyId: "flight-orbit" }} />);

    act(() => {
      vi.runAllTimers();
    });

    fireEvent.change(screen.getByLabelText(/contact name/i), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.change(screen.getByLabelText(/update email/i), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/mobile number/i), {
      target: { value: "+2348000000000" },
    });
    fireEvent.change(screen.getByLabelText(/review amount/i), {
      target: { value: "200" },
    });
    fireEvent.change(screen.getByLabelText(/incident summary/i), {
      target: {
        value:
          "Delayed departure exceeded trigger threshold and oracle event snapshot was attached.",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: /save handoff draft/i }));

    act(() => {
      vi.runAllTimers();
    });

    expect(
      screen.getByText(/support handoff draft saved for this device/i),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/pending/i).length).toBeGreaterThan(0);
  });

  it("renders the error state when policy data cannot be loaded", () => {
    render(<PolicyDetailPage params={{ policyId: "sync-check" }} />);

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole("heading", { name: /policy data is temporarily unavailable/i })).toBeInTheDocument();
  });

  it("renders the empty state when the requested policy does not exist", () => {
    render(<PolicyDetailPage params={{ policyId: "missing-policy" }} />);

    act(() => {
      vi.runAllTimers();
    });

    expect(screen.getByRole("heading", { name: /policy not found/i })).toBeInTheDocument();
  });
});
