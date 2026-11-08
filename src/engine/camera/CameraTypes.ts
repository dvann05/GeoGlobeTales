export type GeographicPoint = [
  longitude: number,
  latitude: number
];

export type CameraRotation = [
  longitude: number,
  latitude: number,
  gamma: number
];

export type CameraKeyframe = {
  frame: number;
  center: GeographicPoint;
  zoom: number;
  rotation?: CameraRotation;
};

export type CameraState = {
  center: GeographicPoint;
  zoom: number;
  rotation: CameraRotation;
};
