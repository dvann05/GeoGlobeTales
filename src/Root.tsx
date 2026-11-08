import React from "react";
import { Composition } from "remotion";
import { templateProject } from "./projects/template/project";
import { buildTimeline } from "./engine/timeline";
import { SceneCompositor } from "./engine/renderers";

const timeline = buildTimeline(templateProject);

export const Root: React.FC = () => {
  return (
    <Composition
      id="GeoGlobeTales"
      component={SceneCompositor}
      durationInFrames={timeline.durationInFrames}
      fps={templateProject.fps}
      width={templateProject.width}
      height={templateProject.height}
      defaultProps={{
        project: templateProject,
      }}
    />
  );
};
