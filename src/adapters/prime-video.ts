import type { StreamingAdapter } from "./types";
import type { ClassificationResult, Evidence } from "../shared/types";

const skipLabelPattern = /^skip\s+(ad|advertisement)$/i;

function accessibleLabel(element: HTMLElement): string {
  return (
    element.getAttribute("aria-label")?.trim() ||
    element.textContent?.trim().replace(/\s+/g, " ") ||
    ""
  );
}

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

  classify(root: ParentNode, _video: HTMLVideoElement): ClassificationResult {
    const control = this.findVerifiedSkipControl(root);
    const observedAt = Date.now();
    const evidence: Evidence[] = control
      ? [
          {
            id: "prime-video-skip-ad-control",
            kind: "dom-label",
            detail: "Visible enabled control has an exact Skip Ad label",
            confirmed: true,
            observedAt
          }
        ]
      : [];
    return {
      classification: control ? "advertisement" : "unknown",
      confidence: control ? 1 : 0,
      evidence,
      observedAt
    };
  }

  findVerifiedSkipControl(root: ParentNode) {
    const candidates = Array.from(root.querySelectorAll<HTMLElement>(
      "button, [role='button'], input[type='button'], input[type='submit']"
    ));
    return candidates
      .map((element) => ({ element, label: accessibleLabel(element) }))
      .find(({ element, label }) => skipLabelPattern.test(label) && this.isVisibleEnabled(element)) ?? null;
  }

  private isVisibleEnabled(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return (
      element.isConnected &&
      !element.hasAttribute("disabled") &&
      element.getAttribute("aria-disabled") !== "true" &&
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      rect.width > 0 &&
      rect.height > 0
    );
  }

  cleanup(): void {}
}
