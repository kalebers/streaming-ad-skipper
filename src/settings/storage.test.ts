import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS } from "../shared/types";
import { validateSettings } from "./storage";

describe("validateSettings", () => {
  it("uses defaults for missing and invalid values", () => {
    expect(validateSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(validateSettings({ enabled: "yes", services: { primeVideo: 1 } })).toEqual(
      DEFAULT_SETTINGS
    );
  });

  it("preserves valid values while filling missing fields", () => {
    expect(validateSettings({ enabled: false, diagnostics: true })).toEqual({
      ...DEFAULT_SETTINGS,
      enabled: false,
      diagnostics: true
    });
  });
});
