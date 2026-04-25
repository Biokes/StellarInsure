import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { RiskPoolCards, type RiskPoolMetrics } from "./risk-pool-cards";

describe("RiskPoolCards", () => {
  const mockMetrics: RiskPoolMetrics = {
    tvl: 5_000_000,
    apy: 0.0875,
    utilization: 0.65,
    totalPolicies: 1234,
    activeClaims: 42,
    historicalPerformance: [
      { period: "Q1 2026", value: 4_500_000, change: 12.5 },
      { period: "Q2 2026", value: 4_800_000, change: 6.7 },
      { period: "Q3 2026", value: 5_000_000, change: 4.2 },
    ],
  };

  it("renders pool overview title", () => {
    render(<RiskPoolCards metrics={mockMetrics} />);
    expect(screen.getByText("Pool Overview")).toBeInTheDocument();
  });

  it("renders TVL metric", () => {
    render(<RiskPoolCards metrics={mockMetrics} />);
    expect(screen.getByText("Total Value Locked")).toBeInTheDocument();
    expect(screen.getByText(/5\.00M XLM/)).toBeInTheDocument();
  });

  it("renders APY metric", () => {
    render(<RiskPoolCards metrics={mockMetrics} />);
    expect(screen.getByText("Annual Percentage Yield")).toBeInTheDocument();
    expect(screen.getByText("8.75%")).toBeInTheDocument();
  });

  it("renders utilization metric", () => {
    render(<RiskPoolCards metrics={mockMetrics} />);
    expect(screen.getByText("Pool Utilization")).toBeInTheDocument();
    expect(screen.getByText("65.0%")).toBeInTheDocument();
  });

  it("renders active claims count", () => {
    render(<RiskPoolCards metrics={mockMetrics} />);
    expect(screen.getByText("42 active claims")).toBeInTheDocument();
  });

  it("renders total policies metric", () => {
    render(<RiskPoolCards metrics={mockMetrics} />);
    expect(screen.getByText("Active Policies")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
  });

  it("renders historical performance section", () => {
    render(<RiskPoolCards metrics={mockMetrics} />);
    expect(screen.getByText("Historical Performance")).toBeInTheDocument();
  });

  it("renders all historical periods", () => {
    render(<RiskPoolCards metrics={mockMetrics} />);
    expect(screen.getByText("Q1 2026")).toBeInTheDocument();
    expect(screen.getByText("Q2 2026")).toBeInTheDocument();
    expect(screen.getByText("Q3 2026")).toBeInTheDocument();
  });

  it("renders historical performance changes", () => {
    render(<RiskPoolCards metrics={mockMetrics} />);
    expect(screen.getByText("+12.5%")).toBeInTheDocument();
    expect(screen.getByText("+6.7%")).toBeInTheDocument();
    expect(screen.getByText("+4.2%")).toBeInTheDocument();
  });

  it("renders loading state for all cards", () => {
    render(<RiskPoolCards metrics={mockMetrics} isLoading={true} />);
    const loadingCards = document.querySelectorAll(".hero-card");
    expect(loadingCards.length).toBeGreaterThan(0);
  });

  it("does not render historical performance when loading", () => {
    render(<RiskPoolCards metrics={mockMetrics} isLoading={true} />);
    expect(
      screen.queryByText("Historical Performance"),
    ).not.toBeInTheDocument();
  });

  it("formats large TVL values correctly", () => {
    const largeMetrics: RiskPoolMetrics = {
      ...mockMetrics,
      tvl: 1_500_000,
    };
    render(<RiskPoolCards metrics={largeMetrics} />);
    expect(screen.getByText(/1\.50M XLM/)).toBeInTheDocument();
  });

  it("formats small TVL values correctly", () => {
    const smallMetrics: RiskPoolMetrics = {
      ...mockMetrics,
      tvl: 500,
    };
    render(<RiskPoolCards metrics={smallMetrics} />);
    expect(screen.getByText(/500 XLM/)).toBeInTheDocument();
  });

  it("uses custom currency when provided", () => {
    render(<RiskPoolCards metrics={mockMetrics} currency="USDC" />);
    expect(screen.getByText(/USDC/)).toBeInTheDocument();
  });

  it("renders without historical performance", () => {
    const metricsWithoutHistory: RiskPoolMetrics = {
      ...mockMetrics,
      historicalPerformance: undefined,
    };
    render(<RiskPoolCards metrics={metricsWithoutHistory} />);
    expect(
      screen.queryByText("Historical Performance"),
    ).not.toBeInTheDocument();
  });

  it("renders with empty historical performance", () => {
    const metricsWithEmptyHistory: RiskPoolMetrics = {
      ...mockMetrics,
      historicalPerformance: [],
    };
    render(<RiskPoolCards metrics={metricsWithEmptyHistory} />);
    expect(
      screen.queryByText("Historical Performance"),
    ).not.toBeInTheDocument();
  });

  it("displays TVL trend when available", () => {
    render(<RiskPoolCards metrics={mockMetrics} />);
    // The trend is calculated from the last historical performance entry
    expect(screen.getByText("+4.2%")).toBeInTheDocument();
  });

  it("handles negative performance changes", () => {
    const metricsWithNegative: RiskPoolMetrics = {
      ...mockMetrics,
      historicalPerformance: [
        { period: "Q1 2026", value: 5_000_000, change: -5.2 },
      ],
    };
    render(<RiskPoolCards metrics={metricsWithNegative} />);
    expect(screen.getByText("-5.2%")).toBeInTheDocument();
  });

  it("renders subtitle for metrics", () => {
    render(<RiskPoolCards metrics={mockMetrics} />);
    expect(screen.getByText("Pool liquidity")).toBeInTheDocument();
    expect(
      screen.getByText("Current APY for liquidity providers"),
    ).toBeInTheDocument();
    expect(screen.getByText("Total coverage issued")).toBeInTheDocument();
  });
});
