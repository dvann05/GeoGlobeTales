import React from "react";
import type { TextLayer } from "../timeline/SceneTypes";

type Props = {
  layer: TextLayer;
};

export const TextLayerRenderer: React.FC<Props> = ({ layer }) => {
  if (layer.visible === false) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: layer.x,
        top: layer.y,
        maxWidth: layer.maxWidth ?? "90%",
        color: layer.color ?? "#FFFFFF",
        fontSize: layer.fontSize ?? 40,
        fontFamily: layer.fontFamily ?? "Arial, sans-serif",
        fontWeight: layer.fontWeight ?? 600,
        textAlign: layer.textAlign ?? "left",
        lineHeight: 1.2,
        whiteSpace: "pre-wrap",
        opacity: layer.opacity ?? 1,
        transform:
          layer.textAlign === "center"
            ? "translateX(-50%)"
            : layer.textAlign === "right"
              ? "translateX(-100%)"
              : undefined,
      }}
    >
      {layer.text}
    </div>
  );
};
