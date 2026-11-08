import type { CameraKeyframe } from "./CameraTypes";

export const CAMERA_PRESETS = {
  globalView: (
    duration: number
  ): CameraKeyframe[] => [
    {
      frame: 0,
      center: [0, 0],
      zoom: 1,
    },
    {
      frame: duration,
      center: [0, 0],
      zoom: 1,
    },
  ],

  zoomToRegion: (
    startFrame: number,
    endFrame: number,
    longitude: number,
    latitude: number,
    targetZoom = 3
  ): CameraKeyframe[] => [
    {
      frame: startFrame,
      center: [0, 0],
      zoom: 1,
    },
    {
      frame: endFrame,
      center: [longitude, latitude],
      zoom: targetZoom,
    },
  ],

  globeRotation: (
    duration: number
  ): CameraKeyframe[] => [
    {
      frame: 0,
      center: [0, 0],
      zoom: 1,
      rotation: [0, 0, 0],
    },
    {
      frame: duration,
      center: [0, 0],
      zoom: 1,
      rotation: [180, 0, 0],
    },
  ],
};
