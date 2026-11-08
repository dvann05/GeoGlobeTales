export type SubtitleCue = {
  id: string;
  text: string;
  startSeconds: number;
  endSeconds: number;
};

export type SubtitleStyle = {
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  backgroundColor?: string;
  bottom?: number;
  maxWidth?: number;
  fontWeight?: number | string;
};

export type SubtitleTrackConfig = {
  enabled?: boolean;
  style?: SubtitleStyle;
  cues: SubtitleCue[];
};
