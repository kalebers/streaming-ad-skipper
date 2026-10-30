(() => {
  // Stop a previous capture session.
  if (window.__primeAdCapture?.stop) {
    window.__primeAdCapture.stop();
  }

  const capture = {
    startedAt: new Date().toISOString(),
    events: [],
    snapshots: [],
    observer: null,
    timer: null,
    stopped: false
  };

  const keywords =
    /\b(ad|ads|advert|advertisement|skip|sponsor|commercial)\b|anúncio|publicidade/i;

  const maxEvents = 3000;
  const maxSnapshots = 100;

  function log(type, data = {}) {
    if (capture.stopped || capture.events.length >= maxEvents) return;

    const entry = {
      timestamp: new Date().toISOString(),
      elapsed: Math.round(performance.now()),
      type,
      ...data
    };

    capture.events.push(entry);
    console.log("[PRIME CAPTURE]", entry);
  }

  function describe(el) {
    if (!(el instanceof Element)) return null;

    return {
      tag: el.tagName,
      id: el.id || null,
      class: typeof el.className === "string"
        ? el.className.slice(0, 300)
        : null,
      text: (el.innerText || el.textContent || "")
        .trim().slice(0, 300),
      ariaLabel: el.getAttribute("aria-label"),
      title: el.getAttribute("title"),
      role: el.getAttribute("role"),
      testId: el.getAttribute("data-testid"),
      html: el.outerHTML?.slice(0, 2000)
    };
  }

  function findCandidates(root = document) {
    const candidates = [];

    const selector = [
      "button",
      "[role='button']",
      "[aria-label]",
      "[title]",
      "[data-testid]",
      "[class]",
      "[data-a-target]"
    ].join(",");

    for (const el of root.querySelectorAll(selector)) {
      const text = [
        el.innerText,
        el.getAttribute("aria-label"),
        el.getAttribute("title"),
        el.getAttribute("data-testid"),
        el.className
      ].join(" ");

      if (keywords.test(text)) {
        candidates.push(describe(el));
      }
    }

    return candidates.slice(0, 100);
  }

  function snapshot(reason) {
    if (capture.snapshots.length >= maxSnapshots) return;

    const videos = [...document.querySelectorAll("video")].map(v => ({
      currentTime: v.currentTime,
      duration: v.duration,
      paused: v.paused,
      muted: v.muted,
      volume: v.volume,
      playbackRate: v.playbackRate,
      readyState: v.readyState,
      networkState: v.networkState,
      width: v.videoWidth,
      height: v.videoHeight,
      src: v.currentSrc
        ? new URL(v.currentSrc, location.href).origin +
          new URL(v.currentSrc, location.href).pathname
        : null
    }));

    const data = {
      timestamp: new Date().toISOString(),
      reason,
      url: location.origin + location.pathname,
      title: document.title,
      videos,
      candidates: findCandidates(),
      playerHtml: document.querySelector("video")
        ?.parentElement?.parentElement?.outerHTML?.slice(0, 30000)
    };

    capture.snapshots.push(data);
    log("SNAPSHOT", {
      reason,
      videoCount: videos.length,
      candidateCount: data.candidates.length
    });
  }

  // Observe DOM mutations.
  capture.observer = new MutationObserver(mutations => {
    const relevant = mutations.filter(m => {
      const target = m.target instanceof Element
        ? m.target
        : m.target.parentElement;

      if (!target) return false;

      const content = [
        target.textContent,
        target.getAttribute?.("aria-label"),
        target.getAttribute?.("class")
      ].join(" ");

      return keywords.test(content) ||
        [...m.addedNodes].some(n =>
          n instanceof Element &&
          keywords.test(
            n.textContent + " " +
            n.className + " " +
            n.getAttribute("aria-label")
          )
        );
    });

    if (relevant.length) {
      log("DOM_MUTATION", {
        count: relevant.length,
        changes: relevant.slice(0, 10).map(m => ({
          type: m.type,
          target: describe(
            m.target instanceof Element
              ? m.target
              : m.target.parentElement
          ),
          added: [...m.addedNodes]
            .filter(n => n instanceof Element)
            .slice(0, 5)
            .map(describe),
          removedCount: m.removedNodes.length
        }))
      });

      snapshot("Relevant DOM mutation");
    }
  });

  capture.observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: [
      "class",
      "aria-label",
      "title",
      "role",
      "data-testid",
      "data-a-target",
      "hidden"
    ],
    characterData: true
  });

  // Monitor video state.
  const videoListeners = new WeakSet();

  function attachVideoListeners() {
    document.querySelectorAll("video").forEach(video => {
      if (videoListeners.has(video)) return;
      videoListeners.add(video);

      [
        "play",
        "playing",
        "pause",
        "waiting",
        "seeking",
        "seeked",
        "ended",
        "loadedmetadata",
        "durationchange",
        "timeupdate",
        "volumechange",
        "ratechange"
      ].forEach(event => {
        video.addEventListener(event, () => {
          log("VIDEO_EVENT", {
            event,
            currentTime: video.currentTime,
            duration: video.duration,
            paused: video.paused,
            muted: video.muted,
            volume: video.volume,
            playbackRate: video.playbackRate
          });
        });
      });
    });
  }

  attachVideoListeners();

  capture.timer = setInterval(() => {
    attachVideoListeners();
  }, 1000);

  // Initial snapshot.
  snapshot("Capture started");

  capture.snapshot = reason =>
    snapshot(reason || "Manual snapshot");

  capture.export = () => {
    const blob = new Blob(
      [JSON.stringify({
        startedAt: capture.startedAt,
        events: capture.events,
        snapshots: capture.snapshots
      }, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prime-video-ad-capture.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  capture.stop = () => {
    capture.stopped = true;
    capture.observer.disconnect();
    clearInterval(capture.timer);
    console.log("Prime capture stopped.");
  };

  window.__primeAdCapture = capture;

  console.log(`
  Prime Video Ad Capture active!

  Commands:

  __primeAdCapture.snapshot("Ad started")
  __primeAdCapture.snapshot("Ad ended")
  __primeAdCapture.export()
  __primeAdCapture.stop()
  `);

})();

(() => {
  const found = [];

  function inspect(root, depth = 0) {
    if (depth > 15) return;

    root.querySelectorAll("*").forEach(el => {
      if (el.shadowRoot) {
        found.push({
          element: el.tagName,
          id: el.id,
          className: typeof el.className === "string"
            ? el.className
            : "",
          mode: el.shadowRoot.mode,
          children: el.shadowRoot.querySelectorAll("*").length
        });

        inspect(el.shadowRoot, depth + 1);
      }
    });
  }

  inspect(document);

  console.table(found);
  return found;
})();