import React from "react";
import { GeographicMap } from "../engine/GeographicMap";
import { worldDataset } from "../data/world";
import { resolveRegions } from "../engine/RegionSelector";
import { REGION_ALIASES } from "../data/regions/aliases";

const selectedRegions = resolveRegions(
  worldDataset.features,
  ["Indonesia"],
  REGION_ALIASES
);

export const WorldMapDemo: React.FC = () => {
  const selectedIds = selectedRegions.flatMap(
    (region) => region.ids
  );

  return (
    <GeographicMap
      data={worldDataset.features}
      projection="naturalEarth"
      width={1080}
      height={1350}
      highlightIds={selectedIds}
      highlightColor="#F07A1E"
      backgroundColor="#071827"
      animate
    />
  );
};
