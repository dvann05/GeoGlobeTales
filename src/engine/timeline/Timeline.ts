import type {
  ProjectConfig,
  ResolvedScene,
  ResolvedTimeline,
} from "./SceneTypes";

export function secondsToFrames(seconds: number, fps: number): number {
  if (!Number.isFinite(seconds) || seconds < 0) {
    throw new Error(`Invalid time value: ${seconds}`);
  }

  if (!Number.isFinite(fps) || fps <= 0) {
    throw new Error(`Invalid FPS value: ${fps}`);
  }

  return Math.round(seconds * fps);
}

export function buildTimeline(project: ProjectConfig): ResolvedTimeline {
  if (!project.id.trim()) {
    throw new Error("Project ID cannot be empty.");
  }

  if (!Number.isInteger(project.fps) || project.fps <= 0) {
    throw new Error("Project FPS must be a positive integer.");
  }

  if (
    !Number.isInteger(project.width) ||
    !Number.isInteger(project.height) ||
    project.width <= 0 ||
    project.height <= 0
  ) {
    throw new Error("Project dimensions must be positive integers.");
  }

  if (project.scenes.length === 0) {
    throw new Error("A project must contain at least one scene.");
  }

  let cursor = 0;
  const scenes: ResolvedScene[] = project.scenes.map((scene) => {
    if (!scene.id.trim()) {
      throw new Error("Scene ID cannot be empty.");
    }

    const durationInFrames = secondsToFrames(
      scene.durationSeconds,
      project.fps,
    );

    if (durationInFrames < 1) {
      throw new Error(
        `Scene "${scene.id}" is too short for ${project.fps} FPS.`,
      );
    }

    const from = cursor;
    const endFrame = from + durationInFrames;

    cursor = endFrame;

    return {
      ...scene,
      from,
      durationInFrames,
      endFrame,
    };
  });

  return {
    fps: project.fps,
    durationInFrames: cursor,
    scenes,
  };
}
