"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { Icon } from "@/components/icon";

type CopyState = "idle" | "copied" | "error";

type CopyButtonVariant = "icon" | "inline";
type CopyButtonSize = "sm" | "md";

interface CopyButtonProps {
  value: string;
  label?: string;
  copiedLabel?: string;
  errorLabel?: string;
  variant?: CopyButtonVariant;
  size?: CopyButtonSize;
  className?: string;
  feedbackDurationMs?: number;
  disabled?: boolean;
}

async function writeToClipboard(value: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  if (typeof document === "undefined") {
    throw new Error("Clipboard is not available");
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "absolute";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    const ok = document.execCommand("copy");
    if (!ok) {
      throw new Error("Copy command was rejected");
    }
  } finally {
    document.body.removeChild(textarea);
  }
}

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  errorLabel = "Copy failed",
  variant = "icon",
  size = "md",
  className,
  feedbackDurationMs = 1800,
  disabled,
}: CopyButtonProps) {
  const [state, setState] = useState<CopyState>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const isEmpty = value.trim().length === 0;
  const isDisabled = Boolean(disabled) || isEmpty;

  const handleCopy = useCallback(async () => {
    if (isDisabled) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      await writeToClipboard(value);
      setState("copied");
    } catch {
      setState("error");
    }

    timeoutRef.current = setTimeout(() => {
      setState("idle");
    }, feedbackDurationMs);
  }, [feedbackDurationMs, isDisabled, value]);

  const buttonLabel =
    state === "copied" ? copiedLabel : state === "error" ? errorLabel : label;

  const stateClass =
    state === "copied"
      ? "copy-button--copied"
      : state === "error"
        ? "copy-button--error"
        : "";

  const variantClass =
    variant === "inline" ? "copy-button--inline" : "copy-button--icon";

  const sizeClass = size === "sm" ? "copy-button--sm" : "copy-button--md";

  const tone =
    state === "copied" ? "success" : state === "error" ? "danger" : "muted";

  return (
    <button
      type="button"
      className={`copy-button ${variantClass} ${sizeClass} ${stateClass} ${className ?? ""}`.trim()}
      onClick={handleCopy}
      disabled={isDisabled}
      aria-label={isEmpty ? "Nothing to copy" : buttonLabel}
      aria-live="polite"
      data-state={state}
    >
      <Icon
        name={state === "copied" ? "check" : "copy"}
        size={size === "sm" ? "sm" : "sm"}
        tone={tone}
      />
      {variant === "inline" && (
        <span className="copy-button__label">{buttonLabel}</span>
      )}
    </button>
  );
}
