import type { ProjectConfig } from "../timeline/SceneTypes";
import {
  createNarrationLayer,
  type GeneratedNarration,
  type NarrationLayerOptions,
} from "./NarrationBridge";

export function attachNarrationToScene(
  project: ProjectConfig,
  sceneId: string,
  metadata: GeneratedNarration,
  options: NarrationLayerOptions = {},
): ProjectConfig {
  let found = false;

  const scenes = project.scenes.map((scene) => {
    if (scene.id !== sceneId) return scene;

    found = true;

    const layer = createNarrationLayer(metadata, options);

    const withoutOldNarration = scene.layers.filter(
      (item) => item.id !== layer.id,
    );

    return {
      ...scene,
      layers: [...withoutOldNarration, layer],
    };
  });

  if (!found) {
    throw new Error(`Scene "${sceneId}" tidak ditemukan.`);
  }

  return {
    ...project,
    scenes,
  };
}
