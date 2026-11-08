import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import type {
  SubtitleCue,
  SubtitleStyle,
} from "./SubtitleTypes";

type Props = {
  cues: SubtitleCue[];
  style?: SubtitleStyle;
};

export const SubtitleRenderer: React.FC<Props> = ({
  cues,
  style = {},
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const activeCue = cues.find((cue) => {
    const start = Math.round(cue.startSeconds * fps);
    const end = Math.round(cue.endSeconds * fps);

    return frame >= start && frame < end;
  });

  if (!activeCue) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: "50%",
        bottom: style.bottom ?? 180,
        transform: "translateX(-50%)",
        width: "90%",
        maxWidth: style.maxWidth ?? 950,
        textAlign: "center",
        fontFamily: style.fontFamily ?? "Arial, sans-serif",
        fontSize: style.fontSize ?? 42,
        fontWeight: style.fontWeight ?? 700,
        lineHeight: 1.35,
        color: style.color ?? "#FFFFFF",
        backgroundColor:
          style.backgroundColor ?? "rgba(0, 0, 0, 0.65)",
        padding: "16px 24px",
        borderRadius: 14,
        whiteSpace: "pre-wrap",
        overflowWrap: "break-word",
        textShadow: "0 2px 5px rgba(0,0,0,0.5)",
      }}
    >
      {activeCue.text}
    </div>
  );
};
