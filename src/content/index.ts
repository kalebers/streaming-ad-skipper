import { adapterFor } from "../adapters/registry";
import { DetectionEngine } from "../detection/engine";
import {
  muteForAdvertisement,
  restoreAfterAdvertisement,
  type AudioMuteState
} from "../actions/mute-during-ad";
import { activateSkipControl } from "../actions/skip-ad";
import { recordDiagnostic } from "../shared/logger";
import type { Settings } from "../shared/types";

const defaultSettings: Settings = {
  enabled: true,
  services: { primeVideo: true },
  automaticSkip: true,
  muteDuringAds: false,
  diagnostics: false
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function validateContentSettings(value: unknown): Settings {
  if (!isRecord(value)) return structuredClone(defaultSettings);
  const services = isRecord(value.services) ? value.services : {};
  return {
    enabled: typeof value.enabled === "boolean" ? value.enabled : defaultSettings.enabled,
    services: {
      primeVideo:
        typeof services.primeVideo === "boolean"
          ? services.primeVideo
          : defaultSettings.services.primeVideo
    },
    automaticSkip:
      typeof value.automaticSkip === "boolean"
        ? value.automaticSkip
        : defaultSettings.automaticSkip,
    muteDuringAds:
      typeof value.muteDuringAds === "boolean"
        ? value.muteDuringAds
        : defaultSettings.muteDuringAds,
    diagnostics:
      typeof value.diagnostics === "boolean" ? value.diagnostics : defaultSettings.diagnostics
  };
}

async function loadContentSettings(): Promise<Settings> {
  const stored = await chrome.storage.local.get("settings");
  return validateContentSettings(stored.settings);
}

async function bootstrap(): Promise<void> {
  const adapter = adapterFor(new URL(window.location.href));
  if (!adapter) return;
  const settings = await loadContentSettings();
  if (!settings.enabled || !settings.services.primeVideo) return;
  const engine = new DetectionEngine(adapter);
  let currentVideo: HTMLVideoElement | null = null;
  let observer: MutationObserver | undefined;
  let interval: number | undefined;
  let lastSkipAt = 0;
  let mutedVideo: HTMLVideoElement | null = null;
  const audioState: AudioMuteState = { previousMuted: null };
  const log = (entry: Parameters<typeof recordDiagnostic>[0]): void => {
    if (settings.diagnostics) recordDiagnostic(entry);
  };

  const inspect = (): void => {
    const video = adapter.findPlayer(document);
    if (!video) {
      restoreAfterAdvertisement(mutedVideo, audioState);
      mutedVideo = null;
      log({
        timestamp: Date.now(), adapter: adapter.id, playerAvailable: false,
        classification: "unknown", confidence: 0, evidenceIds: [], action: "none",
        result: "not-attempted", reason: "player-unavailable"
      });
      return;
    }
    if (video !== currentVideo) {
      restoreAfterAdvertisement(mutedVideo, audioState);
      currentVideo = video;
      mutedVideo = null;
      engine.reset();
    }
    const result = engine.observe(document, video);
    const confirmedAd =
      result.classification === "advertisement" &&
      result.evidence.some((item) => item.confirmed);
    if (settings.muteDuringAds && confirmedAd) {
      mutedVideo = video;
      muteForAdvertisement(video, audioState);
    } else if (!confirmedAd) {
      restoreAfterAdvertisement(mutedVideo, audioState);
      mutedVideo = null;
    }
    const shouldSkip =
      settings.automaticSkip &&
      confirmedAd &&
      Date.now() - lastSkipAt >= 3_000;
    const skipControl = shouldSkip ? adapter.findVerifiedSkipControl(document) : null;
    const skipped = shouldSkip && activateSkipControl(skipControl);
    if (skipped) lastSkipAt = Date.now();
    log({
      timestamp: Date.now(), adapter: adapter.id, playerAvailable: true,
      classification: result.classification, confidence: result.confidence,
      evidenceIds: result.evidence.map((item) => item.id),
      action: skipped
        ? "activate-skip-ad"
        : settings.muteDuringAds && confirmedAd
          ? "mute-during-ad"
          : "none",
      result: skipped
        ? "activated"
        : settings.muteDuringAds && confirmedAd
          ? "muted"
          : "not-attempted",
      ...(!skipped && !(settings.muteDuringAds && confirmedAd)
        ? { reason: "no-verified-skip-control" }
        : {})
    });
  };

  observer = new MutationObserver(inspect);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
  interval = window.setInterval(inspect, 2_000);
  inspect();
  window.addEventListener("pagehide", () => {
    observer?.disconnect();
    if (interval !== undefined) window.clearInterval(interval);
    restoreAfterAdvertisement(mutedVideo, audioState);
    adapter.cleanup();
  }, { once: true });
}

void bootstrap();
