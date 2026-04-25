"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  // When the user prefers reduced motion, skip the CSS animation entirely by
  // omitting the `page-transition` class (which carries the keyframe animation).
  const className = prefersReducedMotion ? undefined : "page-transition";

  return (
    <div key={pathname} className={className}>
      {children}
    </div>
  );
}
