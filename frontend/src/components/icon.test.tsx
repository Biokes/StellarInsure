import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Icon } from "./icon";

describe("Icon", () => {
  it("renders a decorative icon hidden from assistive technology by default", () => {
    render(<Icon name="shield" />);

    const icon = document.querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
  });

  it("renders a labelled icon when semantic meaning is required", () => {
    render(<Icon name="alert" label="Maintenance alert" />);

    expect(screen.getByRole("img", { name: "Maintenance alert" })).toBeInTheDocument();
  });
});
