import type { StreamingAdapter } from "./types";
import type { ClassificationResult, Evidence } from "../shared/types";

const skipLabelPattern = /^skip\s+(ad|advertisement)$/i;
const adPlayingLabelPattern = /^Ad playing\. Content resumes in /i;

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
    const observedAt = Date.now();
    const adIndicator = this.findAdIndicator(root);
    const control = this.findVerifiedSkipControl(root);
    const evidence: Evidence[] = [];

    if (adIndicator) {
      evidence.push({
        id: "prime-video-ad-playing-indicator",
        kind: "dom-label",
        detail: "Prime Video exposes an accessible Ad playing status with a remaining-time indicator",
        confirmed: true,
        observedAt
      });
    }

    if (control) {
      evidence.push({
        id: "prime-video-skip-ad-control",
        kind: "dom-label",
        detail: "Visible enabled control has an exact Skip Ad label",
        confirmed: true,
        observedAt
      });
    }

    return {
      classification: adIndicator ? "advertisement" : "unknown",
      confidence: adIndicator ? 1 : 0,
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

  private findAdIndicator(root: ParentNode): HTMLElement | null {
    const labelled = Array.from(root.querySelectorAll<HTMLElement>("[aria-label]")).find(
      (element) => adPlayingLabelPattern.test(element.getAttribute("aria-label") ?? "")
    );
    if (labelled && this.isPresent(labelled)) return labelled;

    const timer = root.querySelector<HTMLElement>(".atvwebplayersdk-ad-timer-remaining-time");
    return timer && this.isPresent(timer) ? timer : null;
  }

  private isPresent(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return (
      element.isConnected &&
      style.visibility !== "hidden" &&
      style.display !== "none" &&
      !element.hasAttribute("hidden")
    );
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
