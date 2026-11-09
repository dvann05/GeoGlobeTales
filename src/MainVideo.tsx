import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

import { GEO_SCENES } from "./data/scriptData";
import { generatedNarration } from "./projects/generated/narration";

export const MainVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const foundIndex = GEO_SCENES.findIndex(
    (scene) =>
      frame >= scene.startFrame &&
      frame < scene.endFrame,
  );

  const sceneIndex =
    foundIndex >= 0
      ? foundIndex
      : frame < GEO_SCENES[0].startFrame
        ? 0
        : GEO_SCENES.length - 1;

  const scene = GEO_SCENES[sceneIndex];
  const previousScene =
    GEO_SCENES[Math.max(0, sceneIndex - 1)];

  const localFrame = Math.max(
    0,
    frame - scene.startFrame,
  );

  const headerSpring = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 18,
      stiffness: 110,
      mass: 0.8,
    },
  });

  const cameraSpring = spring({
    frame: localFrame,
    fps,
    config: {
      damping: 26,
      stiffness: 45,
      mass: 1.1,
    },
  });

  const cameraScale = interpolate(
    cameraSpring,
    [0, 1],
    [previousScene.cam.scale, scene.cam.scale],
  );

  const cameraX = interpolate(
    cameraSpring,
    [0, 1],
    [previousScene.cam.x, scene.cam.x],
  );

  const cameraY = interpolate(
    cameraSpring,
    [0, 1],
    [previousScene.cam.y, scene.cam.y],
  );

  const words = scene.narration
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const wordProgress = interpolate(
    localFrame,
    [
      0,
      Math.max(1, scene.durationInFrames - 1),
    ],
    [0, Math.max(0, words.length)],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const activeWord = Math.min(
    words.length - 1,
    Math.floor(wordProgress),
  );

  const pulse = Math.sin(frame / 7) * 0.5 + 0.5;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#06101E",
        color: "#FFFFFF",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      {/* AUDIO MASTER: diputar satu file penuh dari frame pertama */}
      <Audio
        src={staticFile(
          generatedNarration.audioPath.replace(/^\/+/, ""),
        )}
        volume={1}
      />

      {/* HEADER */}
      <div
        style={{
          position: "absolute",
          top: 75,
          left: 55,
          right: 55,
          height: 340,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: 18,
          opacity: headerSpring,
          transform: `translateY(${interpolate(
            headerSpring,
            [0, 1],
            [-35, 0],
          )}px)`,
        }}
      >
        <div
          style={{
            color: "#FBBF24",
            border: "2px solid #F59E0B",
            backgroundColor: "rgba(245,158,11,0.12)",
            padding: "10px 25px",
            borderRadius: 999,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: 3,
          }}
        >
          {scene.badge}
        </div>

        <div
          style={{
            fontSize: 51,
            lineHeight: 1.15,
            fontWeight: 900,
            textAlign: "center",
            maxWidth: 950,
          }}
        >
          {scene.headline}
        </div>

        <div
          style={{
            fontSize: 27,
            color: "#38BDF8",
            fontWeight: 600,
          }}
        >
          {scene.subheadline}
        </div>
      </div>

      {/* PANGGUNG PETA */}
      <div
        style={{
          position: "absolute",
          top: 455,
          left: 48,
          right: 48,
          height: 900,
          borderRadius: 32,
          border: "2px solid rgba(148,163,184,0.2)",
          background:
            "radial-gradient(circle at 50% 45%, #102B49 0%, #08172B 70%)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          viewBox="0 0 1000 540"
          style={{
            width: "100%",
            height: "auto",
            transform: `translate(${cameraX}px, ${cameraY}px) scale(${cameraScale})`,
            transformOrigin: "center center",
          }}
        >
          <defs>
            <radialGradient
              id="oceanGlow"
              cx="50%"
              cy="50%"
              r="70%"
            >
              <stop offset="0%" stopColor="#163B5E" />
              <stop offset="100%" stopColor="#08172B" />
            </radialGradient>
          </defs>

          <rect
            x="0"
            y="0"
            width="1000"
            height="540"
            fill="url(#oceanGlow)"
          />

          {/* Bentuk daratan ilustratif */}
          <g
            fill="#334B62"
            stroke="#7890A5"
            strokeWidth="1.5"
          >
            <path d="M85 85 L235 75 L260 185 L175 240 L115 190 Z" />
            <path d="M210 265 L295 305 L265 455 L215 425 Z" />
            <path d="M430 80 L555 70 L570 165 L445 175 Z" />
            <path d="M435 190 L560 190 L580 380 L500 430 L430 305 Z" />
            <path d="M565 70 L865 80 L840 245 L690 255 L575 180 Z" />
            <path d="M745 380 L875 370 L890 470 L760 480 Z" />
          </g>

          {/* Kepulauan Indonesia */}
          <g
            fill="#F59E0B"
            stroke="#FDE68A"
            strokeWidth="2"
          >
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
            fontSize="17"
            fontWeight="900"
            letterSpacing="2"
          >
            INDONESIA
          </text>

          {scene.showPlates && (
            <g
              fill="none"
              stroke="#38BDF8"
              strokeWidth="4"
              strokeDasharray="10 8"
            >
              <path d="M640 275 Q710 365 890 360" />
              <path d="M690 240 Q745 285 820 280" />
            </g>
          )}

          {scene.showVolcanoes &&
            [
              [692, 304],
              [708, 326],
              [732, 348],
              [754, 350],
              [782, 352],
              [788, 304],
            ].map(([cx, cy], index) => (
              <g key={index}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={7 + pulse * 5}
                  fill="#EF4444"
                  opacity={0.25 + pulse * 0.45}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill="#FCA5A5"
                />
              </g>
            ))}
        </svg>

        <div
          style={{
            position: "absolute",
            left: 25,
            bottom: 25,
            color: "#93C5FD",
            fontSize: 17,
            letterSpacing: 2,
            fontWeight: 700,
          }}
        >
          ILUSTRASI GEOGRAFI • NUSANTARA
        </div>
      </div>

      {/* SUBTITLE BERDASARKAN TIMESTAMP NARASI */}
      <div
        style={{
          position: "absolute",
          left: 55,
          right: 55,
          bottom: 105,
          minHeight: 350,
          display: "flex",
          alignItems: "flex-end",
        }}
      >
        <div
          style={{
            width: "100%",
            boxSizing: "border-box",
            backgroundColor: "rgba(5,16,31,0.96)",
            border: "2px solid rgba(148,163,184,0.3)",
            borderRadius: 28,
            padding: "34px 35px",
            textAlign: "center",
            boxShadow: "0 15px 50px rgba(0,0,0,0.3)",
          }}
        >
          <div
            style={{
              color: "#FBBF24",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 3,
              marginBottom: 18,
            }}
          >
            NARASI
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 35,
              lineHeight: 1.45,
              fontWeight: 750,
            }}
          >
            {words.map((word, index) => (
              <span
                key={`${scene.id}-${index}`}
                style={{
                  color:
                    index === activeWord
                      ? "#FBBF24"
                      : index < activeWord
                        ? "#FFFFFF"
                        : "#94A3B8",
                  display: "inline-block",
                  marginRight: 9,
                }}
              >
                {word}
              </span>
            ))}
          </p>
        </div>
      </div>

      {/* INDIKATOR PROGRES */}
      <div
        style={{
          position: "absolute",
          left: 55,
          right: 55,
          bottom: 55,
          height: 5,
          backgroundColor: "rgba(148,163,184,0.25)",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.min(
              100,
              (frame / TOTAL_FRAMES_SAFE) * 100,
            )}%`,
            height: "100%",
            backgroundColor: "#F59E0B",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

const TOTAL_FRAMES_SAFE = Math.ceil(
  generatedNarration.durationSeconds * 30,
);
