import type { CameraKeyframe } from "../camera/CameraTypes";

export type SceneLayerType =
  | "map"
  | "text"
  | "image"
  | "route"
  | "marker"
  | "infographic"
  | "audio"
  | "custom";

export type BaseLayer = {
  id: string;
  type: SceneLayerType;
  visible?: boolean;
  opacity?: number;
};

export type MapLayer = BaseLayer & {
  type: "map";
  datasetId: string;
  projection?: "natural-earth" | "mercator" | "orthographic";
  highlightIds?: string[];
  highlightNames?: string[];
  highlightColor?: string;
  cameraKeyframes?: CameraKeyframe[];
};

export type TextLayer = BaseLayer & {
  type: "text";
  text: string;
  x: number;
  y: number;
  fontSize?: number;
  color?: string;
  fontFamily?: string;
  fontWeight?: number | string;
  textAlign?: "left" | "center" | "right";
  maxWidth?: number;
};

export type ImageLayer = BaseLayer & {
  type: "image";
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fit?: "contain" | "cover";
};

export type RouteLayer = BaseLayer & {
  type: "route";
  coordinates: [longitude: number, latitude: number][];
  color?: string;
  strokeWidth?: number;
};

export type MarkerLayer = BaseLayer & {
  type: "marker";
  longitude: number;
  latitude: number;
  label?: string;
  color?: string;
};

export type AudioLayer = BaseLayer & {
  type: "audio";
  src: string;
  volume?: number;
  fadeInSeconds?: number;
  fadeOutSeconds?: number;
};

export type CustomLayer = BaseLayer & {
  type: "infographic" | "custom";
  renderer: string;
  props?: Record<string, unknown>;
};

export type SceneLayer =
  | MapLayer
  | TextLayer
  | ImageLayer
  | RouteLayer
  | MarkerLayer
  | AudioLayer
  | CustomLayer;

export type SceneTransition = {
  type: "none" | "fade" | "slide" | "zoom";
  durationSeconds: number;
};

export type SceneConfig = {
  id: string;
  name: string;
  durationSeconds: number;
  layers: SceneLayer[];
  transitionIn?: SceneTransition;
  transitionOut?: SceneTransition;
};

export type ProjectConfig = {
  id: string;
  title: string;
  description?: string;
  fps: number;
  width: number;
  height: number;
  scenes: SceneConfig[];
};

export type ResolvedScene = SceneConfig & {
  from: number;
  durationInFrames: number;
  endFrame: number;
};

export type ResolvedTimeline = {
  fps: number;
  durationInFrames: number;
  scenes: ResolvedScene[];
};
