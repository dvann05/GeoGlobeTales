import type { SubtitleCue } from "../subtitles/SubtitleTypes";
export type AudioKind =
  | "narration"
  | "music"
  | "sound-effect";

export type NarrationMetadata = {
  text: string;
  language?: string;
  voiceId?: string;
  provider?: string;
  alignment?: "manual" | "provider";
  subtitles?: SubtitleCue[];
};

export type AudioLayerConfig = {
  kind?: AudioKind;
  startAtSeconds?: number;
  durationSeconds?: number;
  fadeInSeconds?: number;
  fadeOutSeconds?: number;
  playbackRate?: number;
  narration?: NarrationMetadata;
};

export type TTSRequest = {
  text: string;
  language: string;
  voiceId?: string;
  speed?: number;
  format?: "mp3" | "wav" | "ogg";
};

export type TTSResult = {
  audioPath: string;
  durationSeconds?: number;
  provider: string;
  voiceId?: string;
  format: string;
};

export type TTSVoice = {
  id: string;
  name: string;
  language: string;
  gender?: string;
  description?: string;
};

export interface TTSProvider {
  readonly id: string;
  readonly name: string;

  getVoices?(): Promise<TTSVoice[]>;

  synthesize(request: TTSRequest): Promise<TTSResult>;
}
