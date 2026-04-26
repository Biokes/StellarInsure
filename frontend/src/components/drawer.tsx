"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  position?: "left" | "right";
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

const POSITION_STYLES = {
  left: "drawer--left",
  right: "drawer--right",
};

export function Drawer({
  isOpen,
  onClose,
  children,
  title,
  description,
  position = "right",
  closeOnBackdrop = true,
  closeOnEscape = true,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = title ? `drawer-title-${Math.random().toString(36).slice(2)}` : undefined;
  const descId = description ? `drawer-desc-${Math.random().toString(36).slice(2)}` : undefined;

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = "hidden";
      drawerRef.current?.focus();
    } else {
      document.body.style.overflow = "";
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  }

  if (!isOpen) return null;

  const content = (
    <div
      className="drawer-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onClick={handleBackdropClick}
      tabIndex={-1}
    >
      <div
        ref={drawerRef}
        className={`drawer ${POSITION_STYLES[position]}`}
        tabIndex={-1}
      >
        <div className="drawer__header">
          {title && (
            <h2 id={titleId} className="drawer__title">
              {title}
            </h2>
          )}
          <button
            className="drawer__close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            Close
          </button>
        </div>
        {description && (
          <p id={descId} className="drawer__desc">
            {description}
          </p>
        )}
        <div className="drawer__content">
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;

  return createPortal(content, document.body);
}