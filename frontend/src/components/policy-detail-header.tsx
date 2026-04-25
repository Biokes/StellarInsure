"use client";

import React from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { Skeleton } from "@/components/skeleton";

export type PolicyStatus =
  | "active"
  | "expired"
  | "claimed"
  | "cancelled"
  | "pending";

export interface PolicyHeaderData {
  id: string;
  title: string;
  type: string;
  status: PolicyStatus;
  coverageAmount: number;
  premium: number;
  startDate: string;
  endDate: string;
  payoutDestination: string;
}

interface PolicyDetailHeaderProps {
  policy: PolicyHeaderData;
  isLoading?: boolean;
  onPayPremium?: () => void;
  onPrint?: () => void;
  onBack?: () => void;
  showActions?: boolean;
}

const STATUS_CONFIG: Record<
  PolicyStatus,
  { label: string; className: string }
> = {
  active: { label: "Active", className: "status-pill--active" },
  expired: { label: "Expired", className: "status-pill--expired" },
  claimed: { label: "Claimed", className: "status-pill--claimed" },
  cancelled: { label: "Cancelled", className: "status-pill--cancelled" },
  pending: { label: "Pending", className: "status-pill--pending" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export function PolicyDetailHeader({
  policy,
  isLoading = false,
  onPayPremium,
  onPrint,
  onBack,
  showActions = true,
}: PolicyDetailHeaderProps) {
  if (isLoading) {
    return (
      <header className="section-header policy-header">
        <div>
          <Skeleton
            style={{
              width: "100px",
              height: "14px",
              marginBottom: "0.75rem",
              borderRadius: "20px",
            }}
          />
          <Skeleton
            style={{ width: "60%", height: "36px", marginBottom: "0.5rem" }}
          />
          <Skeleton style={{ width: "40%", height: "16px" }} />
        </div>
        {showActions && (
          <div className="policy-header__actions print-hidden">
            <Skeleton
              style={{ width: "120px", height: "48px", borderRadius: "24px" }}
            />
            <Skeleton
              style={{ width: "100px", height: "48px", borderRadius: "24px" }}
            />
            <Skeleton
              style={{ width: "100px", height: "48px", borderRadius: "24px" }}
            />
          </div>
        )}
      </header>
    );
  }

  const statusConfig = STATUS_CONFIG[policy.status];

  return (
    <header className="section-header policy-header">
      <div className="policy-header__content">
        <div className="policy-header__meta">
          <span className="eyebrow">Policy Detail</span>
          <span className={`status-pill ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
        </div>

        <h1>{policy.title}</h1>

        <div className="policy-header__info">
          <div className="policy-header__info-item">
            <Icon name="shield" size="sm" tone="accent" />
            <span>{policy.type}</span>
          </div>
          <div className="policy-header__info-item">
            <Icon name="document" size="sm" tone="muted" />
            <span>{policy.id}</span>
          </div>
        </div>

        <dl className="policy-header__stats">
          <div>
            <dt>Coverage</dt>
            <dd>{formatAmount(policy.coverageAmount)} XLM</dd>
          </div>
          <div>
            <dt>Premium</dt>
            <dd>{formatAmount(policy.premium)} XLM</dd>
          </div>
          <div>
            <dt>Period</dt>
            <dd>
              {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
            </dd>
          </div>
          <div>
            <dt>Payout Address</dt>
            <dd className="tx-detail-hash">{policy.payoutDestination}</dd>
          </div>
        </dl>
      </div>

      {showActions && (
        <div className="policy-header__actions print-hidden">
          {onPayPremium && policy.status === "active" && (
            <button
              className="cta-primary"
              type="button"
              onClick={onPayPremium}
            >
              <Icon name="wallet" size="sm" />
              Pay Premium
            </button>
          )}
          {onPrint && (
            <button className="cta-secondary" type="button" onClick={onPrint}>
              <Icon name="document" size="sm" />
              Print
            </button>
          )}
          {onBack && (
            <Link className="cta-secondary" href="/history">
              <Icon name="chevron-up" size="sm" />
              Back
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
