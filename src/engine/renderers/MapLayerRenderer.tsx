import React from "react";
import { GeographicMap } from "../GeographicMap";
import type {
  MapLayer,
  RouteLayer,
  MarkerLayer,
} from "../timeline/SceneTypes";
import { datasetRegistry } from "../../data/datasets";

type Props = {
  layer: MapLayer;
  routes: RouteLayer[];
  markers: MarkerLayer[];
  canvasWidth: number;
  canvasHeight: number;
};

export const MapLayerRenderer: React.FC<Props> = ({
  layer,
  routes,
  markers,
  canvasWidth,
  canvasHeight,
}) => {
  const dataset = datasetRegistry.get(layer.datasetId);

  if (!dataset) {
    throw new Error(
      `Map layer "${layer.id}" references unknown dataset "${layer.datasetId}".`,
    );
  }

  const width = layer.width ?? canvasWidth;
  const height = layer.height ?? canvasHeight;

  const projection =
    layer.projection === "natural-earth"
      ? "naturalEarth"
      : layer.projection ?? "naturalEarth";

  return (
    <div
      style={{
        position: "absolute",
        left: layer.x ?? 0,
        top: layer.y ?? 0,
        width,
        height,
        opacity: layer.opacity ?? 1,
        display: layer.visible === false ? "none" : "block",
        overflow: "hidden",
      }}
    >
      <GeographicMap
        data={dataset.features}
        width={width}
        height={height}
        projection={projection}
        highlightIds={layer.highlightIds}
        highlightNames={layer.highlightNames}
        highlightColor={layer.highlightColor}
        cameraKeyframes={layer.cameraKeyframes}
        routes={routes.map((route) => ({
          id: route.id,
          coordinates: route.coordinates,
          color: route.color,
          strokeWidth: route.strokeWidth,
        }))}
        markers={markers.map((marker) => ({
          id: marker.id,
          longitude: marker.longitude,
          latitude: marker.latitude,
          label: marker.label,
          color: marker.color,
        }))}
      />
    </div>
  );
};
