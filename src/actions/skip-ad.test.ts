import { describe, expect, it } from "vitest";
import { isSafeSkipControl } from "./skip-ad";

describe("isSafeSkipControl", () => {
  it("rejects absent, disabled, hidden, and non-visible controls", () => {
    expect(isSafeSkipControl(null)).toBe(false);
    const button = document.createElement("button");
    document.body.append(button);
    expect(isSafeSkipControl({ element: button, label: "Skip ad" })).toBe(false);
    button.disabled = true;
    expect(isSafeSkipControl({ element: button, label: "Skip ad" })).toBe(false);
  });
});
