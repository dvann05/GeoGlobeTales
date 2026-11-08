# Geographic Camera Engine

A reusable camera system for geographic storytelling.

## Features

- Geographic camera coordinates
- Frame-based keyframes
- Smooth camera interpolation
- Zoom transitions
- Longitude and latitude focus
- Globe rotation presets
- Multiple projection support

## Keyframe example

{
  frame: 60,
  center: [106.8, -6.2],
  zoom: 4,
  rotation: [0, 0, 0]
}

## Coordinate convention

- Longitude: -180 to 180
- Latitude: -90 to 90
- Zoom: 1 or greater
- Frame: non-negative integer

## Important

Camera animation never modifies source geographic geometry.
The original features remain unchanged.
