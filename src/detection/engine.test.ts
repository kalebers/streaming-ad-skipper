import { describe, expect, it, vi } from "vitest";
import { DetectionEngine } from "./engine";
import type { StreamingAdapter } from "../adapters/types";

describe("DetectionEngine", () => {
  it("resets prior evidence when a player session changes", () => {
    const adapter: StreamingAdapter = {
      id: "prime-video",
      displayName: "Prime Video",
      matches: () => true,
      findPlayer: () => null,
      classify: () => ({
        classification: "unknown",
        confidence: 0,
        evidence: [
          {
            id: "unverified-signal",
            kind: "dom-label",
            detail: "test",
            confirmed: false,
            observedAt: Date.now()
          }
        ],
        observedAt: Date.now()
      }),
      findVerifiedSkipControl: () => null,
      cleanup: vi.fn()
    };
    const engine = new DetectionEngine(adapter);
    const first = engine.observe(document, document.createElement("video"));
    expect(first.evidence).toHaveLength(1);
    engine.reset();
    expect(engine.observe(document, document.createElement("video")).evidence).toHaveLength(1);
  });
});
