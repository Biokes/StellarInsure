"use client";

import React from "react";
import Link from "next/link";

import { Icon } from "@/components/icon";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  /** Maximum visible items on narrow screens before middle items collapse. */
  collapseAfter?: number;
  className?: string;
}

export function Breadcrumbs({
  items,
  collapseAfter = 3,
  className,
}: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  const lastIndex = items.length - 1;
  const collapsedRange =
    items.length > collapseAfter
      ? { start: 1, end: lastIndex }
      : null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={`breadcrumbs ${className ?? ""}`.trim()}
    >
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isLast = index === lastIndex;
          const isCollapsible =
            collapsedRange !== null &&
            index >= collapsedRange.start &&
            index < collapsedRange.end;

          const itemClass = `breadcrumbs__item${
            isCollapsible ? " breadcrumbs__item--collapsible" : ""
          }`;

          return (
            <React.Fragment key={`${item.label}-${index}`}>
              <li className={itemClass}>
                {isLast || !item.href ? (
                  <span
                    className="breadcrumbs__current"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link href={item.href} className="breadcrumbs__link">
                    {item.label}
                  </Link>
                )}
              </li>
              {!isLast && (
                <li
                  aria-hidden="true"
                  className={`breadcrumbs__separator${
                    isCollapsible ? " breadcrumbs__item--collapsible" : ""
                  }`}
                >
                  <Icon name="chevron-right" size="sm" tone="muted" />
                </li>
              )}
              {collapsedRange && index === collapsedRange.start - 1 && (
                <li
                  aria-hidden="true"
                  className="breadcrumbs__ellipsis-item breadcrumbs__separator"
                >
                  <span className="breadcrumbs__ellipsis">…</span>
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
