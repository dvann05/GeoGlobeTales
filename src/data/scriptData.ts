import { generatedNarration } from "../projects/generated/narration";

const FPS = 30;

const VISUALS = [
  {
    badge: "NUSANTARA PRA-KOLONIAL",
    headline: "KEPULAUAN DENGAN SEJARAH BERAGAM",
    subheadline: "Kerajaan, kesultanan, dan jaringan perdagangan",
    cam: { scale: 1.1, x: 0, y: 0 },
    showPlates: false,
    showVolcanoes: false,
  },
  {
    badge: "KEDATANGAN VOC",
    headline: "PERSAINGAN DAGANG DI NUSANTARA",
    subheadline: "VOC berdiri pada 1602 dan memperluas pengaruh",
    cam: { scale: 1.35, x: -35, y: -5 },
    showPlates: false,
    showVolcanoes: false,
  },
  {
    badge: "PUSAT KEKUASAAN KOLONIAL",
    headline: "JAWA MENJADI PUSAT ADMINISTRASI",
    subheadline: "Batavia didirikan sebagai pusat VOC pada 1619",
    cam: { scale: 1.75, x: -110, y: -20 },
    showPlates: false,
    showVolcanoes: false,
  },
  {
    badge: "MALUKU DAN REMPAH",
    headline: "PEREBUTAN JALUR PERDAGANGAN",
    subheadline: "Kepulauan rempah menjadi kawasan strategis",
    cam: { scale: 1.9, x: -145, y: -25 },
    showPlates: false,
    showVolcanoes: false,
  },
  {
    badge: "PENGUASAAN BERTAHAP",
    headline: "TIDAK SEMUA WILAYAH DIKUASAI BERSAMAAN",
    subheadline: "Setiap kawasan memiliki lintasan sejarah berbeda",
    cam: { scale: 1.65, x: -100, y: -15 },
    showPlates: false,
    showVolcanoes: false,
  },
  {
    badge: "PERANG DAN PERJANJIAN",
    headline: "KONFLIK MENGUBAH PETA KEKUASAAN",
    subheadline: "Ekspedisi, perlawanan, dan perubahan politik",
    cam: { scale: 2.0, x: -160, y: -30 },
    showPlates: false,
    showVolcanoes: false,
  },
  {
    badge: "PERUBAHAN WILAYAH",
    headline: "PROSES PANJANG MEMBENTUK NUSANTARA",
    subheadline: "Pengaruh kolonial berkembang pada masa berbeda",
    cam: { scale: 1.8, x: -130, y: -20 },
    showPlates: false,
    showVolcanoes: false,
  },
  {
    badge: "INDONESIA MODERN",
    headline: "SEJARAH PANJANG MENUJU INDONESIA",
    subheadline: "Warisan dinamika kekuasaan di seluruh Nusantara",
    cam: { scale: 1.35, x: -50, y: -5 },
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
