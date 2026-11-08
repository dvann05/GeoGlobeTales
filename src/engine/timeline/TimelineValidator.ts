import type { ProjectConfig, SceneConfig } from "./SceneTypes";
import { buildTimeline } from "./Timeline";

export type ValidationIssue = {
  severity: "error" | "warning";
  code: string;
  message: string;
  sceneId?: string;
  layerId?: string;
};

export type ValidationReport = {
  valid: boolean;
  issues: ValidationIssue[];
};

function validateScene(scene: SceneConfig): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const layerIds = new Set<string>();

  if (!scene.name.trim()) {
    issues.push({
      severity: "warning",
      code: "SCENE_NAME_EMPTY",
      message: `Scene "${scene.id}" has no display name.`,
      sceneId: scene.id,
    });
  }

  if (!Array.isArray(scene.layers)) {
    issues.push({
      severity: "error",
      code: "SCENE_LAYERS_INVALID",
      message: `Scene "${scene.id}" must have a layers array.`,
      sceneId: scene.id,
    });

    return issues;
  }

  for (const layer of scene.layers) {
    if (!layer.id.trim()) {
      issues.push({
        severity: "error",
        code: "LAYER_ID_EMPTY",
        message: `A layer in scene "${scene.id}" has an empty ID.`,
        sceneId: scene.id,
      });
      continue;
    }

    if (layerIds.has(layer.id)) {
      issues.push({
        severity: "error",
        code: "LAYER_ID_DUPLICATE",
        message: `Duplicate layer ID "${layer.id}" in scene "${scene.id}".`,
        sceneId: scene.id,
        layerId: layer.id,
      });
    }

    layerIds.add(layer.id);

    if (layer.opacity !== undefined &&
      (layer.opacity < 0 || layer.opacity > 1)) {
      issues.push({
        severity: "error",
        code: "LAYER_OPACITY_INVALID",
        message: `Layer "${layer.id}" opacity must be between 0 and 1.`,
        sceneId: scene.id,
        layerId: layer.id,
      });
    }

    if (layer.type === "map" && !layer.datasetId.trim()) {
      issues.push({
        severity: "error",
        code: "MAP_DATASET_MISSING",
        message: `Map layer "${layer.id}" has no dataset ID.`,
        sceneId: scene.id,
        layerId: layer.id,
      });
    }

    if (layer.type === "image" &&
      (!layer.src.trim() || layer.width <= 0 || layer.height <= 0)) {
      issues.push({
        severity: "error",
        code: "IMAGE_LAYER_INVALID",
        message: `Image layer "${layer.id}" has invalid source or dimensions.`,
        sceneId: scene.id,
        layerId: layer.id,
      });
    }

    if (layer.type === "audio" &&
      (!layer.src.trim() ||
        (layer.volume !== undefined &&
          (layer.volume < 0 || layer.volume > 1)))) {
      issues.push({
        severity: "error",
        code: "AUDIO_LAYER_INVALID",
        message: `Audio layer "${layer.id}" has invalid source or volume.`,
        sceneId: scene.id,
        layerId: layer.id,
      });
    }
  }

  for (const transition of [scene.transitionIn, scene.transitionOut]) {
    if (transition && transition.durationSeconds < 0) {
      issues.push({
        severity: "error",
        code: "TRANSITION_DURATION_INVALID",
        message: `Scene "${scene.id}" has a negative transition duration.`,
        sceneId: scene.id,
      });
    }
  }

  return issues;
}

export function validateProject(project: ProjectConfig): ValidationReport {
  const issues: ValidationIssue[] = [];
  const sceneIds = new Set<string>();

  for (const scene of project.scenes) {
    if (sceneIds.has(scene.id)) {
      issues.push({
        severity: "error",
        code: "SCENE_ID_DUPLICATE",
        message: `Duplicate scene ID "${scene.id}".`,
        sceneId: scene.id,
      });
    }

    sceneIds.add(scene.id);
    issues.push(...validateScene(scene));
  }

  try {
    buildTimeline(project);
  } catch (error) {
    issues.push({
      severity: "error",
      code: "TIMELINE_INVALID",
      message: error instanceof Error ? error.message : String(error),
    });
  }

  return {
    valid: !issues.some((issue) => issue.severity === "error"),
    issues,
  };
}
