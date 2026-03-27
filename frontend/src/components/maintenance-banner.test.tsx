import React from "react";
import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { maintenanceNotice } from "@/content/maintenance";
import { LanguageProvider } from "@/i18n/provider";

import { MaintenanceBanner } from "./maintenance-banner";

const originalNotice = { ...maintenanceNotice };

function renderBanner() {
  return render(
    <LanguageProvider>
      <MaintenanceBanner />
    </LanguageProvider>,
  );
}

describe("MaintenanceBanner", () => {
  afterEach(() => {
    Object.assign(maintenanceNotice, originalNotice);
  });

  it("renders the global notice with the scheduled downtime window", () => {
    renderBanner();

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/platform maintenance planned/i)).toBeInTheDocument();
    expect(screen.getByText(/review recent activity/i)).toBeInTheDocument();
  });

  it("falls back gracefully when no downtime window is configured", () => {
    maintenanceNotice.startTime = undefined;
    maintenanceNotice.endTime = undefined;

    renderBanner();

    expect(screen.getByText(/downtime window will be confirmed soon/i)).toBeInTheDocument();
  });
});
