import { useEffect, useState } from "react";

/**
 * Returns `true` when the user has requested reduced motion via their OS or
 * browser `prefers-reduced-motion: reduce` media query.
 *
 * Components can use this hook to:
 * - Skip enter/exit animations entirely.
 * - Replace duration-based transitions with instant state changes.
 * - Swap animated loaders for static spinners.
 *
 * @example
 * const prefersReducedMotion = useReducedMotion();
 * const duration = prefersReducedMotion ? 0 : 300;
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    // Use the modern `addEventListener` API with a fallback for older browsers
    if (mq.addEventListener) {
      mq.addEventListener("change", handler);
    } else {
      // Safari < 14
      mq.addListener(handler);
    }

    return () => {
      if (mq.removeEventListener) {
        mq.removeEventListener("change", handler);
      } else {
        mq.removeListener(handler);
      }
    };
  }, []);

  return prefersReducedMotion;
}
