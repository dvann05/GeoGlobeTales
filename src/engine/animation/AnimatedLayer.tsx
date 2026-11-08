import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { LayerAnimation } from "./AnimationTypes";

type Props = {
  animation?: LayerAnimation;
  children: React.ReactNode;
};

export const AnimatedLayer: React.FC<Props> = ({
  animation,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (!animation || animation.type === "none") {
    return <>{children}</>;
  }

  const delay = Math.max(
    0,
    Math.round((animation.delaySeconds ?? 0) * fps),
  );

  const duration = Math.max(
    1,
    Math.round((animation.durationSeconds ?? 0.8) * fps),
  );

  const progress = interpolate(
    frame,
    [delay, delay + duration],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  let opacity = 1;
  let transform = "";

  switch (animation.type) {
    case "fade":
      opacity = progress;
      break;

    case "slide-up":
      transform = `translateY(${(1 - progress) * 80}px)`;
      opacity = progress;
      break;

    case "slide-down":
      transform = `translateY(${(progress - 1) * 80}px)`;
      opacity = progress;
      break;

    case "slide-left":
      transform = `translateX(${(1 - progress) * 100}px)`;
      opacity = progress;
      break;

    case "slide-right":
      transform = `translateX(${(progress - 1) * 100}px)`;
      opacity = progress;
      break;

    case "zoom-in": {
      const scale = 0.65 + progress * 0.35;
      transform = `scale(${scale})`;
      opacity = progress;
      break;
    }

    case "zoom-out": {
      const scale = 1.25 - progress * 0.25;
      transform = `scale(${scale})`;
      opacity = progress;
      break;
    }

    case "pop": {
      const scale = interpolate(
        progress,
        [0, 0.65, 1],
        [0.5, 1.08, 1],
      );
      transform = `scale(${scale})`;
      opacity = progress;
      break;
    }
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        opacity,
        transform: transform || undefined,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
};
