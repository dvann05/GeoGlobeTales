import type {
  AudioLayer,
  MapLayer,
  ProjectConfig,
  SceneConfig,
  SceneLayer,
  TextLayer,
} from "../timeline/SceneTypes";
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

const TARGET_SHOT_SECONDS = 3.8;
const MIN_SHOT_SECONDS = 2.4;
const MAX_SHOT_SECONDS = 5.2;

type Shot = {
  start: number;
  end: number;
  cues: SubtitleCue[];
};

function splitNarrationIntoShots(
  durationSeconds: number,
  subtitles: SubtitleCue[],
): Shot[] {
  const sorted = [...subtitles].sort(
    (a, b) => a.startSeconds - b.startSeconds,
  );

  const shots: Shot[] = [];
  let start = 0;

  while (start < durationSeconds - 0.001) {
    const idealEnd = Math.min(
      durationSeconds,
      start + TARGET_SHOT_SECONDS,
    );

    const minimumEnd = Math.min(
      durationSeconds,
      start + MIN_SHOT_SECONDS,
    );

    const maximumEnd = Math.min(
      durationSeconds,
      start + MAX_SHOT_SECONDS,
    );

    const boundary = sorted.find(
      (cue) =>
        cue.endSeconds >= minimumEnd &&
        cue.endSeconds <= maximumEnd &&
        cue.endSeconds >= idealEnd - 0.9,
    )?.endSeconds;

    const end = Math.min(
      durationSeconds,
      Math.max(start + 0.1, boundary ?? idealEnd),
    );

    const cues = sorted
      .filter(
        (cue) =>
          cue.endSeconds > start &&
          cue.startSeconds < end,
      )
      .map((cue) => ({
        ...cue,
        startSeconds: Math.max(
          0,
          cue.startSeconds - start,
        ),
        endSeconds:
          Math.min(end, cue.endSeconds) - start,
      }))
      .filter(
        (cue) => cue.endSeconds > cue.startSeconds,
      );

    shots.push({ start, end, cues });
    start = end;
  }

  return shots;
}

function summarizeCues(
  cues: SubtitleCue[],
  fallback: string,
): string {
  const text = cues
    .map((cue) => cue.text.trim())
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ");

  if (!text) return fallback;

  const words = text.split(" ");

  return words.length > 17
    ? `${words.slice(0, 17).join(" ")}…`
    : text;
}

function makeShotLayers(
  source: SceneConfig,
  shotIndex: number,
  shotDuration: number,
  cues: SubtitleCue[],
  totalShots: number,
  fps: number,
): SceneLayer[] {
  const localFrames = Math.max(
    1,
    Math.round(shotDuration * fps),
  );

  const progress =
    totalShots <= 1
      ? 0
      : shotIndex / (totalShots - 1);

  const caption = summarizeCues(cues, source.name);

  const heading =
    cues[0]?.text
      ?.replace(/[.!?]+$/g, "")
      .split(/\s+/)
      .slice(0, 5)
      .join(" ")
      .toLocaleUpperCase("id-ID") ||
    source.name.toLocaleUpperCase("id-ID");

  return source.layers
    .filter((layer) => layer.type !== "audio")
    .map((layer) => {
      const cloned = {
        ...layer,
        id: `${layer.id}-shot-${shotIndex + 1}`,
      } as SceneLayer;

      if (cloned.type === "text") {
        const textLayer = cloned as TextLayer;

        if (/caption/i.test(textLayer.id)) {
          return {
            ...textLayer,
            text: caption,
          };
        }

        if (/heading|title/i.test(textLayer.id)) {
          return {
            ...textLayer,
            text: heading,
          };
        }
      }

      if (cloned.type === "map") {
        const map = cloned as MapLayer;

        const startCenter: [number, number] =
          progress < 0.25
            ? [25, 5]
            : [105, 5];

        const endCenter: [number, number] =
          progress < 0.25
            ? [105, 5]
            : [118, -2];

        const startZoom =
          progress < 0.25
            ? 1
            : 1.25 + (shotIndex % 3) * 0.12;

        const endZoom = Math.min(
          3.2,
          startZoom +
            0.28 +
            (shotIndex % 2) * 0.12,
        );

        return {
          ...map,
          cameraKeyframes: [
            {
              frame: 0,
              center: startCenter,
              zoom: startZoom,
            },
            {
              frame: localFrames,
              center: endCenter,
              zoom: endZoom,
            },
          ],
        };
      }

      return cloned;
    });
}

function createDirectedScenes(
  project: ProjectConfig,
  shots: Shot[],
): SceneConfig[] {
  return shots.map((shot, index) => {
    const sourceIndex = Math.min(
      project.scenes.length - 1,
      Math.floor(
        (index / Math.max(1, shots.length)) *
          project.scenes.length,
      ),
    );

    const source = project.scenes[sourceIndex];
    const shotDuration = shot.end - shot.start;

    return {
      ...source,
      id: `narration-shot-${String(index + 1).padStart(3, "0")}`,
      name: `Shot ${index + 1}: ${source.name}`,
      durationSeconds: shotDuration,

      transitionIn:
        index === 0
          ? source.transitionIn
          : {
              type: "fade",
              durationSeconds: 0.22,
            },

      transitionOut:
        index === shots.length - 1
          ? source.transitionOut
          : {
              type: "fade",
              durationSeconds: 0.22,
            },

      layers: makeShotLayers(
        source,
        index,
        shotDuration,
        shot.cues,
        shots.length,
        project.fps,
      ),
    };
  });
}

export function attachNarrationToProject(
  project: ProjectConfig,
  metadata: GeneratedNarration,
): ProjectConfig {
  if (!metadata.audioPath?.trim()) {
    throw new Error(
      "Narasi gagal: audioPath tidak tersedia.",
    );
  }

  if (
    !Number.isFinite(metadata.durationSeconds) ||
    metadata.durationSeconds <= 0
  ) {
    throw new Error(
      "Durasi audio narasi tidak valid.",
    );
  }

  const shots = splitNarrationIntoShots(
    metadata.durationSeconds,
    metadata.subtitles,
  );

  const directedScenes = createDirectedScenes(
    project,
    shots,
  );

  const scenes = directedScenes.map(
    (scene, index) => {
      const shot = shots[index];

      const narrationLayer = {
        id: `narration-${scene.id}`,
        type: "audio",
        visible: true,
        opacity: 1,
        src: metadata.audioPath,
        kind: "narration",
        startAtSeconds: 0,
        startFromSeconds: shot.start,
        durationSeconds: shot.end - shot.start,
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
          subtitles: shot.cues,
        },
      } as unknown as AudioLayer;

      return {
        ...scene,
        layers: [
          ...scene.layers,
          narrationLayer,
        ],
      };
    },
  );

  return {
    ...project,
    scenes,
  };
}
