"use client";

import React, { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon";
import { Skeleton } from "@/components/skeleton";

interface DashboardWidgetProps {
  title: string;
  description?: string;
  children: ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  icon?: IconName;
}

export function DashboardWidget({
  title,
  description,
  children,
  isLoading = false,
  isError = false,
  errorMessage,
  icon,
}: DashboardWidgetProps) {
  if (isError) {
    return (
      <div className="dashboard-widget dashboard-widget--error">
        <div className="dashboard-widget__header">
          {icon && <Icon name={icon} size="md" tone="danger" />}
          <h3>{title}</h3>
        </div>
        <div className="dashboard-widget__error-content">
          <Icon name="alert-circle" size="lg" tone="danger" />
          <p>{errorMessage || "Failed to load data"}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="dashboard-widget dashboard-widget--loading">
        <div className="dashboard-widget__header">
          {icon && <Icon name={icon} size="md" tone="muted" />}
          <h3>{title}</h3>
        </div>
        <div className="dashboard-widget__loading-content">
          <Skeleton style={{ height: "48px", width: "100%", marginBottom: "12px" }} />
          <Skeleton style={{ height: "16px", width: "80%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-widget">
      <div className="dashboard-widget__header">
        {icon && <Icon name={icon} size="md" tone="accent" />}
        <div>
          <h3>{title}</h3>
          {description && <p className="dashboard-widget__description">{description}</p>}
        </div>
      </div>
      <div className="dashboard-widget__content">{children}</div>
    </div>
  );
}

interface StatMetricProps {
  label: string;
  value: string | number;
  change?: { value: number; isPositive: boolean };
  unit?: string;
}

export function StatMetric({ label, value, change, unit }: StatMetricProps) {
  return (
    <div className="stat-metric">
      <div className="stat-metric__value">
        <span className="stat-metric__number">{value}</span>
        {unit && <span className="stat-metric__unit">{unit}</span>}
      </div>
      <div className="stat-metric__label">{label}</div>
      {change && (
        <div className={`stat-metric__change ${change.isPositive ? "is-positive" : "is-negative"}`}>
          <Icon
            name={change.isPositive ? "trending-up" : "trending-down"}
            size="sm"
          />
          <span>{change.isPositive ? "+" : ""}{change.value}%</span>
        </div>
      )}
    </div>
  );
}

interface ChartContainerProps {
  children: ReactNode;
  height?: string;
}

export function ChartContainer({ children, height = "200px" }: ChartContainerProps) {
  return (
    <div className="chart-container" style={{ height }}>
      {children}
    </div>
  );
}
