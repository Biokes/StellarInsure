"use client";

import React, { useEffect, useState } from "react";

import { Icon, type IconName } from "./icon";

const ONBOARDING_KEY = "stellarinsure-onboarded";

interface Step {
  id: string;
  icon: IconName;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    id: "welcome",
    icon: "spark",
    title: "Welcome to StellarInsure",
    description:
      "Parametric insurance on the Stellar blockchain. Policies trigger and pay out automatically, with no claims agents, paperwork, or unnecessary delays.",
  },
  {
    id: "wallet",
    title: "Connect Your Stellar Wallet",
    icon: "wallet",
    description:
      "StellarInsure uses your Stellar public key as your identity. Connect a compatible wallet such as Freighter, Lobstr, or xBull to sign in securely. Your private key never leaves your device.",
  },
  {
    id: "policy-types",
    icon: "shield",
    title: "Choose Your Coverage",
    description:
      "We offer five policy types: Weather, Flight Delay, DeFi Risk, Health, and Asset Protection. Each policy defines a coverage amount and trigger condition evaluated automatically on-chain.",
  },
  {
    id: "first-policy",
    icon: "document",
    title: "Create Your First Policy",
    description:
      "Head to the Coverage section, pick a policy type, set your coverage amount and premium, then confirm on-chain. Once active, your policy monitors conditions automatically and pays out when a trigger is verified.",
  },
];

interface OnboardingProps {
  onComplete?: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const alreadySeen = localStorage.getItem(ONBOARDING_KEY);
    if (!alreadySeen) {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setVisible(false);
    onComplete?.();
  }

  function next() {
    if (step < STEPS.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep((s) => s + 1);
        setAnimating(false);
      }, 180);
    } else {
      dismiss();
    }
  }

  function prev() {
    if (step > 0) {
      setAnimating(true);
      setTimeout(() => {
        setStep((s) => s - 1);
        setAnimating(false);
      }, 180);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
    if (e.key === "Escape") dismiss();
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div
      className="ob-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ob-title"
      aria-describedby="ob-desc"
      onKeyDown={handleKeyDown}
    >
      <div className="ob-modal">
        <button
          id="ob-skip"
          className="ob-skip"
          onClick={dismiss}
          aria-label="Skip onboarding"
        >
          Skip
        </button>

        <div className="ob-progress" role="tablist" aria-label="Onboarding steps">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={i === step}
              aria-label={`Step ${i + 1}: ${s.title}`}
              className={`ob-dot ${i === step ? "ob-dot--active" : ""} ${
                i < step ? "ob-dot--done" : ""
              }`}
              onClick={() => setStep(i)}
            />
          ))}
        </div>

        <div
          className={`ob-content ${animating ? "ob-content--fade" : ""}`}
          aria-live="polite"
        >
          <div className="ob-icon" aria-hidden="true">
            <Icon name={current.icon} size="lg" tone="accent" />
          </div>
          <h2 id="ob-title" className="ob-title">
            {current.title}
          </h2>
          <p id="ob-desc" className="ob-desc">
            {current.description}
          </p>
        </div>

        <div className="ob-nav">
          <button
            className="ob-btn ob-btn--ghost"
            onClick={prev}
            disabled={step === 0}
            aria-label="Previous step"
          >
            Back
          </button>

          <span className="ob-step-counter" aria-label={`Step ${step + 1} of ${STEPS.length}`}>
            {step + 1} / {STEPS.length}
          </span>

          <button
            className="ob-btn ob-btn--primary"
            onClick={next}
            aria-label={isLast ? "Complete onboarding" : "Next step"}
            autoFocus
          >
            {isLast ? "Get Started" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useOnboarding() {
  const [completed, setCompleted] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(ONBOARDING_KEY);
    setCompleted(!!seen);
  }, []);

  return {
    completed,
    reset: () => {
      localStorage.removeItem(ONBOARDING_KEY);
      setCompleted(false);
    },
  };
}
