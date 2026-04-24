import React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import HistoryPageClient from "./history-page-client";

describe("HistoryPageClient", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("filters transactions by type and status", async () => {
    render(<HistoryPageClient />);

    act(() => {
      vi.advanceTimersByTime(1300);
    });

    fireEvent.change(screen.getByLabelText(/type/i), { target: { value: "refund" } });
    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: "successful" } });
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(screen.getByText(/6 transactions found/i)).toBeInTheDocument();
  });

  it("paginates transaction list", () => {
    render(<HistoryPageClient />);

    act(() => {
      vi.advanceTimersByTime(1300);
    });

    const nextButton = screen.getByRole("button", { name: /next page/i });
    expect(nextButton).toBeEnabled();

    fireEvent.click(nextButton);

    expect(screen.getByText(/showing 9-16 of 38/i)).toBeInTheDocument();
  });

  it("expands and collapses transaction details", () => {
    render(<HistoryPageClient />);

    act(() => {
      vi.advanceTimersByTime(1300);
    });

    const rows = screen.getAllByRole("row");
    const firstDataRow = rows[1];
    const expandButton = within(firstDataRow).getByRole("button", { name: /expand transaction/i });
    fireEvent.click(expandButton);

    expect(screen.getByLabelText(/transaction detail/i)).toBeInTheDocument();

    const collapseButton = within(firstDataRow).getByRole("button", { name: /collapse transaction/i });
    fireEvent.click(collapseButton);

    expect(screen.queryByLabelText(/transaction detail/i)).not.toBeInTheDocument();
  });
});
