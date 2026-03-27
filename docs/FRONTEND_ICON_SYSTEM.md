# Frontend Icon System

The frontend icon system is centered on the shared `Icon` wrapper in `frontend/src/components/icon.tsx`.

## Rules

1. Use the shared wrapper instead of inlining ad hoc SVG markup in pages and controls.
2. Pick semantic sizes: `sm` for inline metadata, `md` for controls and badges, `lg` for section summaries and empty states.
3. Pick semantic tones: `muted` for supporting copy, `accent` for product emphasis, `warning` and `danger` for disruptive states, `success` for approved or completed states, and `contrast` on dark surfaces.
4. Treat icons as decorative by default. Only pass `label` when the icon itself carries meaning that is not already in adjacent text.
5. Keep icon and text spacing consistent by pairing icons with existing layout utilities and tokens instead of hard-coded pixel offsets.

## Usage

```tsx
<Icon name="shield" size="md" tone="accent" />
<Icon name="alert" size="sm" tone="warning" label="Maintenance alert" />
```

## Recommended placements

- Banners, badges, empty states, and metadata rows.
- External-link affordances and disclosure buttons.
- Reusable card headers where the icon clarifies content category.
