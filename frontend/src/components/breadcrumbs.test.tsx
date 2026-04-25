import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Breadcrumbs } from "./breadcrumbs";

describe("Breadcrumbs", () => {
  it("renders nothing when given an empty list", () => {
    const { container } = render(<Breadcrumbs items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders links for non-current items and marks the last item as current", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "Overview", href: "/" },
          { label: "Policies", href: "/policies" },
          { label: "POL-2024-00123" },
        ]}
      />,
    );

    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Policies" })).toBeInTheDocument();

    const current = screen.getByText("POL-2024-00123");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("marks middle items as collapsible when over the threshold", () => {
    render(
      <Breadcrumbs
        items={[
          { label: "A", href: "/a" },
          { label: "B", href: "/a/b" },
          { label: "C", href: "/a/b/c" },
          { label: "D" },
        ]}
        collapseAfter={3}
      />,
    );

    const collapsibles = document.querySelectorAll(
      ".breadcrumbs__item--collapsible",
    );
    expect(collapsibles.length).toBeGreaterThan(0);
    expect(
      document.querySelector(".breadcrumbs__ellipsis-item"),
    ).not.toBeNull();
  });

  it("uses Breadcrumb landmark for assistive tech", () => {
    render(<Breadcrumbs items={[{ label: "Home" }]} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });
});
