import type { SubtitleCue } from "./SubtitleTypes";

export type SubtitleValidationIssue = {
  cueId: string;
  message: string;
};

export function validateSubtitles(
  cues: SubtitleCue[],
  audioDurationSeconds?: number,
): SubtitleValidationIssue[] {
  const issues: SubtitleValidationIssue[] = [];
  const ids = new Set<string>();

  for (const cue of cues) {
    if (!cue.id.trim()) {
      issues.push({
        cueId: cue.id,
        message: "Subtitle cue ID cannot be empty.",
      });
    }

    if (ids.has(cue.id)) {
      issues.push({
        cueId: cue.id,
        message: `Duplicate subtitle cue ID: ${cue.id}`,
      });
    }

    ids.add(cue.id);

    if (!cue.text.trim()) {
      issues.push({
        cueId: cue.id,
        message: "Subtitle text cannot be empty.",
      });
    }

    if (
      !Number.isFinite(cue.startSeconds) ||
      !Number.isFinite(cue.endSeconds) ||
      cue.startSeconds < 0 ||
      cue.endSeconds <= cue.startSeconds
    ) {
      issues.push({
        cueId: cue.id,
        message: "Subtitle timing is invalid.",
      });
      continue;
    }

    if (
      audioDurationSeconds !== undefined &&
      cue.endSeconds > audioDurationSeconds
    ) {
      issues.push({
        cueId: cue.id,
        message: "Subtitle cue exceeds audio duration.",
      });
    }
  }

  const sorted = [...cues].sort(
    (a, b) => a.startSeconds - b.startSeconds,
  );

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startSeconds < sorted[i - 1].startSeconds) {
      issues.push({
        cueId: sorted[i].id,
        message: "Subtitle cues are not chronologically ordered.",
      });
    }
  }

  return issues;
}
