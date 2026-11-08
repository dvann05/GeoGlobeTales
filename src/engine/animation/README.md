# Animation & Transition Engine

## Layer animations

Supported entrance animations:

- none
- fade
- slide-up
- slide-down
- slide-left
- slide-right
- zoom-in
- zoom-out
- pop

Each layer can define:

- type
- delaySeconds
- durationSeconds

## Scene transitions

Supported scene transition types:

- none
- fade
- slide
- zoom

Transition in/out are applied inside each scene's Remotion Sequence.
Scenes remain sequential; transitions do not overlap adjacent scenes.

## Current limitations

- These are entrance animations, not a complete keyframe animation editor.
- Route and marker visuals are currently drawn inside the map layer.
- Audio animation and volume automation are not implemented here.
