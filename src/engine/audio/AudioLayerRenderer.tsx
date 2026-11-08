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
  if (/^https?:\/\//i.test(src)) return src;
  return staticFile(src.replace(/^\/+/, ""));
}

export const AudioLayerRenderer: React.FC<Props> = ({
  layer,
  sceneDurationSeconds,
}) => {
  const { fps } = useVideoConfig();

  if (layer.visible === false || !layer.src) return null;

  const startSeconds = Math.max(0, layer.startAtSeconds ?? 0);
  const availableSeconds = Math.max(
    0,
    sceneDurationSeconds - startSeconds,
  );

  const durationSeconds = Math.max(
    0,
    Math.min(layer.durationSeconds ?? availableSeconds, availableSeconds),
  );

  if (durationSeconds <= 0) return null;

  const startFrame = Math.round(startSeconds * fps);
  const durationInFrames = Math.max(1, Math.round(durationSeconds * fps));

  const fadeInFrames = Math.max(
    0,
    Math.round((layer.fadeInSeconds ?? 0) * fps),
  );

  const fadeOutFrames = Math.max(
    0,
    Math.round((layer.fadeOutSeconds ?? 0) * fps),
  );

  const baseVolume = Math.max(0, Math.min(1, layer.volume ?? 1));

  const volume = (frame: number) => {
    let multiplier = 1;

    if (fadeInFrames > 0 && frame < fadeInFrames) {
      multiplier = Math.min(multiplier, frame / fadeInFrames);
    }

    if (fadeOutFrames > 0) {
      const fadeOutStart = durationInFrames - fadeOutFrames;

      if (frame >= fadeOutStart) {
        multiplier = Math.min(
          multiplier,
          Math.max(0, (durationInFrames - frame) / fadeOutFrames),
        );
      }
    }

    return baseVolume * multiplier;
  };

  const subtitleCues =
    (layer.kind === "narration" || layer.narration) &&
    layer.narration?.subtitles
      ? layer.narration.subtitles
      : [];

  return (
    <Sequence
      from={startFrame}
      durationInFrames={durationInFrames}
      name={`Audio: ${layer.id}`}
    >
      <Audio
        src={resolveAudioSource(layer.src)}
        volume={volume}
        playbackRate={layer.playbackRate ?? 1}
      />

      {subtitleCues.length > 0 && (
        <SubtitleRenderer
          cues={subtitleCues}
        />
      )}
    </Sequence>
  );
};
