import React from "react";

import { Icon, type IconName } from "./icon";

type FeatureCardProps = {
  title: string;
  description: string;
  bullets: string[];
  icon: IconName;
};

export function FeatureCard({
  title,
  description,
  bullets,
  icon,
}: FeatureCardProps) {
  return (
    <article className="feature-card">
      <div className="feature-card__header">
        <span className="feature-card__icon">
          <Icon name={icon} size="md" tone="accent" />
        </span>
        <h3>{title}</h3>
      </div>
      <p>{description}</p>
      <ul>
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </article>
  );
}
