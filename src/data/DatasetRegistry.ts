import type { FeatureCollection, Geometry } from "geojson";

export type DatasetLevel =
  | "world"
  | "country"
  | "province"
  | "island"
  | "historical";

export type GeographicDataset = {
  id: string;
  name: string;
  level: DatasetLevel;
  resolution: number;
  source: string;
  features: FeatureCollection<Geometry>;
  coverage?: string[];
};

export class DatasetRegistry {
  private datasets = new Map<string, GeographicDataset>();

  register(dataset: GeographicDataset): void {
    if (this.datasets.has(dataset.id)) {
      throw new Error(`Dataset already registered: ${dataset.id}`);
    }

    this.datasets.set(dataset.id, dataset);
  }

  get(id: string): GeographicDataset | undefined {
    return this.datasets.get(id);
  }

  getAll(): GeographicDataset[] {
    return Array.from(this.datasets.values());
  }

  getByLevel(level: DatasetLevel): GeographicDataset[] {
    return this.getAll().filter(
      (dataset) => dataset.level === level
    );
  }

  has(id: string): boolean {
    return this.datasets.has(id);
  }
}

export const datasetRegistry = new DatasetRegistry();
