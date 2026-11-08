import React from "react";
import { Composition } from "remotion";

import { SceneCompositor } from "./engine/renderers/SceneCompositor";
import { buildTimeline } from "./engine/timeline/Timeline";
import { attachNarrationToProject } from "./engine/audio";
import { templateProject } from "./projects/template/project";
import { generatedNarration } from "./projects/generated/narration";

const activeProject = generatedNarration
  ? attachNarrationToProject(templateProject, generatedNarration)
  : templateProject;

const timeline = buildTimeline(activeProject);

export const Root: React.FC = () => (
  <Composition
    id="GeoGlobeTales"
    component={SceneCompositor}
    durationInFrames={timeline.durationInFrames}
    fps={activeProject.fps}
    width={activeProject.width}
    height={activeProject.height}
    defaultProps={{
      project: activeProject,
    }}
  />
);
