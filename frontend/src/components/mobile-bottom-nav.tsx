"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAppTranslation } from "@/i18n/provider";
import { Icon } from "./icon";

const NAV_ITEMS = [
  {
    href: "/",
    labelKey: "nav.overview",
    icon: "spark",
    segment: "/",
  },
  {
    href: "/policies/weather-alpha",
    labelKey: "nav.policies",
    icon: "document",
    segment: "/policies",
  },
  {
    href: "/history",
    labelKey: "nav.history",
    icon: "clock",
    segment: "/history",
  },
] as const;

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useAppTranslation();

  return (
    <nav className="bottom-nav" aria-label={t("nav.label")}>
      {NAV_ITEMS.map(({ href, labelKey, icon, segment }) => {
        const isActive =
          segment === "/"
            ? pathname === "/"
            : pathname === segment || pathname.startsWith(segment + "/");

        return (
          <Link
            key={href}
            href={href}
            className={`bottom-nav__item${isActive ? " bottom-nav__item--active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon name={icon} size="md" tone={isActive ? "accent" : "muted"} />
            <span className="bottom-nav__label">{t(labelKey)}</span>
          </Link>
        );
      })}
    </nav>
  );
}
