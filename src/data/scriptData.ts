import { generatedNarration } from "../projects/generated/narration";

const FPS = 30;

const VISUALS = [
  {
    badge: "GEOGRAPHY EXPLAINER",
    headline: "ASAL-USUL KEPULAUAN NUSANTARA",
    subheadline: "Proses geologi selama jutaan tahun",
    cam: { scale: 1.1, x: 0, y: 0 },
    showPlates: false,
    showVolcanoes: false,
  },
  {
    badge: "PERGERAKAN LEMPENG",
    headline: "BUMI YANG TERUS BERGERAK",
    subheadline: "Eurasia • Indo-Australia • Pasifik",
    cam: { scale: 1.65, x: -110, y: -20 },
    showPlates: true,
    showVolcanoes: false,
  },
  {
    badge: "AKTIVITAS VULKANIK",
    headline: "LAHIRNYA RIBUAN PULAU",
    subheadline: "Cincin Api Pasifik",
    cam: { scale: 2.1, x: -180, y: -45 },
    showPlates: true,
    showVolcanoes: true,
  },
  {
    badge: "BENTANG ALAM",
    headline: "WAJAH NUSANTARA",
    subheadline: "Pegunungan, gunung api, dan dataran rendah",
    cam: { scale: 2.25, x: -200, y: -50 },
    showPlates: false,
    showVolcanoes: true,
  },
  {
    badge: "PERJALANAN GEOLOGI",
    headline: "INDONESIA HARI INI",
    subheadline: "Warisan proses alam yang panjang",
    cam: { scale: 1.45, x: -90, y: -20 },
    showPlates: false,
    showVolcanoes: false,
  },
];

export interface GeoScene {
  id: number;
  startFrame: number;
  endFrame: number;
  durationInFrames: number;
  badge: string;
  headline: string;
  subheadline: string;
  narration: string;
  cam: { scale: number; x: number; y: number };
  showPlates: boolean;
  showVolcanoes: boolean;
}

if (!generatedNarration.audioPath) {
  throw new Error("Audio narasi belum tersedia.");
}

if (
  !Number.isFinite(generatedNarration.durationSeconds) ||
  generatedNarration.durationSeconds <= 0
) {
  throw new Error("Durasi audio narasi tidak valid.");
}

if (!generatedNarration.subtitles?.length) {
  throw new Error("Subtitle narasi belum tersedia.");
}

export const TOTAL_FRAMES = Math.ceil(
  generatedNarration.durationSeconds * FPS,
);

const sortedCues = [...generatedNarration.subtitles].sort(
  (a, b) => a.startSeconds - b.startSeconds,
);

export const GEO_SCENES: GeoScene[] = sortedCues.map(
  (cue, index) => {
    const visual = VISUALS[
      Math.min(
        VISUALS.length - 1,
        Math.floor(
          (index / Math.max(1, sortedCues.length)) *
            VISUALS.length,
        ),
      )
    ];

    const startFrame = Math.max(
      0,
      Math.round(cue.startSeconds * FPS),
    );

    const endFrame = Math.min(
      TOTAL_FRAMES,
      Math.max(
        startFrame + 1,
        Math.round(cue.endSeconds * FPS),
      ),
    );

    return {
      id: index + 1,
      startFrame,
      endFrame,
      durationInFrames: endFrame - startFrame,
      badge: visual.badge,
      headline: visual.headline,
      subheadline: visual.subheadline,
      narration: cue.text,
      cam: visual.cam,
      showPlates: visual.showPlates,
      showVolcanoes: visual.showVolcanoes,
    };
  },
);
