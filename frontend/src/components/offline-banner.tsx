"use client";

import React, { useEffect, useRef, useState } from "react";

type OfflineState = "online" | "offline" | "restored";

/**
 * Displays a fixed top banner when the user loses network connectivity.
 *
 * - Shows a dark "You're offline" banner when `navigator.onLine === false`.
 * - Shows a brief green "Back online" banner for 3 s when connectivity is restored.
 * - Dismissible by the user (restores on next offline event).
 * - Uses `aria-live="assertive"` for the offline message so screen readers
 *   announce it immediately; `"polite"` for the restoration message.
 * - Pushes page content down by adding `padding-top` to `<body>` so the
 *   banner doesn't overlap sticky headers.
 */
export function OfflineBanner() {
  const [state, setState] = useState<OfflineState>("online");
  const [dismissed, setDismissed] = useState(false);
  const restoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Initialise from current status
    if (!navigator.onLine) {
      setState("offline");
    }

    const handleOffline = () => {
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
      setState("offline");
      setDismissed(false);
    };

    const handleOnline = () => {
      setState("restored");
      setDismissed(false);
      restoreTimerRef.current = setTimeout(() => setState("online"), 3000);
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
    };
  }, []);

  const isVisible = !dismissed && state !== "online";

  // Push body content down while banner is visible
  useEffect(() => {
    const banner = document.getElementById("offline-banner");
    const height = banner?.offsetHeight ?? 0;
    document.body.style.paddingTop = isVisible ? `${height}px` : "";
    return () => {
      document.body.style.paddingTop = "";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const isOffline = state === "offline";

  return (
    <div
      id="offline-banner"
      role="status"
      aria-live={isOffline ? "assertive" : "polite"}
      aria-atomic="true"
      aria-label={isOffline ? "You are offline" : "Connection restored"}
      className={`offline-banner${state === "restored" ? " offline-banner--restored" : ""}`}
    >
      <span className="offline-banner__dot" aria-hidden="true" />
      <span>
        {isOffline
          ? "You're offline — some actions are unavailable."
          : "Connection restored."}
      </span>
      {isOffline && (
        <button
          type="button"
          className="offline-banner__dismiss"
          aria-label="Dismiss offline notification"
          onClick={() => setDismissed(true)}
        >
          ×
        </button>
      )}
    </div>
  );
}
