import React from "react";
import type {
  ProjectConfig,
  ResolvedScene,
  SceneLayer,
  MapLayer,
  TextLayer,
  ImageLayer,
  RouteLayer,
  MarkerLayer,
} from "../timeline/SceneTypes";
import { MapLayerRenderer } from "./MapLayerRenderer";
import { TextLayerRenderer } from "./TextLayerRenderer";
import { ImageLayerRenderer } from "./ImageLayerRenderer";

type Props = {
  scene: ResolvedScene;
  project: ProjectConfig;
};

const renderLayer = (
  layer: SceneLayer,
  scene: ResolvedScene,
  project: ProjectConfig,
) => {
  switch (layer.type) {
    case "map": {
      const routes = scene.layers.filter(
        (item): item is RouteLayer => item.type === "route",
      );
      const markers = scene.layers.filter(
        (item): item is MarkerLayer => item.type === "marker",
      );

      return (
        <MapLayerRenderer
          key={layer.id}
          layer={layer as MapLayer}
          routes={routes}
          markers={markers}
          canvasWidth={project.width}
          canvasHeight={project.height}
        />
      );
    }

    case "text":
      return (
        <TextLayerRenderer
          key={layer.id}
          layer={layer as TextLayer}
        />
      );

    case "image":
      return (
        <ImageLayerRenderer
          key={layer.id}
          layer={layer as ImageLayer}
        />
      );

    case "route":
    case "marker":
      // GeographicMap renders these over the map using the same projection.
      return null;

    case "audio":
    case "infographic":
    case "custom":
      // Dedicated audio and custom renderers will be connected in later stages.
      return null;

    default:
      return null;
  }
};

export const SceneRenderer: React.FC<Props> = ({
  scene,
  project,
}) => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        width: project.width,
        height: project.height,
        overflow: "hidden",
        backgroundColor: "#071827",
      }}
    >
      {scene.layers.map((layer) =>
        renderLayer(layer, scene, project),
      )}
    </div>
  );
};
