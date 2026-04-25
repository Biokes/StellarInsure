"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export interface UnsavedGuardOptions {
  /** Message shown in the confirmation dialog. */
  message?: string;
  /** Whether to also block browser tab-close / reload (beforeunload). Default: true. */
  blockUnload?: boolean;
}

export interface UnsavedGuardResult {
  /** Call this when form state changes so the guard knows unsaved changes exist. */
  markDirty: () => void;
  /** Call this after a successful save or deliberate discard. */
  markClean: () => void;
  /** Whether the confirmation dialog is currently open. */
  isDialogOpen: boolean;
  /** Confirm navigation (leave without saving). */
  confirmLeave: () => void;
  /** Cancel navigation (stay on the page). */
  cancelLeave: () => void;
  /** Whether the form currently has unsaved changes. */
  isDirty: boolean;
}

/**
 * Route guard that warns users before navigating away with unsaved form changes.
 *
 * Usage:
 * ```tsx
 * const { markDirty, markClean, isDialogOpen, confirmLeave, cancelLeave } =
 *   useUnsavedGuard();
 *
 * // In your form's onChange:
 * markDirty();
 *
 * // After successful submit:
 * markClean();
 * router.push('/policies');
 * ```
 *
 * The hook intercepts `router.push` / `router.replace` calls via a custom wrapper
 * and the native `beforeunload` event for tab-close protection.
 */
export function useUnsavedGuard({
  message = "You have unsaved changes. Are you sure you want to leave?",
  blockUnload = true,
}: UnsavedGuardOptions = {}): UnsavedGuardResult {
  const [isDirty, setIsDirty] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const pendingUrlRef = useRef<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Reset dirty state on route change (navigation completed)
  useEffect(() => {
    setIsDirty(false);
    setIsDialogOpen(false);
    pendingUrlRef.current = null;
  }, [pathname]);

  // Block browser tab-close / page reload when dirty
  useEffect(() => {
    if (!isDirty || !blockUnload) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore the string but require returnValue to be set
      e.returnValue = message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, blockUnload, message]);

  const markDirty = useCallback(() => setIsDirty(true), []);
  const markClean = useCallback(() => {
    setIsDirty(false);
    setIsDialogOpen(false);
    pendingUrlRef.current = null;
  }, []);

  /**
   * Intercepts a navigation attempt. Call this instead of `router.push` when
   * the form may have unsaved changes.
   */
  const guardedNavigate = useCallback(
    (href: string) => {
      if (!isDirty) {
        router.push(href);
        return;
      }
      pendingUrlRef.current = href;
      setIsDialogOpen(true);
    },
    [isDirty, router],
  );

  const confirmLeave = useCallback(() => {
    setIsDirty(false);
    setIsDialogOpen(false);
    const url = pendingUrlRef.current;
    pendingUrlRef.current = null;
    if (url) router.push(url);
  }, [router]);

  const cancelLeave = useCallback(() => {
    setIsDialogOpen(false);
    pendingUrlRef.current = null;
  }, []);

  return {
    markDirty,
    markClean,
    isDialogOpen,
    confirmLeave,
    cancelLeave,
    isDirty,
    // Expose guardedNavigate as an extra utility
    ...(({ guardedNavigate }) => ({ guardedNavigate }) as any)({ guardedNavigate }),
  };
}
