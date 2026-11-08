import React from "react";
import {
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";
import type { AudioLayer } from "../timeline/SceneTypes";
import { SubtitleRenderer } from "../subtitles/SubtitleRenderer";

type Props = {
  layer: AudioLayer;
  sceneDurationSeconds: number;
};

function resolveAudioSource(src: string): string {
  if (/^(https?:|data:|blob:)/i.test(src)) {
    return src;
  }

  return staticFile(src.replace(/^\/+/, ""));
}

export const AudioLayerRenderer: React.FC<Props> = ({
  layer,
  sceneDurationSeconds,
}) => {
  const { fps } = useVideoConfig();

  if (layer.visible === false) return null;

  const startFrame = Math.max(
    0,
    Math.round((layer.startAtSeconds ?? 0) * fps),
  );

  const sceneFrames = Math.round(sceneDurationSeconds * fps);
  const remainingFrames = sceneFrames - startFrame;

  if (remainingFrames <= 0) return null;

  const requestedFrames =
    layer.durationSeconds === undefined
      ? remainingFrames
      : Math.round(layer.durationSeconds * fps);

  const durationInFrames = Math.min(
    remainingFrames,
    Math.max(1, requestedFrames),
  );

  const fadeIn = Math.min(
    durationInFrames,
    Math.max(0, Math.round((layer.fadeInSeconds ?? 0) * fps)),
  );

  const fadeOut = Math.min(
    durationInFrames,
    Math.max(0, Math.round((layer.fadeOutSeconds ?? 0) * fps)),
  );

  const baseVolume = Math.max(
    0,
    Math.min(1, layer.volume ?? 1),
  );

  const playbackRate = Math.max(
    0.25,
    Math.min(4, layer.playbackRate ?? 1),
  );

  const subtitleCues = layer.narration?.subtitles ?? [];

  return (
    <Sequence
      from={startFrame}
      durationInFrames={durationInFrames}
      layout="none"
    >
      <>
        <Audio
          src={resolveAudioSource(layer.src)}
          playbackRate={playbackRate}
          volume={(frame) => {
            let multiplier = 1;

            if (fadeIn > 0 && frame < fadeIn) {
              multiplier = Math.min(multiplier, frame / fadeIn);
            }

            if (
              fadeOut > 0 &&
              frame > durationInFrames - fadeOut
            ) {
              multiplier = Math.min(
                multiplier,
                Math.max(
                  0,
                  (durationInFrames - frame) / fadeOut,
                ),
              );
            }

            return baseVolume * multiplier;
          }}
        />

        {layer.kind === "narration" &&
          layer.narration?.subtitles && (
            <SubtitleRenderer
              cues={subtitleCues}
            />
          )}
      </>
    </Sequence>
  );
};
