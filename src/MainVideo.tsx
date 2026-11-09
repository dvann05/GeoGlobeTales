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
import { EarthGlobe } from "./visuals/EarthGlobe";

const TOTAL_FRAMES_SAFE = Math.ceil(
  generatedNarration.durationSeconds * 30,
);

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

  const words = scene.narration
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const activeWord = Math.min(
    words.length - 1,
    Math.floor(
      interpolate(
        localFrame,
        [0, Math.max(1, scene.durationInFrames - 1)],
        [0, words.length],
        {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        },
      ),
    ),
  );

  const totalProgress = Math.min(
    100,
    (frame / TOTAL_FRAMES_SAFE) * 100,
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#030914",
        color: "#FFFFFF",
        fontFamily: "Arial, sans-serif",
        overflow: "hidden",
      }}
    >
      <Audio
        src={staticFile(
          generatedNarration.audioPath.replace(/^\/+/, ""),
        )}
        volume={1}
      />

      {/* JUDUL */}
      <div
        style={{
          position: "absolute",
          top: 55,
          left: 55,
          right: 55,
          height: 300,
          zIndex: 5,
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
            color: "#67DFFF",
            border: "1px solid rgba(103,223,255,0.55)",
            backgroundColor: "rgba(20,110,160,0.15)",
            padding: "10px 25px",
            borderRadius: 999,
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: 4,
          }}
        >
          {scene.badge}
        </div>

        <div
          style={{
            fontSize: 49,
            lineHeight: 1.15,
            fontWeight: 900,
            maxWidth: 950,
          }}
        >
          {scene.headline}
        </div>

        <div
          style={{
            fontSize: 26,
            color: "#7DD3FC",
            fontWeight: 600,
          }}
        >
          {scene.subheadline}
        </div>
      </div>

      {/* PANGGUNG GLOBE 3D */}
      <div
        style={{
          position: "absolute",
          top: 380,
          left: 42,
          right: 42,
          height: 1040,
          borderRadius: 34,
          border: "1px solid rgba(105,190,255,0.25)",
          background:
            "radial-gradient(ellipse at 50% 45%, #102D4B 0%, #07172B 48%, #030914 100%)",
          overflow: "hidden",
          boxShadow:
            "0 0 70px rgba(0,130,255,0.12), inset 0 0 60px rgba(0,0,0,0.4)",
        }}
      >
        <EarthGlobe
          width={996}
          height={1040}
          sceneIndex={sceneIndex}
          localFrame={localFrame}
          sceneDuration={scene.durationInFrames}
          zoom={cameraScale}
        />

        <div
          style={{
            position: "absolute",
            left: 26,
            bottom: 25,
            fontSize: 15,
            fontWeight: 800,
            letterSpacing: 2,
            color: "#9BDFFF",
            textShadow: "0 2px 8px #000",
          }}
        >
          EARTH VISUALIZATION • NASA BLUE MARBLE
        </div>

        <div
          style={{
            position: "absolute",
            right: 25,
            bottom: 25,
            fontSize: 13,
            color: "#A9C8DD",
            letterSpacing: 1,
          }}
        >
          COUNTRY DATA: NATURAL EARTH
        </div>
      </div>

      {/* SUBTITLE NARASI */}
      <div
        style={{
          position: "absolute",
          left: 55,
          right: 55,
          bottom: 105,
          minHeight: 350,
          display: "flex",
          alignItems: "flex-end",
          zIndex: 5,
        }}
      >
        <div
          style={{
            width: "100%",
            boxSizing: "border-box",
            backgroundColor: "rgba(3,12,25,0.96)",
            border: "1px solid rgba(103,190,255,0.32)",
            borderRadius: 26,
            padding: "32px 34px",
            textAlign: "center",
            boxShadow: "0 15px 50px rgba(0,0,0,0.4)",
          }}
        >
          <div
            style={{
              color: "#67DFFF",
              fontSize: 17,
              fontWeight: 800,
              letterSpacing: 4,
              marginBottom: 18,
            }}
          >
            NARASI
          </div>

          <p
            style={{
              margin: 0,
              fontSize: 34,
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
                      ? "#67DFFF"
                      : index < activeWord
                        ? "#FFFFFF"
                        : "#8194A9",
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

      {/* PROGRESS */}
      <div
        style={{
          position: "absolute",
          left: 55,
          right: 55,
          bottom: 55,
          height: 5,
          backgroundColor: "rgba(148,163,184,0.2)",
          borderRadius: 99,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${totalProgress}%`,
            height: "100%",
            backgroundColor: "#38BDF8",
            boxShadow: "0 0 14px #38BDF8",
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
