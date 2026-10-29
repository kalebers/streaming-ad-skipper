import { adapterFor } from "../adapters/registry";
import { DetectionEngine } from "../detection/engine";
import { loadSettings } from "../settings/storage";
import { recordDiagnostic } from "../shared/logger";

async function bootstrap(): Promise<void> {
  const adapter = adapterFor(new URL(window.location.href));
  if (!adapter) return;
  const settings = await loadSettings();
  if (!settings.enabled || !settings.services.primeVideo) return;
  const engine = new DetectionEngine(adapter);
  let currentVideo: HTMLVideoElement | null = null;
  let observer: MutationObserver | undefined;
  let interval: number | undefined;
  const log = (entry: Parameters<typeof recordDiagnostic>[0]): void => {
    if (settings.diagnostics) recordDiagnostic(entry);
  };

  const inspect = (): void => {
    const video = adapter.findPlayer(document);
    if (!video) {
      log({
        timestamp: Date.now(), adapter: adapter.id, playerAvailable: false,
        classification: "unknown", confidence: 0, evidenceIds: [], action: "none",
        result: "not-attempted", reason: "player-unavailable"
      });
      return;
    }
    if (video !== currentVideo) {
      currentVideo = video;
      engine.reset();
    }
    const result = engine.observe(document, video);
    log({
      timestamp: Date.now(), adapter: adapter.id, playerAvailable: true,
      classification: result.classification, confidence: result.confidence,
      evidenceIds: result.evidence.map((item) => item.id), action: "none",
      result: "not-attempted", reason: "no-verified-ad-signal"
    });
  };

  observer = new MutationObserver(inspect);
  observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true });
  interval = window.setInterval(inspect, 2_000);
  inspect();
  window.addEventListener("pagehide", () => {
    observer?.disconnect();
    if (interval !== undefined) window.clearInterval(interval);
    adapter.cleanup();
  }, { once: true });
}

void bootstrap();
