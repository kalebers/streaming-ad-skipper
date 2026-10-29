import type { StreamingAdapter } from "./types";
import type { ClassificationResult } from "../shared/types";

export const PRIME_VIDEO_HOSTS = new Set(["primevideo.com", "www.primevideo.com"]);

export class PrimeVideoAdapter implements StreamingAdapter {
  readonly id = "prime-video" as const;
  readonly displayName = "Amazon Prime Video";

  matches(url: URL): boolean {
    return PRIME_VIDEO_HOSTS.has(url.hostname);
  }

  findPlayer(root: ParentNode): HTMLVideoElement | null {
    return root.querySelector("video");
  }

  classify(_root: ParentNode, _video: HTMLVideoElement): ClassificationResult {
    return {
      classification: "unknown",
      confidence: 0,
      evidence: [],
      observedAt: Date.now()
    };
  }

  findVerifiedSkipControl(_root: ParentNode): null {
    return null;
  }

  cleanup(): void {}
}
