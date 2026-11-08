import type { GeographicDataset } from "../../data/DatasetRegistry";

export function createDatasetReport(
  dataset: GeographicDataset
) {
  const geometryTypes: Record<string, number> = {};

  for (const item of dataset.features.features) {
    const type = item.geometry?.type ?? "Unknown";

    geometryTypes[type] = (geometryTypes[type] ?? 0) + 1;
  }

  return {
    id: dataset.id,
    name: dataset.name,
    level: dataset.level,
    source: dataset.source,
    resolution: dataset.resolution,
    totalFeatures: dataset.features.features.length,
    geometryTypes,
    coverage: dataset.coverage ?? [],
  };
}
