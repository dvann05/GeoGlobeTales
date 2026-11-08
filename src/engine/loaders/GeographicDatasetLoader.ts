import { feature as topojsonFeature } from "topojson-client";
import type { Topology, GeometryObject } from "topojson-specification";
import type {
  Feature,
  FeatureCollection,
  Geometry,
} from "geojson";

import {
  datasetRegistry,
  type GeographicDataset,
  type DatasetLevel,
} from "../../data/DatasetRegistry";

type DatasetMetadata = {
  id: string;
  name: string;
  level: DatasetLevel;
  resolution: number;
  source: string;
  license?: string;
  attribution?: string;
  coverage?: string[];
};

type LoadedDataset = {
  metadata: DatasetMetadata;
  features: FeatureCollection<Geometry>;
};

const VALID_LEVELS: DatasetLevel[] = [
  "world",
  "country",
  "province",
  "island",
  "historical",
];

const VALID_GEOMETRIES = new Set([
  "Point",
  "MultiPoint",
  "LineString",
  "MultiLineString",
  "Polygon",
  "MultiPolygon",
  "GeometryCollection",
]);

function isObject(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null;
}

function validateMetadata(metadata: DatasetMetadata): void {
  if (!metadata.id?.trim()) {
    throw new Error("Dataset ID wajib diisi.");
  }

  if (!metadata.name?.trim()) {
    throw new Error("Dataset name wajib diisi.");
  }

  if (!VALID_LEVELS.includes(metadata.level)) {
    throw new Error("Dataset level tidak valid.");
  }

  if (
    !Number.isFinite(metadata.resolution) ||
    metadata.resolution <= 0
  ) {
    throw new Error("Resolution harus berupa angka positif.");
  }

  if (!metadata.source?.trim()) {
    throw new Error("Sumber dataset wajib dicantumkan.");
  }
}

function validateGeometry(geometry: unknown): boolean {
  if (!isObject(geometry)) return false;

  if (!VALID_GEOMETRIES.has(geometry.type)) return false;

  if (geometry.type === "GeometryCollection") {
    return (
      Array.isArray(geometry.geometries) &&
      geometry.geometries.every(validateGeometry)
    );
  }

  return geometry.coordinates !== undefined;
}

function normalizeGeoJSON(input: unknown): FeatureCollection<Geometry> {
  if (!isObject(input) || input.type !== "FeatureCollection") {
    throw new Error("Format bukan GeoJSON FeatureCollection.");
  }

  if (!Array.isArray(input.features) || input.features.length === 0) {
    throw new Error("Dataset tidak memiliki features.");
  }

  const features = input.features.map((item, index) => {
    if (!isObject(item) || item.type !== "Feature") {
      throw new Error(`Feature pada indeks ${index} tidak valid.`);
    }

    if (!validateGeometry(item.geometry)) {
      throw new Error(`Geometri pada indeks ${index} tidak valid.`);
    }

    if (
      item.properties !== null &&
      item.properties !== undefined &&
      !isObject(item.properties)
    ) {
      throw new Error(`Properties pada indeks ${index} tidak valid.`);
    }

    return item as Feature<Geometry>;
  });

  return {
    type: "FeatureCollection",
    features,
  };
}

function normalizeTopoJSON(
  input: unknown,
  objectName?: string
): FeatureCollection<Geometry> {
  if (!isObject(input) || input.type !== "Topology") {
    throw new Error("Format bukan TopoJSON Topology.");
  }

  if (!isObject(input.objects)) {
    throw new Error("TopoJSON tidak memiliki objects.");
  }

  const topology = input as unknown as Topology;
  const names = Object.keys(topology.objects);

  const selectedName = objectName ?? names[0];

  if (!selectedName || !topology.objects[selectedName]) {
    throw new Error("Objek TopoJSON yang diminta tidak ditemukan.");
  }

  const result = topojsonFeature(
    topology,
    topology.objects[selectedName] as GeometryObject
  );

  const collection =
    result.type === "FeatureCollection"
      ? result
      : {
          type: "FeatureCollection" as const,
          features: [result],
        };

  return normalizeGeoJSON(collection);
}

export function loadGeographicDataset(
  input: unknown,
  metadata: DatasetMetadata,
  options: { objectName?: string } = {}
): LoadedDataset {
  validateMetadata(metadata);

  if (!isObject(input)) {
    throw new Error("Dataset harus berupa objek JSON.");
  }

  let features: FeatureCollection<Geometry>;

  if (input.type === "FeatureCollection") {
    features = normalizeGeoJSON(input);
  } else if (input.type === "Topology") {
    features = normalizeTopoJSON(input, options.objectName);
  } else {
    throw new Error("Format dataset tidak didukung.");
  }

  return {
    metadata,
    features,
  };
}

export function registerLoadedDataset(
  loaded: LoadedDataset
): GeographicDataset {
  if (datasetRegistry.has(loaded.metadata.id)) {
    throw new Error(
      `Dataset ID sudah terdaftar: ${loaded.metadata.id}`
    );
  }

  const dataset: GeographicDataset = {
    ...loaded.metadata,
    features: loaded.features,
  };

  datasetRegistry.register(dataset);

  return dataset;
}

export function importGeographicDataset(
  input: unknown,
  metadata: DatasetMetadata,
  options: { objectName?: string } = {}
): GeographicDataset {
  const loaded = loadGeographicDataset(
    input,
    metadata,
    options
  );

  return registerLoadedDataset(loaded);
}
