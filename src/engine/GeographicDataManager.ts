import type { DatasetLevel, GeographicDataset } from "../data/DatasetRegistry";
import { datasetRegistry } from "../data/datasets";
import { resolveRegions } from "./RegionSelector";
import { REGION_ALIASES } from "../data/regions/aliases";

export type GeographicSearchResult = {
  query: string;
  found: boolean;
  dataset?: {
    id: string;
    name: string;
    level: DatasetLevel;
    resolution: number;
    source: string;
  };
  features: ReturnType<typeof resolveRegions>[number]["features"];
  names: string[];
  ids: string[];
  message: string;
};

type SearchOptions = {
  level?: DatasetLevel;
  datasetIds?: string[];
  minimumResolution?: number;
};

const LEVEL_PRIORITY: Record<DatasetLevel, number> = {
  world: 1,
  country: 2,
  province: 3,
  island: 4,
  historical: 5,
};

export class GeographicDataManager {
  search(
    query: string,
    options: SearchOptions = {}
  ): GeographicSearchResult {
    let datasets = datasetRegistry.getAll();

    if (options.level) {
      datasets = datasets.filter(
        (item) => item.level === options.level
      );
    }

    if (options.datasetIds?.length) {
      datasets = datasets.filter(
        (item) => options.datasetIds!.includes(item.id)
      );
    }

    if (options.minimumResolution !== undefined) {
      datasets = datasets.filter(
        (item) => item.resolution >= options.minimumResolution!
      );
    }

    // Prioritaskan dataset yang lebih detail.
    datasets.sort((a, b) =>
      LEVEL_PRIORITY[b.level] - LEVEL_PRIORITY[a.level] ||
      b.resolution - a.resolution
    );

    for (const dataset of datasets) {
      const matches = resolveRegions(
        dataset.features,
        [query],
        REGION_ALIASES
      );

      const result = matches[0];

      if (result?.matched) {
        return {
          query,
          found: true,
          dataset: {
            id: dataset.id,
            name: dataset.name,
            level: dataset.level,
            resolution: dataset.resolution,
            source: dataset.source,
          },
          features: result.features,
          names: result.names,
          ids: result.ids,
          message: `Wilayah ditemukan pada dataset ${dataset.name}.`,
        };
      }
    }

    return {
      query,
      found: false,
      features: [],
      names: [],
      ids: [],
      message: `Data wilayah "${query}" belum tersedia dalam dataset terdaftar.`,
    };
  }

  getAvailableDatasets(): GeographicDataset[] {
    return datasetRegistry.getAll();
  }

  getDatasetLevels(): DatasetLevel[] {
    return [
      "world",
      "country",
      "province",
      "island",
      "historical",
    ];
  }
}

export const geographicDataManager =
  new GeographicDataManager();
