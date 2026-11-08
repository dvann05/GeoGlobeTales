# Audio & Narration Engine

Audio layers are rendered through Remotion's Audio component.

Supported audio kinds:

- narration
- music
- sound-effect

Supported controls:

- startAtSeconds
- durationSeconds
- volume
- fadeInSeconds
- fadeOutSeconds
- playbackRate

Local audio assets must be placed under the public directory.
For example: public/audio/narration/opening.mp3
Reference that file as audio/narration/opening.mp3.

HTTP(S) audio URLs can also be supplied directly.

## TTS provider interface

TTSProvider defines a provider-independent contract for voice listing
and speech synthesis. A concrete provider adapter must implement this
interface and produce an audio file before Remotion rendering.

The engine does not call a TTS service during video rendering.

## Current limitations

- No concrete TTS provider is connected yet.
- No automatic speech generation is performed yet.
- Audio fades and timing are supported.
- Subtitle synchronization will be implemented separately.
