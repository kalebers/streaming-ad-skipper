chrome.runtime.onInstalled.addListener(() => {
  void chrome.storage.local.get("settings").then((settings) => {
    if (!settings.settings) {
      return chrome.storage.local.set({
        settings: {
          enabled: true,
          services: { primeVideo: true },
          automaticSkip: true,
          muteDuringAds: false,
          diagnostics: false
        }
      });
    }
    return undefined;
  });
});
