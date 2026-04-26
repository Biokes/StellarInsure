"use client";

import React, { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  closeOnBackdrop = true,
  closeOnEscape = true,
  showCloseButton = true,
  size = "md",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = title ? `modal-title-${Math.random().toString(36).slice(2)}` : undefined;
  const descId = description ? `modal-desc-${Math.random().toString(36).slice(2)}` : undefined;

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
    } else {
      previousActiveElement.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && closeOnEscape) {
        onClose();
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
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

  const sizeClass = {
    sm: "ob-modal--sm",
    md: "ob-modal--md",
    lg: "ob-modal--lg",
  }[size];

  const content = (
    <div
      className="ob-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onClick={handleBackdropClick}
      tabIndex={-1}
    >
      <div ref={modalRef} className={`ob-modal ${sizeClass}`} tabIndex={-1}>
        {showCloseButton && (
          <button
            className="ob-skip"
            onClick={onClose}
            aria-label="Close modal"
          >
            Close
          </button>
        )}
        <div className="ob-content">
          {title && (
            <h2 id={titleId} className="ob-title">
              {title}
            </h2>
          )}
          {description && (
            <p id={descId} className="ob-desc">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );

  if (typeof window === "undefined") return null;

  return createPortal(content, document.body);
}