import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AddressBook } from "./address-book";

const VALID_ADDRESS = "GCFX7VQ7VONM4ANPSRLJQ3Q6KXG3MNN5J4F7B3MFK7TR2Q7UDLX2M3TA";
const ANOTHER_ADDRESS = "GAZB7VQ7VONM4ANPSRLJQ3Q6KXG3MNN5J4F7B3MFK7TR2Q7UDLX2M3AB";

function makeStorage(): Storage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value);
    },
    removeItem: (key) => {
      map.delete(key);
    },
    clear: () => map.clear(),
    key: (index) => Array.from(map.keys())[index] ?? null,
    get length() {
      return map.size;
    },
  };
}

describe("AddressBook", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn() },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows empty state when no addresses are saved", () => {
    render(<AddressBook storage={makeStorage()} />);

    expect(
      screen.getByText("You haven’t saved any addresses yet."),
    ).toBeInTheDocument();
  });

  it("adds a new address through the form", async () => {
    const user = userEvent.setup();
    render(<AddressBook storage={makeStorage()} />);

    await user.click(screen.getByRole("button", { name: "Add address" }));
    await user.type(screen.getByLabelText("Label"), "Treasury");
    await user.type(screen.getByLabelText("Stellar address"), VALID_ADDRESS);
    await user.click(screen.getByRole("button", { name: "Add address" }));

    const list = screen.getByRole("list", { name: "Saved addresses" });
    expect(within(list).getByText("Treasury")).toBeInTheDocument();
    expect(within(list).getByText(VALID_ADDRESS)).toBeInTheDocument();
  });

  it("rejects invalid Stellar addresses", async () => {
    const user = userEvent.setup();
    render(<AddressBook storage={makeStorage()} />);

    await user.click(screen.getByRole("button", { name: "Add address" }));
    await user.type(screen.getByLabelText("Label"), "Bogus");
    await user.type(screen.getByLabelText("Stellar address"), "not-a-stellar-address");
    await user.click(screen.getByRole("button", { name: "Add address" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/valid Stellar address/i);
  });

  it("blocks duplicate addresses", async () => {
    const user = userEvent.setup();
    render(
      <AddressBook
        storage={makeStorage()}
        initialEntries={[
          {
            id: "1",
            label: "Existing",
            address: VALID_ADDRESS,
            category: "payout",
            createdAt: new Date().toISOString(),
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add address" }));
    await user.type(screen.getByLabelText("Label"), "Duplicate");
    await user.type(screen.getByLabelText("Stellar address"), VALID_ADDRESS);
    await user.click(screen.getByRole("button", { name: "Add address" }));

    expect(screen.getByRole("alert")).toHaveTextContent(/already saved/i);
  });

  it("removes an entry when remove is clicked", async () => {
    const user = userEvent.setup();
    render(
      <AddressBook
        storage={makeStorage()}
        initialEntries={[
          {
            id: "1",
            label: "Treasury",
            address: VALID_ADDRESS,
            category: "payout",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            label: "Backup",
            address: ANOTHER_ADDRESS,
            category: "other",
            createdAt: new Date().toISOString(),
          },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Remove Treasury" }));

    expect(screen.queryByText("Treasury")).not.toBeInTheDocument();
    expect(screen.getByText("Backup")).toBeInTheDocument();
  });

  it("persists entries to the provided storage", async () => {
    const storage = makeStorage();
    const user = userEvent.setup();
    render(<AddressBook storage={storage} />);

    await user.click(screen.getByRole("button", { name: "Add address" }));
    await user.type(screen.getByLabelText("Label"), "Treasury");
    await user.type(screen.getByLabelText("Stellar address"), VALID_ADDRESS);
    await user.click(screen.getByRole("button", { name: "Add address" }));

    const stored = storage.getItem("stellarinsure-address-book");
    expect(stored).toContain("Treasury");
    expect(stored).toContain(VALID_ADDRESS);
  });
});
