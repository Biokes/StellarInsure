"use client";

import React from "react";
import { Icon, type IconName } from "@/components/icon";
import { Skeleton } from "@/components/skeleton";

export interface RiskPoolMetrics {
  tvl: number;
  apy: number;
  utilization: number;
  totalPolicies: number;
  activeClaims: number;
  historicalPerformance?: {
    period: string;
    value: number;
    change: number;
  }[];
}

interface RiskPoolCardsProps {
  metrics: RiskPoolMetrics;
  isLoading?: boolean;
  currency?: string;
}

interface MetricCardProps {
  icon: IconName;
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
}

function formatCurrency(amount: number, currency: string = "XLM"): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M ${currency}`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K ${currency}`;
  }
  return `${amount.toLocaleString("en-US", { maximumFractionDigits: 2 })} ${currency}`;
}

function MetricCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  isLoading,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <div className="hero-card motion-panel">
        <div className="metric">
          <Skeleton
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              marginBottom: "0.75rem",
            }}
          />
          <Skeleton
            style={{ width: "60%", height: "12px", marginBottom: "0.5rem" }}
          />
          <Skeleton
            style={{ width: "80%", height: "28px", marginBottom: "0.25rem" }}
          />
          {subtitle && <Skeleton style={{ width: "50%", height: "10px" }} />}
        </div>
      </div>
    );
  }

  return (
    <div className="hero-card motion-panel">
      <div className="metric">
        <div className="feature-card__icon">
          <Icon name={icon} size="md" tone="accent" />
        </div>
        <p className="metadata-label">{label}</p>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <strong>{value}</strong>
          {trend && (
            <span
              className={`stat-metric__change ${trend.isPositive ? "is-positive" : "is-negative"}`}
              style={{ fontSize: "var(--step-0)" }}
            >
              <Icon
                name={trend.isPositive ? "trending-up" : "trending-down"}
                size="sm"
              />
              <span>
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            </span>
          )}
        </div>
        {subtitle && (
          <p
            style={{
              margin: 0,
              color: "var(--text-muted)",
              fontSize: "var(--step-0)",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export function RiskPoolCards({
  metrics,
  isLoading = false,
  currency = "XLM",
}: RiskPoolCardsProps) {
  const utilizationPercentage = (metrics.utilization * 100).toFixed(1);
  const apyPercentage = (metrics.apy * 100).toFixed(2);

  // Calculate trend from historical performance if available
  const tvlTrend =
    metrics.historicalPerformance && metrics.historicalPerformance.length >= 2
      ? {
          value:
            metrics.historicalPerformance[
              metrics.historicalPerformance.length - 1
            ].change,
          isPositive:
            metrics.historicalPerformance[
              metrics.historicalPerformance.length - 1
            ].change > 0,
        }
      : undefined;

  return (
    <section className="risk-pool-overview" aria-labelledby="risk-pool-title">
      <div className="section-header">
        <span className="eyebrow">Risk Pool</span>
        <h2 id="risk-pool-title">Pool Overview</h2>
        <p>
          Real-time metrics and performance indicators for the insurance risk
          pool
        </p>
      </div>

      <div className="hero-grid">
        <MetricCard
          icon="trending-up"
          label="Total Value Locked"
          value={formatCurrency(metrics.tvl, currency)}
          subtitle="Pool liquidity"
          trend={tvlTrend}
          isLoading={isLoading}
        />

        <MetricCard
          icon="trending-up"
          label="Annual Percentage Yield"
          value={`${apyPercentage}%`}
          subtitle="Current APY for liquidity providers"
          isLoading={isLoading}
        />

        <MetricCard
          icon="activity"
          label="Pool Utilization"
          value={`${utilizationPercentage}%`}
          subtitle={`${metrics.activeClaims} active claims`}
          isLoading={isLoading}
        />

        <MetricCard
          icon="shield"
          label="Active Policies"
          value={metrics.totalPolicies.toLocaleString()}
          subtitle="Total coverage issued"
          isLoading={isLoading}
        />
      </div>

      {metrics.historicalPerformance &&
        metrics.historicalPerformance.length > 0 &&
        !isLoading && (
          <div className="panel motion-panel">
            <div className="panel-heading">
              <Icon name="activity" size="md" tone="accent" />
              <h3>Historical Performance</h3>
            </div>
            <div className="chart-bars">
              {metrics.historicalPerformance.map((period, index) => {
                const maxValue = Math.max(
                  ...metrics.historicalPerformance!.map((p) =>
                    Math.abs(p.value),
                  ),
                );
                const percentage = (Math.abs(period.value) / maxValue) * 100;

                return (
                  <div key={index} className="chart-bar-row">
                    <span
                      style={{ fontSize: "var(--step-0)", fontWeight: 600 }}
                    >
                      {period.period}
                    </span>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        flex: 1,
                      }}
                    >
                      <div className="chart-bar-track">
                        <div
                          className="chart-bar-fill"
                          style={{
                            width: `${percentage}%`,
                            background:
                              period.change >= 0
                                ? "var(--success-strong)"
                                : "var(--danger-strong)",
                          }}
                        />
                      </div>
                      <span
                        style={{
                          fontSize: "var(--step-0)",
                          fontWeight: 600,
                          color:
                            period.change >= 0
                              ? "var(--success-strong)"
                              : "var(--danger-strong)",
                          minWidth: "4rem",
                        }}
                      >
                        {period.change >= 0 ? "+" : ""}
                        {period.change.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
    </section>
  );
}
