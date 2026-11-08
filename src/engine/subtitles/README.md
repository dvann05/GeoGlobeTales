# Narration Subtitle Synchronization

Subtitle cues are attached to narration audio layers.

Each cue contains:

- id
- text
- startSeconds
- endSeconds

Cue timing is relative to the beginning of its narration audio layer.

The subtitle renderer converts cue timestamps into Remotion frames and
shows the matching text only during its active interval.

The validator checks cue IDs, text, timestamps, and optional audio duration.

## Alignment modes

- manual: cue timestamps are provided by the project author.
- provider: reserved for future TTS providers that return word or
  sentence timestamps.

Provider alignment is metadata only until a concrete provider adapter
is connected.
