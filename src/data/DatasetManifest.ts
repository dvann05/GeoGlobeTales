import type { DatasetLevel } from "./DatasetRegistry";

export type DatasetManifestEntry = {
  id: string;
  name: string;
  file: string;
  format: "geojson" | "topojson";
  level: DatasetLevel;
  resolution: number;
  source: string;
  license: string;
  attribution: string;
  coverage: string[];
  objectName?: string;
};

export const DATASET_MANIFEST: DatasetManifestEntry[] = [
  {
    id: "world-countries-110m",
    name: "World Countries 110m",
    file: "world-atlas/countries-110m.json",
    format: "topojson",
    level: "world",
    resolution: 1,
    source: "Natural Earth via world-atlas",
    license: "Public domain source data; verify package attribution",
    attribution: "Natural Earth / world-atlas",
    coverage: ["world"],
    objectName: "countries",
  },
];
