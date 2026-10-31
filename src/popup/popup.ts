import { loadSettings, saveSettings } from "../settings/storage";

const ids = ["enabled", "primeVideo", "automaticSkip", "muteDuringAds", "diagnostics"] as const;
type SettingId = (typeof ids)[number];

async function init(): Promise<void> {
  const settings = await loadSettings();
  const values: Record<SettingId, boolean> = {
    enabled: settings.enabled,
    primeVideo: settings.services.primeVideo,
    automaticSkip: settings.automaticSkip,
    muteDuringAds: settings.muteDuringAds,
    diagnostics: settings.diagnostics
  };
  for (const id of ids) {
    const input = document.getElementById(id);
    if (input instanceof HTMLInputElement) input.checked = values[id];
  }
  document.getElementById("settings-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    void saveSettings({
      enabled: getChecked("enabled"),
      services: { primeVideo: getChecked("primeVideo") },
      automaticSkip: getChecked("automaticSkip"),
      muteDuringAds: getChecked("muteDuringAds"),
      diagnostics: getChecked("diagnostics")
    }).then(() => {
      const saved = document.getElementById("saved");
      if (saved) saved.textContent = "Settings saved.";
    }).catch((error: unknown) => {
      console.error("Could not save settings:", error);
      const saved = document.getElementById("saved");
      if (saved) saved.textContent = "Could not save settings.";
    });
  });
}

function getChecked(id: SettingId): boolean {
  const input = document.getElementById(id);
  return input instanceof HTMLInputElement && input.checked;
}

void init();
