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
import { AnimatedLayer } from "../animation/AnimatedLayer";
import { SceneTransition } from "../animation/SceneTransition";

type Props = {
  scene: ResolvedScene;
  project: ProjectConfig;
};

const renderLayer = (
  layer: SceneLayer,
  scene: ResolvedScene,
  project: ProjectConfig,
): React.ReactNode => {
  if (layer.visible === false) return null;

  let content: React.ReactNode = null;

  switch (layer.type) {
    case "map": {
      const routes = scene.layers.filter(
        (item): item is RouteLayer => item.type === "route",
      );

      const markers = scene.layers.filter(
        (item): item is MarkerLayer => item.type === "marker",
      );

      content = (
        <MapLayerRenderer
          layer={layer as MapLayer}
          routes={routes}
          markers={markers}
          canvasWidth={project.width}
          canvasHeight={project.height}
        />
      );
      break;
    }

    case "text":
      content = (
        <TextLayerRenderer layer={layer as TextLayer} />
      );
      break;

    case "image":
      content = (
        <ImageLayerRenderer layer={layer as ImageLayer} />
      );
      break;

    case "route":
    case "marker":
    case "audio":
    case "infographic":
    case "custom":
      return null;

    default:
      return null;
  }

  return (
    <AnimatedLayer
      key={layer.id}
      animation={layer.animation}
    >
      {content}
    </AnimatedLayer>
  );
};

export const SceneRenderer: React.FC<Props> = ({
  scene,
  project,
}) => {
  return (
    <SceneTransition
      transitionIn={scene.transitionIn}
      transitionOut={scene.transitionOut}
      durationInFrames={scene.durationInFrames}
    >
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
    </SceneTransition>
  );
};
