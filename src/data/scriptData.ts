export interface GeoScene {
  id: number;
  startFrame: number;
  durationInFrames: number;
  badge: string;
  headline: string;
  subheadline: string;
  narration: string;
  cam: { scale: number; x: number; y: number };
  showPlates: boolean;
  showVolcanoes: boolean;
  showTerrainCards: boolean;
  showOutroBadge: boolean;
}

export const TOTAL_FRAMES = 960; // 32 Detik @ 30 FPS

export const GEO_SCENES: GeoScene[] = [
  {
    id: 1,
    startFrame: 0,
    durationInFrames: 165,
    badge: 'GEOGRAPHY EXPLAINER',
    headline: 'FAKTA GEOGRAFI YANG PERLU KAMU TAHU',
    subheadline: 'Asal-Usul Kepulauan Nusantara',
    narration:
      'Indonesia merupakan negara kepulauan yang terbentuk melalui proses geologi selama jutaan tahun.',
    cam: { scale: 1.1, x: 0, y: 0 },
    showPlates: false,
    showVolcanoes: false,
    showTerrainCards: false,
    showOutroBadge: false,
  },
  {
    id: 2,
    startFrame: 165,
    durationInFrames: 195,
    badge: 'MELIHAT PETA WILAYAH',
    headline: 'PERGERAKAN LEMPENG TEKTONIK DUNIA',
    subheadline: 'Kenali Posisi dan Persebaran Wilayahnya',
    narration:
      'Pergerakan lempeng tektonik Eurasia, Indo-Australia, dan Pasifik menyebabkan berbagai perubahan pada permukaan bumi.',
    cam: { scale: 1.8, x: -140, y: -35 },
    showPlates: true,
    showVolcanoes: false,
    showTerrainCards: false,
    showOutroBadge: false,
  },
  {
    id: 3,
    startFrame: 360,
    durationInFrames: 210,
    badge: 'FOKUS WILAYAH',
    headline: 'AKTIVITAS VULKANIK & PERMUKAAN LAUT',
    subheadline: 'Jalur Cincin Api Pasifik (Ring of Fire)',
    narration:
      'Aktivitas vulkanik, pergeseran kerak bumi, dan perubahan permukaan laut turut membentuk ribuan pulau yang kini menjadi wilayah Indonesia.',
    cam: { scale: 2.5, x: -225, y: -60 },
    showPlates: true,
    showVolcanoes: true,
    showTerrainCards: false,
    showOutroBadge: false,
  },
  {
    id: 4,
    startFrame: 570,
    durationInFrames: 210,
    badge: 'BENTANG ALAM NUSANTARA',
    headline: 'KERAGAMAN TOPOGRAFI INDONESIA',
    subheadline: 'Pegunungan, Gunung Berapi, hingga Dataran Rendah',
    narration:
      'Proses panjang tersebut menghasilkan bentang alam yang beragam, mulai dari pegunungan, gunung berapi aktif, hingga dataran rendah yang subur.',
    cam: { scale: 2.3, x: -205, y: -50 },
    showPlates: false,
    showVolcanoes: true,
    showTerrainCards: true,
    showOutroBadge: false,
  },
  {
    id: 5,
    startFrame: 780,
    durationInFrames: 180,
    badge: 'FAKTA MENARIK, BUKAN SEKADAR MITOS',
    headline: 'JELAJAHI BERSAMA GEOGLOBETALES',
    subheadline: 'Rumah Bagi 17.508 Pulau & Biodiversitas Dunia',
    narration:
      'Kekayaan geologi inilah yang menjadikan Indonesia rumah bagi lebih dari tujuh belas ribu pulau dengan keanekaragaman hayati tertinggi di dunia.',
    cam: { scale: 1.55, x: -110, y: -25 },
    showPlates: false,
    showVolcanoes: true,
    showTerrainCards: false,
    showOutroBadge: true,
  },
];
