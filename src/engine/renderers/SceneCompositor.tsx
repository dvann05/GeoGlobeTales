import React from "react";
import { AbsoluteFill } from "remotion";
import type { ProjectConfig } from "../timeline/SceneTypes";
import { SceneTimeline } from "../timeline/SceneTimeline";
import { SceneRenderer } from "./SceneRenderer";

type Props = {
  project: ProjectConfig;
};

export const SceneCompositor: React.FC<Props> = ({ project }) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#071827",
        overflow: "hidden",
      }}
    >
      <SceneTimeline
        project={project}
        renderScene={(scene) => (
          <SceneRenderer
            scene={scene}
            project={project}
          />
        )}
      />
    </AbsoluteFill>
  );
};
