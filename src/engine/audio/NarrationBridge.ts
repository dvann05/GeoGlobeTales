import type { AudioLayer, ProjectConfig } from "../timeline/SceneTypes";
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

export function attachNarrationToProject(
  project: ProjectConfig,
  metadata: GeneratedNarration,
): ProjectConfig {
  const totalDuration = project.scenes.reduce(
    (total, scene) => total + scene.durationSeconds,
    0,
  );

  if (!metadata.audioPath) {
    throw new Error("Narasi gagal: audioPath tidak tersedia.");
  }

  if (
    !Number.isFinite(metadata.durationSeconds) ||
    metadata.durationSeconds < totalDuration
  ) {
    throw new Error(
      `Durasi narasi ${metadata.durationSeconds}s lebih pendek dari timeline ${totalDuration}s.`,
    );
  }

  let elapsed = 0;

  const scenes = project.scenes.map((scene) => {
    const segmentStart = elapsed;
    const segmentEnd = Math.min(
      elapsed + scene.durationSeconds,
      metadata.durationSeconds,
    );

    elapsed += scene.durationSeconds;

    const segmentCues = metadata.subtitles
      .filter(
        (cue) =>
          cue.endSeconds > segmentStart &&
          cue.startSeconds < segmentEnd,
      )
      .map((cue) => ({
        ...cue,
        startSeconds: Math.max(0, cue.startSeconds - segmentStart),
        endSeconds: Math.min(
          segmentEnd - segmentStart,
          cue.endSeconds - segmentStart,
        ),
      }))
      .filter((cue) => cue.endSeconds > cue.startSeconds);

    const narrationLayer = {
      id: `narration-${scene.id}`,
      type: "audio",
      visible: true,
      opacity: 1,
      src: metadata.audioPath,
      kind: "narration",
      startAtSeconds: 0,
      startFromSeconds: segmentStart,
      durationSeconds: segmentEnd - segmentStart,
      volume: 1,
      fadeInSeconds: 0,
      fadeOutSeconds: 0,
      playbackRate: 1,
      narration: {
        text: metadata.text,
        language: metadata.language,
        voiceId: metadata.voiceId,
        provider: metadata.provider,
        alignment: metadata.alignment,
        subtitles: segmentCues,
      },
    } as unknown as AudioLayer;

    return {
      ...scene,
      layers: [
        ...scene.layers.filter(
          (layer) => layer.id !== narrationLayer.id,
        ),
        narrationLayer,
      ],
    };
  });

  return {
    ...project,
    scenes,
  };
}
