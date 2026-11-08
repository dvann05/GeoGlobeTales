import React from "react";
import {
  Audio,
  Sequence,
  staticFile,
  useVideoConfig,
} from "remotion";

import type { AudioLayer } from "../timeline/SceneTypes";
import type { NarrationMetadata } from "./AudioTypes";
import { SubtitleRenderer } from "../subtitles/SubtitleRenderer";

type ExtendedAudioLayer = AudioLayer & {
  kind?: "narration" | "music" | "sound-effect";
  startAtSeconds?: number;
  startFromSeconds?: number;
  durationSeconds?: number;
  playbackRate?: number;
  narration?: NarrationMetadata;
};

type Props = {
  layer: AudioLayer;
  sceneDurationSeconds: number;
};

function resolveSource(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  return staticFile(src.replace(/^\/+/, ""));
}

export const AudioLayerRenderer: React.FC<Props> = ({
  layer,
  sceneDurationSeconds,
}) => {
  const { fps } = useVideoConfig();
  const audio = layer as ExtendedAudioLayer;

  if (audio.visible === false || !audio.src) return null;

  const start = Math.max(0, audio.startAtSeconds ?? 0);
  const available = Math.max(0, sceneDurationSeconds - start);
  const duration = Math.min(
    audio.durationSeconds ?? available,
    available,
  );

  if (!Number.isFinite(duration) || duration <= 0) return null;

  const durationInFrames = Math.max(1, Math.round(duration * fps));
  const startFrame = Math.round(start * fps);
  const sourceStartFrame = Math.round(
    (audio.startFromSeconds ?? 0) * fps,
  );

  const fadeIn = Math.round((audio.fadeInSeconds ?? 0) * fps);
  const fadeOut = Math.round((audio.fadeOutSeconds ?? 0) * fps);
  const baseVolume = Math.max(0, Math.min(1, audio.volume ?? 1));

  const volume = (frame: number) => {
    let factor = 1;

    if (fadeIn > 0 && frame < fadeIn) {
      factor = Math.min(factor, frame / fadeIn);
    }

    if (fadeOut > 0 && frame >= durationInFrames - fadeOut) {
      factor = Math.min(
        factor,
        Math.max(0, (durationInFrames - frame) / fadeOut),
      );
    }

    return baseVolume * factor;
  };

  const subtitles = audio.narration?.subtitles ?? [];

  return (
    <Sequence
      from={startFrame}
      durationInFrames={durationInFrames}
      name={`Audio: ${audio.id}`}
    >
      <Audio
        src={resolveSource(audio.src)}
        startFrom={sourceStartFrame}
        volume={volume}
        playbackRate={audio.playbackRate ?? 1}
      />

      {subtitles.length > 0 && (
        <SubtitleRenderer cues={subtitles} />
      )}
    </Sequence>
  );
};
