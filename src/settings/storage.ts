import { DEFAULT_SETTINGS, type Settings } from "../shared/types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export function validateSettings(value: unknown): Settings {
  if (!isRecord(value)) return structuredClone(DEFAULT_SETTINGS);
  const services = isRecord(value.services) ? value.services : {};
  return {
    enabled: typeof value.enabled === "boolean" ? value.enabled : DEFAULT_SETTINGS.enabled,
    services: {
      primeVideo:
        typeof services.primeVideo === "boolean"
          ? services.primeVideo
          : DEFAULT_SETTINGS.services.primeVideo
    },
    automaticSkip:
      typeof value.automaticSkip === "boolean"
        ? value.automaticSkip
        : DEFAULT_SETTINGS.automaticSkip,
    muteDuringAds:
      typeof value.muteDuringAds === "boolean"
        ? value.muteDuringAds
        : DEFAULT_SETTINGS.muteDuringAds,
    diagnostics:
      typeof value.diagnostics === "boolean" ? value.diagnostics : DEFAULT_SETTINGS.diagnostics
  };
}

export async function loadSettings(): Promise<Settings> {
  const stored = await chrome.storage.local.get("settings");
  return validateSettings(stored.settings);
}

export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.local.set({ settings: validateSettings(settings) });
}
