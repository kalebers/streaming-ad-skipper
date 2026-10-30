import { beforeEach, describe, expect, it, vi } from "vitest";
import { PrimeVideoAdapter } from "./prime-video";

describe("PrimeVideoAdapter", () => {
  const adapter = new PrimeVideoAdapter();

  beforeEach(() => {
    document.body.innerHTML = "";
  });

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

  it("classifies an exact visible Skip Ad control as an advertisement", () => {
    const button = document.createElement("button");
    button.setAttribute("aria-label", "Skip Ad");
    document.body.append(button);
    vi.spyOn(button, "getBoundingClientRect").mockReturnValue({
      width: 100,
      height: 30,
      top: 0,
      left: 0,
      right: 100,
      bottom: 30,
      x: 0,
      y: 0,
      toJSON: () => ({})
    });

    const result = adapter.classify(document, document.createElement("video"));

    expect(result.classification).toBe("advertisement");
    expect(result.evidence[0]?.confirmed).toBe(true);
  });

  it("does not match ordinary controls with similar text", () => {
    const button = document.createElement("button");
    button.textContent = "Skip intro";
    document.body.append(button);

    expect(adapter.findVerifiedSkipControl(document)).toBeNull();
  });
});
