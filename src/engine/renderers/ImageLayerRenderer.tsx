import React from "react";
import { Img } from "remotion";
import type { ImageLayer } from "../timeline/SceneTypes";

type Props = {
  layer: ImageLayer;
};

export const ImageLayerRenderer: React.FC<Props> = ({ layer }) => {
  if (layer.visible === false) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: layer.x,
        top: layer.y,
        width: layer.width,
        height: layer.height,
        opacity: layer.opacity ?? 1,
        overflow: "hidden",
      }}
    >
      <Img
        src={layer.src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: layer.fit ?? "cover",
        }}
      />
    </div>
  );
};
