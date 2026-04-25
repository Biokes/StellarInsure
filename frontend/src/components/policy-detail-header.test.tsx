import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  PolicyDetailHeader,
  type PolicyHeaderData,
} from "./policy-detail-header";

describe("PolicyDetailHeader", () => {
  const mockPolicy: PolicyHeaderData = {
    id: "POL-2026-014",
    title: "Northern Plains Weather Guard",
    type: "Weather protection",
    status: "active",
    coverageAmount: 12000,
    premium: 480,
    startDate: "2026-03-01T08:00:00.000Z",
    endDate: "2026-09-01T08:00:00.000Z",
    payoutDestination: "GCFX...J4F7",
  };

  it("renders loading state", () => {
    render(<PolicyDetailHeader policy={mockPolicy} isLoading={true} />);
    expect(document.querySelector(".policy-header")).toBeInTheDocument();
  });

  it("renders policy title", () => {
    render(<PolicyDetailHeader policy={mockPolicy} />);
    expect(
      screen.getByText("Northern Plains Weather Guard"),
    ).toBeInTheDocument();
  });

  it("renders policy ID", () => {
    render(<PolicyDetailHeader policy={mockPolicy} />);
    expect(screen.getByText("POL-2026-014")).toBeInTheDocument();
  });

  it("renders policy type", () => {
    render(<PolicyDetailHeader policy={mockPolicy} />);
    expect(screen.getByText("Weather protection")).toBeInTheDocument();
  });

  it("renders active status badge", () => {
    render(<PolicyDetailHeader policy={mockPolicy} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders coverage amount", () => {
    render(<PolicyDetailHeader policy={mockPolicy} />);
    expect(screen.getByText(/12,000\.00/)).toBeInTheDocument();
  });

  it("renders premium amount", () => {
    render(<PolicyDetailHeader policy={mockPolicy} />);
    expect(screen.getByText(/480\.00/)).toBeInTheDocument();
  });

  it("renders formatted dates", () => {
    render(<PolicyDetailHeader policy={mockPolicy} />);
    expect(screen.getByText(/March 1, 2026/)).toBeInTheDocument();
    expect(screen.getByText(/September 1, 2026/)).toBeInTheDocument();
  });

  it("renders payout destination", () => {
    render(<PolicyDetailHeader policy={mockPolicy} />);
    expect(screen.getByText("GCFX...J4F7")).toBeInTheDocument();
  });

  it("renders pay premium button for active policies", () => {
    const onPayPremium = vi.fn();
    render(
      <PolicyDetailHeader policy={mockPolicy} onPayPremium={onPayPremium} />,
    );

    expect(
      screen.getByRole("button", { name: /pay premium/i }),
    ).toBeInTheDocument();
  });

  it("does not render pay premium button for expired policies", () => {
    const expiredPolicy: PolicyHeaderData = {
      ...mockPolicy,
      status: "expired",
    };
    const onPayPremium = vi.fn();
    render(
      <PolicyDetailHeader policy={expiredPolicy} onPayPremium={onPayPremium} />,
    );

    expect(
      screen.queryByRole("button", { name: /pay premium/i }),
    ).not.toBeInTheDocument();
  });

  it("calls onPayPremium when button is clicked", async () => {
    const user = userEvent.setup();
    const onPayPremium = vi.fn();
    render(
      <PolicyDetailHeader policy={mockPolicy} onPayPremium={onPayPremium} />,
    );

    const button = screen.getByRole("button", { name: /pay premium/i });
    await user.click(button);

    expect(onPayPremium).toHaveBeenCalledTimes(1);
  });

  it("renders print button when onPrint is provided", () => {
    const onPrint = vi.fn();
    render(<PolicyDetailHeader policy={mockPolicy} onPrint={onPrint} />);

    expect(screen.getByRole("button", { name: /print/i })).toBeInTheDocument();
  });

  it("calls onPrint when button is clicked", async () => {
    const user = userEvent.setup();
    const onPrint = vi.fn();
    render(<PolicyDetailHeader policy={mockPolicy} onPrint={onPrint} />);

    const button = screen.getByRole("button", { name: /print/i });
    await user.click(button);

    expect(onPrint).toHaveBeenCalledTimes(1);
  });

  it("renders back link when onBack is provided", () => {
    render(<PolicyDetailHeader policy={mockPolicy} onBack={() => {}} />);

    expect(screen.getByRole("link", { name: /back/i })).toBeInTheDocument();
  });

  it("hides actions when showActions is false", () => {
    render(
      <PolicyDetailHeader
        policy={mockPolicy}
        showActions={false}
        onPayPremium={() => {}}
        onPrint={() => {}}
      />,
    );

    expect(
      screen.queryByRole("button", { name: /pay premium/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /print/i }),
    ).not.toBeInTheDocument();
  });

  it("renders expired status correctly", () => {
    const expiredPolicy: PolicyHeaderData = {
      ...mockPolicy,
      status: "expired",
    };
    render(<PolicyDetailHeader policy={expiredPolicy} />);

    expect(screen.getByText("Expired")).toBeInTheDocument();
  });

  it("renders claimed status correctly", () => {
    const claimedPolicy: PolicyHeaderData = {
      ...mockPolicy,
      status: "claimed",
    };
    render(<PolicyDetailHeader policy={claimedPolicy} />);

    expect(screen.getByText("Claimed")).toBeInTheDocument();
  });

  it("renders cancelled status correctly", () => {
    const cancelledPolicy: PolicyHeaderData = {
      ...mockPolicy,
      status: "cancelled",
    };
    render(<PolicyDetailHeader policy={cancelledPolicy} />);

    expect(screen.getByText("Cancelled")).toBeInTheDocument();
  });

  it("renders pending status correctly", () => {
    const pendingPolicy: PolicyHeaderData = {
      ...mockPolicy,
      status: "pending",
    };
    render(<PolicyDetailHeader policy={pendingPolicy} />);

    expect(screen.getByText("Pending")).toBeInTheDocument();
  });
});
