import { feature } from "topojson-client";
import worldAtlas from "world-atlas/countries-110m.json";
import type { FeatureCollection } from "geojson";

const topology = worldAtlas as any;

export const worldCountries = feature(
  topology,
  topology.objects.countries
) as FeatureCollection;

export const worldDataset = {
  id: "world-countries",
  name: "World Countries",
  source: "Natural Earth via world-atlas",
  features: worldCountries,
};
