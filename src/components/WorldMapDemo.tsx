import React from "react";
import { GeographicMap } from "../engine/GeographicMap";
import { worldDataset } from "../data/world";

export const WorldMapDemo: React.FC = () => {
  return (
    <GeographicMap
      data={worldDataset.features}
      projection="naturalEarth"
      width={1080}
      height={1350}
      backgroundColor="#071827"
      landColor="#526B78"
      highlightColor="#F07A1E"
      highlightIds={["360"]}
      animate={true}
    />
  );
};
