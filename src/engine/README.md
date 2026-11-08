# Geographic Engine

## Modules

- GeographicMap.tsx
  Universal SVG map renderer.

- RegionSelector.ts
  Resolves geographic features by their names.

## Design principles

- No country-specific assumptions in the renderer.
- Dataset geometry remains independent.
- Region selection supports multiple queries.
- Aliases are configurable.
- Map rendering and animation are separate from research and scripts.
- Missing regions must be reported, not silently substituted.
