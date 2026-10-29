import type { StreamingAdapter } from "../adapters/types";
import type { ClassificationResult, Evidence } from "../shared/types";

const evidenceTtlMs = 30_000;

export class DetectionEngine {
  private readonly evidence: Evidence[] = [];
  private result: ClassificationResult = {
    classification: "unknown",
    confidence: 0,
    evidence: [],
    observedAt: Date.now()
  };

  constructor(private readonly adapter: StreamingAdapter) {}

  observe(root: ParentNode, video: HTMLVideoElement): ClassificationResult {
    const now = Date.now();
    this.evidence.splice(0, this.evidence.length, ...this.evidence.filter((item) => now - item.observedAt <= evidenceTtlMs));
    const next = this.adapter.classify(root, video);
    this.evidence.push(...next.evidence);
    this.result = { ...next, evidence: [...this.evidence], observedAt: now };
    return this.result;
  }

  reset(): void {
    this.evidence.length = 0;
    this.result = { classification: "unknown", confidence: 0, evidence: [], observedAt: Date.now() };
  }
}
