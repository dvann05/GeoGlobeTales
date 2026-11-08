import { interpolate, Easing } from "remotion";
import type {
  CameraKeyframe,
  CameraState,
} from "./CameraTypes";

const DEFAULT_ROTATION: [number, number, number] = [0, 0, 0];

function interpolateAngle(
  start: number,
  end: number,
  progress: number
): number {
  const delta = ((end - start + 540) % 360) - 180;
  return start + delta * progress;
}

function validateKeyframes(
  keyframes: CameraKeyframe[]
): CameraKeyframe[] {
  if (keyframes.length === 0) {
    throw new Error("Camera membutuhkan minimal satu keyframe.");
  }

  const sorted = [...keyframes].sort(
    (a, b) => a.frame - b.frame
  );

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];

    if (!Number.isFinite(item.frame) || item.frame < 0) {
      throw new Error("Camera frame tidak valid.");
    }

    if (
      !Number.isFinite(item.center[0]) ||
      !Number.isFinite(item.center[1]) ||
      item.center[0] < -180 ||
      item.center[0] > 180 ||
      item.center[1] < -90 ||
      item.center[1] > 90
    ) {
      throw new Error("Koordinat kamera tidak valid.");
    }

    if (!Number.isFinite(item.zoom) || item.zoom < 1) {
      throw new Error("Zoom minimal adalah 1.");
    }

    if (
      i > 0 &&
      sorted[i].frame === sorted[i - 1].frame
    ) {
      throw new Error("Dua keyframe tidak boleh memiliki frame sama.");
    }
  }

  return sorted;
}

export function getCameraState(
  frame: number,
  input: CameraKeyframe[]
): CameraState {
  const keyframes = validateKeyframes(input);

  const first = keyframes[0];
  const last = keyframes[keyframes.length - 1];

  if (frame <= first.frame) {
    return {
      center: [...first.center],
      zoom: first.zoom,
      rotation: first.rotation ?? DEFAULT_ROTATION,
    };
  }

  if (frame >= last.frame) {
    return {
      center: [...last.center],
      zoom: last.zoom,
      rotation: last.rotation ?? DEFAULT_ROTATION,
    };
  }

  let start = first;
  let end = last;

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (
      frame >= keyframes[i].frame &&
      frame <= keyframes[i + 1].frame
    ) {
      start = keyframes[i];
      end = keyframes[i + 1];
      break;
    }
  }

  const progress = interpolate(
    frame,
    [start.frame, end.frame],
    [0, 1],
    {
      easing: Easing.inOut(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const startRotation = start.rotation ?? DEFAULT_ROTATION;
  const endRotation = end.rotation ?? DEFAULT_ROTATION;

  return {
    center: [
      interpolateAngle(
        start.center[0],
        end.center[0],
        progress
      ),
      interpolate(
        frame,
        [start.frame, end.frame],
        [start.center[1], end.center[1]]
      ),
    ],

    zoom: interpolate(
      frame,
      [start.frame, end.frame],
      [start.zoom, end.zoom],
      {
        easing: Easing.inOut(Easing.cubic),
      }
    ),

    rotation: [
      interpolateAngle(
        startRotation[0],
        endRotation[0],
        progress
      ),
      interpolateAngle(
        startRotation[1],
        endRotation[1],
        progress
      ),
      interpolateAngle(
        startRotation[2],
        endRotation[2],
        progress
      ),
    ],
  };
}
