import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { SceneTransition as SceneTransitionConfig } from "../timeline/SceneTypes";

type Props = {
  transitionIn?: SceneTransitionConfig;
  transitionOut?: SceneTransitionConfig;
  durationInFrames: number;
  children: React.ReactNode;
};

function getProgress(
  frame: number,
  start: number,
  duration: number,
) {
  return interpolate(
    frame,
    [start, start + Math.max(1, duration)],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
}

export const SceneTransition: React.FC<Props> = ({
  transitionIn,
  transitionOut,
  durationInFrames,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const inFrames = Math.max(
    0,
    Math.round((transitionIn?.durationSeconds ?? 0) * fps),
  );

  const outFrames = Math.max(
    0,
    Math.round((transitionOut?.durationSeconds ?? 0) * fps),
  );

  const inProgress = transitionIn
    ? getProgress(frame, 0, inFrames)
    : 1;

  const outStart = Math.max(0, durationInFrames - outFrames);

  const outProgress = transitionOut
    ? getProgress(frame, outStart, outFrames)
    : 0;

  const opacityIn =
    transitionIn?.type === "fade" ? inProgress : 1;

  const opacityOut =
    transitionOut?.type === "fade" ? 1 - outProgress : 1;

  const opacity = opacityIn * opacityOut;

  let translateY = 0;
  let scale = 1;

  if (transitionIn?.type === "slide") {
    translateY += (1 - inProgress) * 100;
  }

  if (transitionOut?.type === "slide") {
    translateY -= outProgress * 100;
  }

  if (transitionIn?.type === "zoom") {
    scale *= 0.9 + inProgress * 0.1;
  }

  if (transitionOut?.type === "zoom") {
    scale *= 1 - outProgress * 0.1;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        transformOrigin: "center center",
      }}
    >
      {children}
    </div>
  );
};
