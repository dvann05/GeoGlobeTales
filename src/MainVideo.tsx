import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { GEO_SCENES } from './data/scriptData';

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scene =
    GEO_SCENES.find(
      (s) => frame >= s.startFrame && frame < s.startFrame + s.durationInFrames
    ) || GEO_SCENES[GEO_SCENES.length - 1];

  const prevScene = GEO_SCENES[Math.max(0, scene.id - 2)];
  const localFrame = frame - scene.startFrame;

  const headerSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 16, stiffness: 120 },
  });

  const camSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 24, stiffness: 55 },
  });

  const scale =
    scene.id === 1
      ? interpolate(localFrame, [0, scene.durationInFrames], [1.0, 1.15])
      : interpolate(camSpring, [0, 1], [prevScene.cam.scale, scene.cam.scale]);

  const tx =
    scene.id === 1
      ? 0
      : interpolate(camSpring, [0, 1], [prevScene.cam.x, scene.cam.x]);

  const ty =
    scene.id === 1
      ? 0
      : interpolate(camSpring, [0, 1], [prevScene.cam.y, scene.cam.y]);

  const words = scene.narration.split(' ');
  const activeWord = Math.floor(
    interpolate(
      localFrame,
      [0, scene.durationInFrames - 15],
      [0, words.length - 1],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    )
  );

  const pulse = Math.sin(frame / 5) * 0.5 + 0.5;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#06101E',
        fontFamily: 'sans-serif',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        overflow: 'hidden',
      }}
    >
      {/* ZONA 1: HEADER ATAS (Tinggi Tetap 410px - Bebas Tabrakan) */}
      <div
        style={{
          height: 410,
          padding: '85px 60px 20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 14,
          opacity: headerSpring,
          transform: `translateY(${interpolate(headerSpring, [0, 1], [-30, 0])}px)`,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(245, 158, 11, 0.16)',
            border: '2px solid #F59E0B',
            color: '#FBBF24',
            padding: '8px 26px',
            borderRadius: 999,
            fontSize: 23,
            fontWeight: 800,
            letterSpacing: 2.5,
          }}
        >
          {scene.badge}
        </div>
        <h1
          style={{
            margin: 0,
            color: '#FFFFFF',
            fontSize: 50,
            fontWeight: 900,
            lineHeight: 1.16,
          }}
        >
          {scene.headline}
        </h1>
        <div style={{ color: '#38BDF8', fontSize: 28, fontWeight: 600 }}>
          {scene.subheadline}
        </div>
      </div>

      {/* ZONA 2: PANGGUNG PETA TENGAH (Tinggi Tetap 950px) */}
      <div
        style={{
          height: 950,
          margin: '0 60px',
          borderRadius: 32,
          border: '2px solid rgba(148, 163, 184, 0.18)',
          backgroundColor: '#08172B',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          viewBox="0 0 1000 540"
          style={{
            width: '100%',
            height: 'auto',
            transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
            transformOrigin: 'center center',
          }}
        >
          <g fill="#2C3E55" stroke="#475569" strokeWidth="1.2">
            <path d="M 85,85 L 235,75 L 260,185 L 175,240 L 115,190 Z" />
            <path d="M 210,265 L 295,305 L 265,455 L 215,425 Z" />
            <path d="M 430,80 L 555,70 L 570,165 L 445,175 Z" />
            <path d="M 435,190 L 560,190 L 580,380 L 500,430 L 430,305 Z" />
            <path d="M 565,70 L 865,80 L 840,245 L 690,255 L 575,180 Z" />
            <path d="M 745,380 L 875,370 L 890,470 L 760,480 Z" />
          </g>

          {/* Kepulauan Indonesia */}
          <g fill="#F59E0B" stroke="#FDE68A" strokeWidth="1.6">
            <polygon points="682,290 704,306 720,334 708,342 674,302" />
            <polygon points="722,344 766,348 764,356 720,352" />
            <polygon points="728,286 764,284 768,322 732,326" />
            <polygon points="776,296 794,292 790,328 774,324" />
            <polygon points="770,348 808,350 808,356 770,355" />
            <polygon points="818,314 868,322 864,348 816,336" />
          </g>

          <text
            x="768"
            y="268"
            textAnchor="middle"
            fill="#FBBF24"
            fontSize="13"
            fontWeight="800"
          >
            INDONESIA
          </text>

          {scene.showPlates && (
            <path
              d="M 655,285 Q 715,375 880,360"
              fill="none"
              stroke="#38BDF8"
              strokeWidth="3.2"
              strokeDasharray="7 5"
            />
          )}

          {scene.showVolcanoes &&
            [
              [692, 304],
              [708, 326],
              [732, 348],
              [754, 350],
              [782, 352],
              [788, 304],
            ].map(([cx, cy], idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={4 + pulse * 4}
                fill="#EF4444"
              />
            ))}
        </svg>
      </div>

      {/* ZONA 3: SUBTITLE BAWAH (Tinggi Tetap 520px) */}
      <div style={{ height: 520, padding: '25px 60px 110px', display: 'flex', alignItems: 'flex-end' }}>
        <div
          style={{
            width: '100%',
            backgroundColor: 'rgba(10, 22, 42, 0.95)',
            border: '2px solid rgba(148, 163, 184, 0.25)',
            borderRadius: 28,
            padding: '34px 40px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: 0, fontSize: 37, lineHeight: 1.42, fontWeight: 700 }}>
            {words.map((w, i) => (
              <span
                key={i}
                style={{
                  color:
                    i === activeWord
                      ? '#FBBF24'
                      : i < activeWord
                      ? '#FFFFFF'
                      : '#94A3B8',
                  marginRight: 10,
                  display: 'inline-block',
                }}
              >
                {w}
              </span>
            ))}
          </p>
        </div>
      </div>
    </AbsoluteFill>
  );
};
