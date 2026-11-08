import type { AudioLayer } from "../timeline/SceneTypes";
import type { SubtitleCue } from "../subtitles/SubtitleTypes";

export type GeneratedNarration = {
  provider: string;
  language: string;
  voiceId: string;
  text: string;
  audioPath: string;
  format: string;
  durationSeconds: number;
  alignment: "estimated" | "manual" | "provider";
  subtitles: SubtitleCue[];
};

export type NarrationLayerOptions = {
  id?: string;
  startAtSeconds?: number;
  volume?: number;
  fadeInSeconds?: number;
  fadeOutSeconds?: number;
  playbackRate?: number;
};

export function createNarrationLayer(
  metadata: GeneratedNarration,
  options: NarrationLayerOptions = {},
): AudioLayer {
  if (!metadata.audioPath) {
    throw new Error("Narration audioPath belum tersedia.");
  }

  if (!Number.isFinite(metadata.durationSeconds) ||
      metadata.durationSeconds <= 0) {
    throw new Error("Durasi narasi tidak valid.");
  }

  return {
    id: options.id ?? "generated-narration",
    type: "audio",
    visible: true,
    src: metadata.audioPath,
    kind: "narration",
    startAtSeconds: options.startAtSeconds ?? 0,
    durationSeconds: metadata.durationSeconds,
    volume: options.volume ?? 1,
    fadeInSeconds: options.fadeInSeconds ?? 0.25,
    fadeOutSeconds: options.fadeOutSeconds ?? 0.4,
    playbackRate: options.playbackRate ?? 1,
    narration: {
      text: metadata.text,
      language: metadata.language,
      voiceId: metadata.voiceId,
      provider: metadata.provider,
      alignment: metadata.alignment === "estimated"
        ? "manual"
        : metadata.alignment,
      subtitles: metadata.subtitles,
    },
  } as AudioLayer;
}
