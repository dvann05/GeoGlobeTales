import React, { useMemo } from "react";
import { Sequence } from "remotion";
import type {
  ProjectConfig,
  ResolvedScene,
} from "./SceneTypes";
import { buildTimeline } from "./Timeline";

type SceneTimelineProps = {
  project: ProjectConfig;
  renderScene: (scene: ResolvedScene) => React.ReactNode;
};

export const SceneTimeline: React.FC<SceneTimelineProps> = ({
  project,
  renderScene,
}) => {
  const timeline = useMemo(
    () => buildTimeline(project),
    [project],
  );

  return (
    <>
      {timeline.scenes.map((scene) => (
        <Sequence
          key={scene.id}
          name={scene.name || scene.id}
          from={scene.from}
          durationInFrames={scene.durationInFrames}
        >
          {renderScene(scene)}
        </Sequence>
      ))}
    </>
  );
};
