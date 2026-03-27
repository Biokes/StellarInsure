const en = {
  hero: {
    badge: "Accessible by default",
    title: "Automated insurance that remains readable, reachable, and ready for every user.",
    description:
      "StellarInsure delivers parametric coverage flows with keyboard-friendly navigation, screen-reader-aware structure, and localized product language from the first render.",
    primaryCta: "Explore coverage",
    secondaryCta: "Review workflow",
    metricsLabel: "Key metrics",
  },
  metrics: {
    processing: "Average automated payout review window",
    availability: "Policy visibility for multilingual customers",
    languages: "Languages available out of the box, including RTL",
  },
  coverage: {
    badge: "Coverage types",
    title: "Insurance experiences designed for clarity",
    description:
      "The frontend now centralizes copy in translation resources so every customer-facing section can be localized without duplicating layout logic.",
    cards: {
      weather: {
        title: "Weather protection",
        description: "Monitor rainfall and drought triggers with concise policy summaries.",
        bullets: [
          "Readable trigger descriptions for agricultural policyholders",
          "Accessible summaries for payout thresholds and claim windows",
        ],
      },
      flight: {
        title: "Flight delay cover",
        description: "Present journey protection terms with prominent alerts and action links.",
        bullets: [
          "Keyboard-first actions for policy lookup and claims",
          "Screen-reader-friendly status messaging for delay outcomes",
        ],
      },
      defi: {
        title: "DeFi risk cover",
        description: "Explain smart contract coverage in modular cards ready for new locales.",
        bullets: [
          "Consistent terminology across claims, payouts, and monitoring",
          "Bi-directional layout support for LTR and RTL languages",
        ],
      },
    },
  },
  workflow: {
    badge: "Workflow",
    title: "A frontend foundation that scales with product and compliance needs",
    description:
      "The new shell combines focus management, skip navigation, and reusable translation hooks so new screens can stay compliant without rebuilding accessibility basics.",
    userJourney: {
      title: "Customer journey",
      steps: [
        "Choose a policy type from a clearly labeled hero section.",
        "Navigate through coverage cards, workflow details, and action links by keyboard.",
        "Switch languages without losing orientation or text direction.",
      ],
    },
    accessibility: {
      title: "Accessibility controls",
      steps: [
        "Use the skip link to jump straight into the main content region.",
        "Track locale changes through a live region announcement.",
        "Keep navigation landmarks and headings consistent for screen readers.",
      ],
    },
  },
  languageSelector: {
    label: "Language selector",
    group: "Choose application language",
    english: "English",
    arabic: "Arabic",
    switched: "Language updated to English.",
  },
  maintenance: {
    badge: "Maintenance notice",
    regionLabel: "Platform maintenance notice",
    windowLabel: "Downtime window",
    windowFallback: "Downtime window will be confirmed soon.",
    status: {
      active: "Maintenance is currently active",
      scheduled: "Maintenance is scheduled",
    },
  },
} as const;

export default en;
