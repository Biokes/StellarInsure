export type MaintenanceState = "off" | "scheduled" | "active";

export type MaintenanceNotice = {
  state: MaintenanceState;
  headline: string;
  message: string;
  startTime?: string;
  endTime?: string;
  timezoneLabel?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export const maintenanceNotice: MaintenanceNotice = {
  state: "scheduled",
  headline: "Platform maintenance planned",
  message:
    "Wallet connection, policy snapshots, and claim submission may be briefly unavailable while we roll out frontend infrastructure updates.",
  startTime: "2026-04-10T01:00:00Z",
  endTime: "2026-04-10T03:30:00Z",
  timezoneLabel: "UTC",
  ctaHref: "/history",
  ctaLabel: "Review recent activity",
};
