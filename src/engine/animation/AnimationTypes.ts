export type LayerAnimationType =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "zoom-in"
  | "zoom-out"
  | "pop";

export type LayerAnimation = {
  type: LayerAnimationType;
  delaySeconds?: number;
  durationSeconds?: number;
};

export type TransitionType = "none" | "fade" | "slide" | "zoom";

export type TransitionConfig = {
  type: TransitionType;
  durationSeconds: number;
};
