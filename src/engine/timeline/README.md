# Scene & Timeline Engine

The timeline engine converts project scene durations in seconds into Remotion
frames and places scenes sequentially.

## Main modules

- `SceneTypes.ts`: project, scene, and layer contracts.
- `Timeline.ts`: seconds-to-frames conversion and timeline construction.
- `TimelineValidator.ts`: project, scene, and layer validation.
- `SceneTimeline.tsx`: renders resolved scenes through a supplied renderer.
- `src/projects/template/project.ts`: starter configuration for a new video.

## Design

A project describes content. The engine controls timing and sequencing.
Scene rendering is injected through `renderScene`, so the timeline does not
depend on a specific video topic or a specific map style.

Current layer contracts include map, text, image, route, marker, audio,
infographic, and custom layers. Their visual/audio renderers are separate
modules and will be connected in later stages.

Scenes currently run sequentially. Transition fields are metadata for the
future transition renderer; they do not yet create overlapping scenes.
Audio layer metadata is also a contract, not a completed audio mixer.
