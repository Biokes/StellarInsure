"use client";

import React from "react";
import Link from "next/link";

import { maintenanceNotice, type MaintenanceNotice } from "@/content/maintenance";
import { useAppTranslation } from "@/i18n/provider";

import { Icon } from "./icon";

function formatWindowLabel(notice: MaintenanceNotice): string | null {
  if (!notice.startTime || !notice.endTime) {
    return null;
  }

  const start = new Date(notice.startTime);
  const end = new Date(notice.endTime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  const sameDay = start.toDateString() === end.toDateString();
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  });

  if (sameDay) {
    return `${dateFormatter.format(start)}, ${timeFormatter.format(start)} to ${timeFormatter.format(end)}`;
  }

  return `${dateFormatter.format(start)} ${timeFormatter.format(start)} to ${dateFormatter.format(end)} ${timeFormatter.format(end)}`;
}

export function MaintenanceBanner() {
  const { t } = useAppTranslation();

  if (maintenanceNotice.state === "off") {
    return null;
  }

  const isActive = maintenanceNotice.state === "active";
  const windowLabel = formatWindowLabel(maintenanceNotice);
  const statusLabel = isActive ? t("maintenance.status.active") : t("maintenance.status.scheduled");
  const role = isActive ? "alert" : "status";

  return (
    <section
      aria-label={t("maintenance.regionLabel")}
      aria-live={isActive ? "assertive" : "polite"}
      className={`maintenance-banner maintenance-banner--${maintenanceNotice.state}`}
      role={role}
    >
      <div className="maintenance-banner__content">
        <div className="maintenance-banner__eyebrow">
          <Icon name={isActive ? "alert" : "clock"} size="sm" tone={isActive ? "warning" : "accent"} />
          <span>{t("maintenance.badge")}</span>
        </div>

        <div className="maintenance-banner__body">
          <p className="maintenance-banner__status">{statusLabel}</p>
          <h2>{maintenanceNotice.headline}</h2>
          <p>{maintenanceNotice.message}</p>
        </div>

        <div className="maintenance-banner__meta">
          <div className="maintenance-banner__window">
            <Icon name="calendar" size="sm" tone="muted" />
            <div>
              <p className="maintenance-banner__meta-label">{t("maintenance.windowLabel")}</p>
              <p>
                {windowLabel ?? t("maintenance.windowFallback")}
                {maintenanceNotice.timezoneLabel && windowLabel
                  ? ` (${maintenanceNotice.timezoneLabel})`
                  : null}
              </p>
            </div>
          </div>

          {maintenanceNotice.ctaHref && maintenanceNotice.ctaLabel ? (
            <Link className="maintenance-banner__link" href={maintenanceNotice.ctaHref}>
              <span>{maintenanceNotice.ctaLabel}</span>
              <Icon name="arrow-up-right" size="sm" tone="accent" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
