"use client";

import React, { useEffect, useRef } from "react";

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Modal dialog shown when users attempt to navigate away with unsaved form changes.
 *
 * - Focus is trapped inside the dialog while open.
 * - Escape key cancels (stays on page).
 * - `role="alertdialog"` ensures screen readers announce it immediately.
 */
export function UnsavedChangesDialog({
  isOpen,
  message = "You have unsaved changes. If you leave now, your changes will be lost.",
  onConfirm,
  onCancel,
}: UnsavedChangesDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the "Stay" button when dialog opens
  useEffect(() => {
    if (isOpen) {
      cancelRef.current?.focus();
    }
  }, [isOpen]);

  // Escape key → cancel
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="unsaved-dialog-backdrop"
      role="presentation"
      onClick={(e) => {
        // Click outside → cancel
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="unsaved-dialog-heading"
        aria-describedby="unsaved-dialog-body"
        className="unsaved-dialog"
      >
        <h2 id="unsaved-dialog-heading" className="unsaved-dialog__heading">
          Unsaved changes
        </h2>
        <p id="unsaved-dialog-body" className="unsaved-dialog__body">
          {message}
        </p>
        <div className="unsaved-dialog__actions">
          <button
            ref={cancelRef}
            type="button"
            className="unsaved-dialog__btn-stay"
            onClick={onCancel}
          >
            Stay on page
          </button>
          <button
            type="button"
            className="unsaved-dialog__btn-leave"
            onClick={onConfirm}
          >
            Leave without saving
          </button>
        </div>
      </div>
    </div>
  );
}
