# Multi-Resolution Geographic Datasets

All geographic datasets are registered independently.

## Supported levels

- world: global geographic data
- country: national boundaries
- province: administrative subdivisions
- island: island geometry
- historical: historical territories and borders

## Resolution

The resolution value is used to rank datasets within the same level.
Higher values indicate a more detailed dataset.

## Rules

1. Never invent missing geographic geometry.
2. Prefer the most detailed matching dataset.
3. Keep source attribution with each dataset.
4. Never modify original geographic data during rendering.
5. Add datasets through DatasetRegistry.
