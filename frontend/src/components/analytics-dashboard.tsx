"use client";

import React, { useEffect, useState } from "react";
import {
  DashboardWidget,
  StatMetric,
  ChartContainer,
} from "@/components/dashboard-widget";

interface AnalyticsData {
  activePolicies: number;
  totalPolicies: number;
  claimsRatio: number;
  claimsProcessed: number;
  totalClaims: number;
  premiumTrend: { month: string; amount: number }[];
  weeklyChange: number;
}

const MOCK_ANALYTICS_DATA: AnalyticsData = {
  activePolicies: 24,
  totalPolicies: 156,
  claimsRatio: 0.85,
  claimsProcessed: 42,
  totalClaims: 49,
  premiumTrend: [
    { month: "Jan", amount: 12500 },
    { month: "Feb", amount: 15200 },
    { month: "Mar", amount: 14800 },
    { month: "Apr", amount: 18900 },
  ],
  weeklyChange: 12.5,
};

interface AnalyticsDashboardProps {
  onDataUpdate?: (data: AnalyticsData) => void;
}

export function AnalyticsDashboard({ onDataUpdate }: AnalyticsDashboardProps) {
  const { t } = useAppTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));
        setData(MOCK_ANALYTICS_DATA);
        onDataUpdate?.(MOCK_ANALYTICS_DATA);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics data");
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [onDataUpdate]);

  const successRate = data ? Math.round((data.claimsProcessed / data.totalClaims) * 100) : 0;

  return (
    <div className="analytics-dashboard">
      <div className="analytics-grid">
        {/* Active Policies Widget */}
        <DashboardWidget
          title="Active Policies"
          description="Currently active coverage"
          icon="shield"
          isLoading={isLoading}
          isError={!!error}
          errorMessage={error || undefined}
        >
          <div className="widget-content">
            <StatMetric
              label="Active Policies"
              value={data?.activePolicies ?? 0}
              change={{
                value: 8,
                isPositive: true,
              }}
            />
            <div className="widget-detail">
              <span className="detail-label">Of Total:</span>
              <span className="detail-value">
                {data?.activePolicies}/{data?.totalPolicies || 0}
              </span>
            </div>
          </div>
        </DashboardWidget>

        {/* Claims Ratio Widget */}
        <DashboardWidget
          title="Claims Success Rate"
          description="Processed vs pending claims"
          icon="verify"
          isLoading={isLoading}
          isError={!!error}
          errorMessage={error || undefined}
        >
          <div className="widget-content">
            <StatMetric
              label="Success Rate"
              value={successRate}
              unit="%"
              change={{
                value: 3.2,
                isPositive: true,
              }}
            />
            <div className="widget-detail">
              <span className="detail-label">Processed:</span>
              <span className="detail-value">
                {data?.claimsProcessed}/{data?.totalClaims || 0}
              </span>
            </div>
          </div>
        </DashboardWidget>

        {/* Premium Trends Widget */}
        <DashboardWidget
          title="Premium Trends"
          description="Monthly premium collection"
          icon="trending-up"
          isLoading={isLoading}
          isError={!!error}
          errorMessage={error || undefined}
        >
          <div className="widget-content">
            <StatMetric
              label="Total Premium (Current)"
              value={data?.premiumTrend[data.premiumTrend.length - 1]?.amount ?? 0}
              unit="USD"
              change={{
                value: data?.weeklyChange ?? 0,
                isPositive: (data?.weeklyChange ?? 0) >= 0,
              }}
            />
            <ChartContainer height="120px">
              <div className="simple-chart">
                {data?.premiumTrend.map((entry) => (
                  <div key={entry.month} className="chart-bar-wrapper">
                    <div
                      className="chart-bar"
                      style={{
                        height: `${(entry.amount / 20000) * 100}%`,
                      }}
                      title={`${entry.month}: $${entry.amount}`}
                    />
                    <span className="chart-label">{entry.month}</span>
                  </div>
                ))}
              </div>
            </ChartContainer>
          </div>
        </DashboardWidget>
      </div>
    </div>
  );
}
