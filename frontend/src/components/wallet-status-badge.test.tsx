import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  WalletStatusBadge,
  type WalletStatusData,
} from "./wallet-status-badge";

describe("WalletStatusBadge", () => {
  const mockWallet: WalletStatusData = {
    address: "GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O52MABVGQXQZXQZXQ",
    network: "testnet",
    health: "healthy",
    balance: 1234.56,
  };

  it("renders loading state", () => {
    render(<WalletStatusBadge wallet={null} isLoading={true} />);
    expect(
      document.querySelector(".wallet-status-badge--loading"),
    ).toBeInTheDocument();
  });

  it("renders disconnected state with connect button", () => {
    const onConnect = vi.fn();
    render(<WalletStatusBadge wallet={null} onConnect={onConnect} />);

    const button = screen.getByRole("button", { name: /connect wallet/i });
    expect(button).toBeInTheDocument();
  });

  it("calls onConnect when connect button is clicked", async () => {
    const user = userEvent.setup();
    const onConnect = vi.fn();
    render(<WalletStatusBadge wallet={null} onConnect={onConnect} />);

    const button = screen.getByRole("button", { name: /connect wallet/i });
    await user.click(button);

    expect(onConnect).toHaveBeenCalledTimes(1);
  });

  it("renders connected wallet with shortened address", () => {
    render(<WalletStatusBadge wallet={mockWallet} />);

    expect(screen.getByText(/GCFX\.\.\.QZXQ/)).toBeInTheDocument();
  });

  it("displays balance when wallet is connected", () => {
    render(<WalletStatusBadge wallet={mockWallet} />);

    expect(screen.getByText(/1\.23K XLM/)).toBeInTheDocument();
  });

  it("displays network information", () => {
    render(<WalletStatusBadge wallet={mockWallet} />);

    expect(screen.getByText("Testnet")).toBeInTheDocument();
  });

  it("displays health status", () => {
    render(<WalletStatusBadge wallet={mockWallet} />);

    expect(screen.getByText("Connected")).toBeInTheDocument();
  });

  it("hides balance in compact mode", () => {
    render(<WalletStatusBadge wallet={mockWallet} isCompact={true} />);

    expect(screen.queryByText(/XLM/)).not.toBeInTheDocument();
  });

  it("hides network and health in compact mode", () => {
    render(<WalletStatusBadge wallet={mockWallet} isCompact={true} />);

    expect(screen.queryByText("Testnet")).not.toBeInTheDocument();
    expect(screen.queryByText("Connected")).not.toBeInTheDocument();
  });

  it("renders disconnect button when onDisconnect is provided", () => {
    const onDisconnect = vi.fn();
    render(
      <WalletStatusBadge wallet={mockWallet} onDisconnect={onDisconnect} />,
    );

    const button = screen.getByRole("button", { name: /disconnect wallet/i });
    expect(button).toBeInTheDocument();
  });

  it("calls onDisconnect when disconnect button is clicked", async () => {
    const user = userEvent.setup();
    const onDisconnect = vi.fn();
    render(
      <WalletStatusBadge wallet={mockWallet} onDisconnect={onDisconnect} />,
    );

    const button = screen.getByRole("button", { name: /disconnect wallet/i });
    await user.click(button);

    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it("formats large balances correctly", () => {
    const walletWithLargeBalance: WalletStatusData = {
      ...mockWallet,
      balance: 1_500_000,
    };
    render(<WalletStatusBadge wallet={walletWithLargeBalance} />);

    expect(screen.getByText(/1\.50M XLM/)).toBeInTheDocument();
  });

  it("displays degraded health status", () => {
    const degradedWallet: WalletStatusData = {
      ...mockWallet,
      health: "degraded",
    };
    render(<WalletStatusBadge wallet={degradedWallet} />);

    expect(screen.getByText("Slow")).toBeInTheDocument();
  });

  it("displays disconnected health status", () => {
    const disconnectedWallet: WalletStatusData = {
      ...mockWallet,
      health: "disconnected",
    };
    render(<WalletStatusBadge wallet={disconnectedWallet} />);

    expect(screen.getByText("Disconnected")).toBeInTheDocument();
  });

  it("displays mainnet network", () => {
    const mainnetWallet: WalletStatusData = {
      ...mockWallet,
      network: "mainnet",
    };
    render(<WalletStatusBadge wallet={mainnetWallet} />);

    expect(screen.getByText("Mainnet")).toBeInTheDocument();
  });
});
