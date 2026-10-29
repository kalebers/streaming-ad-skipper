import type { ClassificationResult } from "../shared/types";

export interface SkipControl {
  element: HTMLElement;
  label: string;
}

export interface StreamingAdapter {
  readonly id: "prime-video" | "netflix";
  readonly displayName: string;
  matches(url: URL): boolean;
  findPlayer(root: ParentNode): HTMLVideoElement | null;
  classify(root: ParentNode, video: HTMLVideoElement): ClassificationResult;
  findVerifiedSkipControl(root: ParentNode): SkipControl | null;
  cleanup(): void;
}
