"use client";

import React from "react";
import { Icon, type IconName } from "@/components/icon";
import { Skeleton } from "@/components/skeleton";

export type NetworkType = "mainnet" | "testnet" | "futurenet";
export type ConnectionHealth = "healthy" | "degraded" | "disconnected";

export interface WalletStatusData {
  address: string;
  network: NetworkType;
  health: ConnectionHealth;
  balance?: number;
}

interface WalletStatusBadgeProps {
  wallet: WalletStatusData | null;
  isLoading?: boolean;
  isCompact?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

const NETWORK_CONFIG: Record<NetworkType, { label: string; color: string }> = {
  mainnet: { label: "Mainnet", color: "#1f7a8c" },
  testnet: { label: "Testnet", color: "#b06b00" },
  futurenet: { label: "Futurenet", color: "#7a32bf" },
};

const HEALTH_CONFIG: Record<
  ConnectionHealth,
  { label: string; icon: IconName; tone: "success" | "warning" | "danger" }
> = {
  healthy: { label: "Connected", icon: "check", tone: "success" },
  degraded: { label: "Slow", icon: "alert-circle", tone: "warning" },
  disconnected: { label: "Disconnected", icon: "close", tone: "danger" },
};

function shortenAddress(
  address: string,
  startChars: number = 4,
  endChars: number = 4,
): string {
  if (address.length <= startChars + endChars) {
    return address;
  }
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

function formatBalance(balance: number): string {
  if (balance >= 1_000_000) {
    return `${(balance / 1_000_000).toFixed(2)}M`;
  }
  if (balance >= 1_000) {
    return `${(balance / 1_000).toFixed(2)}K`;
  }
  return balance.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function WalletStatusBadge({
  wallet,
  isLoading = false,
  isCompact = false,
  onConnect,
  onDisconnect,
}: WalletStatusBadgeProps) {
  if (isLoading) {
    return (
      <div className="wallet-status-badge wallet-status-badge--loading">
        <Skeleton
          style={{ width: "24px", height: "24px", borderRadius: "50%" }}
        />
        <div className="wallet-status-badge__content">
          <Skeleton
            style={{ width: "80px", height: "12px", marginBottom: "0.25rem" }}
          />
          <Skeleton style={{ width: "60px", height: "10px" }} />
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <button
        className="wallet-status-badge wallet-status-badge--disconnected"
        onClick={onConnect}
        type="button"
      >
        <Icon name="wallet" size="sm" tone="muted" />
        <span className="wallet-status-badge__label">Connect Wallet</span>
      </button>
    );
  }

  const networkConfig = NETWORK_CONFIG[wallet.network];
  const healthConfig = HEALTH_CONFIG[wallet.health];

  return (
    <div
      className={`wallet-status-badge wallet-status-badge--connected ${isCompact ? "wallet-status-badge--compact" : ""}`}
    >
      <div className="wallet-status-badge__icon">
        <Icon name={healthConfig.icon} size="sm" tone={healthConfig.tone} />
      </div>

      <div className="wallet-status-badge__content">
        <div className="wallet-status-badge__address">
          <span className="wallet-status-badge__address-text">
            {shortenAddress(wallet.address)}
          </span>
          {wallet.balance !== undefined && !isCompact && (
            <span className="wallet-status-badge__balance">
              {formatBalance(wallet.balance)} XLM
            </span>
          )}
        </div>

        {!isCompact && (
          <div className="wallet-status-badge__meta">
            <span
              className="wallet-status-badge__network"
              style={{ color: networkConfig.color }}
            >
              {networkConfig.label}
            </span>
            <span className="wallet-status-badge__separator">•</span>
            <span className="wallet-status-badge__health">
              {healthConfig.label}
            </span>
          </div>
        )}
      </div>

      {onDisconnect && (
        <button
          className="wallet-status-badge__disconnect"
          onClick={onDisconnect}
          type="button"
          aria-label="Disconnect wallet"
        >
          <Icon name="close" size="sm" tone="muted" />
        </button>
      )}
    </div>
  );
}
