import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CopyButton } from "./copy-button";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CopyButton", () => {
  it("writes the value to the clipboard and surfaces success state", async () => {
    const user = userEvent.setup();
    const writeSpy = vi.spyOn(navigator.clipboard, "writeText");
    render(<CopyButton value="GABC123" label="Copy address" />);

    await user.click(screen.getByRole("button", { name: "Copy address" }));

    expect(writeSpy).toHaveBeenCalledWith("GABC123");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument(),
    );
  });

  it("disables itself when value is empty", () => {
    render(<CopyButton value="   " />);

    expect(screen.getByRole("button", { name: "Nothing to copy" })).toBeDisabled();
  });

  it("shows error feedback when clipboard write fails", async () => {
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(
      new Error("denied"),
    );
    const user = userEvent.setup();
    render(<CopyButton value="GXYZ" />);

    await user.click(screen.getByRole("button"));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Copy failed" })).toBeInTheDocument(),
    );
  });

  it("renders an inline label when variant is inline", () => {
    render(<CopyButton value="GXYZ" variant="inline" label="Copy" />);

    expect(screen.getByText("Copy")).toBeInTheDocument();
  });
});
