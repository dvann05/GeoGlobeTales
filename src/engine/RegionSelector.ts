import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Geometry,
} from "geojson";

export type RegionFeature = Feature<Geometry, GeoJsonProperties>;
export type RegionDataset = FeatureCollection<Geometry, GeoJsonProperties>;

export type RegionMatch = {
  query: string;
  matched: boolean;
  features: RegionFeature[];
  ids: string[];
  names: string[];
};

const PROPERTY_KEYS = [
  "name", "NAME", "Name", "name_en", "NAME_EN",
  "NAME_1", "NAME_2", "ADMIN", "admin",
  "PROVINSI", "province", "region", "REGION", "label",
];

export function normalizeRegionName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getFeatureNames(feature: RegionFeature): string[] {
  const properties = feature.properties ?? {};

  return PROPERTY_KEYS
    .map((key) => properties[key])
    .filter((value): value is string => typeof value === "string")
    .map(normalizeRegionName)
    .filter(Boolean);
}

export function resolveRegions(
  dataset: RegionDataset,
  queries: string[],
  aliases: Record<string, string[]> = {},
): RegionMatch[] {
  return queries.map((query) => {
    const normalizedQuery = normalizeRegionName(query);

    const alternativeNames = [
      query,
      ...(aliases[query] ?? []),
      ...(aliases[normalizedQuery] ?? []),
    ].map(normalizeRegionName);

    const features = dataset.features.filter((item) => {
      const names = getFeatureNames(item);
      return names.some((name) => alternativeNames.includes(name));
    });

    return {
      query,
      matched: features.length > 0,
      features,
      ids: features.map((item, index) =>
        String(item.id ?? item.properties?.id ?? index)
      ),
      names: features.map((item) => {
        const properties = item.properties ?? {};
        const name = PROPERTY_KEYS
          .map((key) => properties[key])
          .find((value) => typeof value === "string");

        return typeof name === "string" ? name : "Unknown";
      }),
    };
  });
}
