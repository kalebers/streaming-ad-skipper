import { describe, expect, it } from "vitest";
import { PrimeVideoAdapter } from "./prime-video";

describe("PrimeVideoAdapter", () => {
  const adapter = new PrimeVideoAdapter();

  it("matches only the verified Prime Video hostnames", () => {
    expect(adapter.matches(new URL("https://www.primevideo.com/detail/abc"))).toBe(true);
    expect(adapter.matches(new URL("https://primevideo.com/"))).toBe(true);
    expect(adapter.matches(new URL("https://example.com/"))).toBe(false);
    expect(adapter.matches(new URL("https://notprimevideo.com/"))).toBe(false);
  });

  it("does not classify a player without verified evidence", () => {
    const video = document.createElement("video");
    const result = adapter.classify(document, video);
    expect(result.classification).toBe("unknown");
    expect(result.confidence).toBe(0);
    expect(result.evidence).toHaveLength(0);
  });
});
