# Geographic Data Imports

This directory is reserved for imported geographic datasets.

Supported formats:
- GeoJSON FeatureCollection
- TopoJSON Topology

Every imported dataset must include:
- Unique ID
- Name
- Geographic level
- Resolution
- Source
- License
- Attribution

Import pipeline:
1. Read the dataset.
2. Validate metadata.
3. Validate geometry.
4. Convert TopoJSON when necessary.
5. Register the dataset.
6. Generate a dataset report.

Never silently replace an existing dataset.
Never invent missing geographic geometry.
Keep original source files unchanged.
