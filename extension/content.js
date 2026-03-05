(() => {
  let enabled = false;
  let activeColor = "yellow";
  let toast = null;
  let tooltip = null;
  let pendingText = "";
  let pendingRange = null;
  let ytWrap = null;

  // ---- Skip on NoteCrate app pages ----
  const host = window.location.hostname;
  if (host === "localhost" || host.includes("notecrate")) return;

  // ---- Init ----
  chrome.storage.local.get(["highlightingActive", "activeColor"], (result) => {
    enabled = result.highlightingActive || false;
    activeColor = result.activeColor || "yellow";
    if (enabled) startListening();
    if (isYouTubeWatch()) ytInit();
  });

  // ---- Messages from background/sidepanel ----
  chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
    if (msg.action === "toggle-highlighting") {
      enabled = msg.active;
      if (enabled) startListening();
      else stopListening();
      ytUpdateVisibility();
    }
    if (msg.action === "set-color") {
      activeColor = msg.color;
    }
    if (msg.action === "get-yt-time") {
      const video = document.querySelector("video");
      sendResponse({ timestamp: video ? formatTime(Math.floor(video.currentTime)) : "0:00" });
      return true;
    }
  });

  // ============================================================
  //  TEXT HIGHLIGHTING
  // ============================================================

  function startListening() {
    document.addEventListener("mouseup", onMouseUp);
  }

  function stopListening() {
    document.removeEventListener("mouseup", onMouseUp);
    hideTooltip();
  }

  function onMouseUp(e) {
    if (e.target.closest && (e.target.closest(".nc-tooltip") || e.target.closest(".nc-yt-wrap"))) return;
    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();
      if (!text || text.length < 2) { hideTooltip(); return; }
      pendingText = text;
      try { pendingRange = selection.getRangeAt(0).cloneRange(); } catch (_) { pendingRange = null; }
      showTooltip(selection);
    }, 10);
  }

  // ---- Tooltip ----
  function showTooltip(selection) {
    hideTooltip();
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const colorHex = { yellow: "#fbbf24", blue: "#38bdf8", pink: "#fb7185", green: "#34d399", orange: "#fb923c" };

    tooltip = document.createElement("div");
    tooltip.className = "nc-tooltip";
    tooltip.innerHTML = `
      <button class="nc-tooltip-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m9 11-6 6v3h9l3-3"/>
          <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>
        </svg>
        <span class="nc-tooltip-dot" style="background:${colorHex[activeColor] || "#fbbf24"}"></span>
        Save
      </button>
    `;
    document.body.appendChild(tooltip);

    const ttRect = tooltip.getBoundingClientRect();
    let left = rect.left + rect.width / 2 - ttRect.width / 2 + window.scrollX;
    let top = rect.top - ttRect.height - 8 + window.scrollY;
    if (top - window.scrollY < 4) top = rect.bottom + 8 + window.scrollY;

    tooltip.style.left = Math.max(4, left) + "px";
    tooltip.style.top = Math.max(4, top) + "px";

    requestAnimationFrame(() => {
      requestAnimationFrame(() => { if (tooltip) tooltip.classList.add("show"); });
    });

    tooltip.querySelector(".nc-tooltip-btn").addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (pendingRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(pendingRange);
        saveSelection(pendingText, sel);
      }
      hideTooltip();
    });
  }

  function hideTooltip() {
    if (tooltip) { tooltip.remove(); tooltip = null; }
    pendingText = "";
    pendingRange = null;
  }

  document.addEventListener("mousedown", (e) => {
    if (tooltip && !(e.target.closest && e.target.closest(".nc-tooltip"))) {
      setTimeout(() => hideTooltip(), 80);
    }
  });

  document.addEventListener("scroll", () => { if (tooltip) hideTooltip(); }, true);

  // ---- Save selection ----
  function saveSelection(text, selection) {
    try {
      const range = selection.getRangeAt(0);
      const mark = document.createElement("span");
      mark.className = "notecrate-mark nc-" + activeColor;
      range.surroundContents(mark);
    } catch (_) {}

    selection.removeAllRanges();

    const data = {
      text,
      sourceTitle: document.title.replace(" - YouTube", ""),
      sourceUrl: window.location.href,
      type: "text",
    };

    if (isYouTubeWatch()) {
      const video = document.querySelector("video");
      const videoId = new URLSearchParams(window.location.search).get("v");
      data.videoId = videoId;
      data.videoTimestamp = video ? formatTime(Math.floor(video.currentTime)) : "0:00";
      data.type = "video";
    }

    chrome.runtime.sendMessage({ action: "save-highlight", data });
    showToast("Saved to NoteCrate");
  }

  // ============================================================
  //  YOUTUBE CLIP BUTTON
  // ============================================================

  function isYouTubeWatch() {
    return window.location.hostname.includes("youtube.com") &&
      window.location.pathname.startsWith("/watch");
  }

  function ytUpdateVisibility() {
    if (!ytWrap) return;
    ytWrap.style.display = enabled ? "" : "none";
  }

  function ytInit() {
    function tryMount() {
      const player = document.querySelector("#movie_player");
      if (player) {
        mountYtButton(player);
      } else {
        setTimeout(tryMount, 500);
      }
    }
    tryMount();
  }

  function mountYtButton(player) {
    if (ytWrap) return;

    if (window.getComputedStyle(player).position === "static") {
      player.style.position = "relative";
    }

    ytWrap = document.createElement("div");
    ytWrap.className = "nc-yt-wrap";
    ytWrap.style.position = "absolute";
    ytWrap.style.top = "12px";
    ytWrap.style.right = "12px";
    ytWrap.style.zIndex = "999";

    ytWrap.innerHTML = `
      <button class="nc-yt-btn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
        </svg>
        Save clip
      </button>
    `;

    player.appendChild(ytWrap);
    ytUpdateVisibility();

    ytWrap.querySelector(".nc-yt-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();

      const video = document.querySelector("video");
      const currentTime = video ? Math.floor(video.currentTime) : 0;
      const videoId = new URLSearchParams(window.location.search).get("v");
      const title = document.title.replace(" - YouTube", "").trim();
      const timestamp = formatTime(currentTime);

      chrome.runtime.sendMessage({
        action: "save-highlight",
        data: {
          text: `${title} (at ${timestamp})`,
          sourceTitle: title,
          sourceUrl: window.location.href,
          type: "video",
          videoId,
          videoTimestamp: timestamp,
        },
      });

      showToast(`Clip saved at ${timestamp}`);
      const btn = ytWrap.querySelector(".nc-yt-btn");
      btn.classList.add("nc-yt-btn-pressed");
      setTimeout(() => btn.classList.remove("nc-yt-btn-pressed"), 200);
    });
  }

  // ---- YouTube SPA navigation watcher ----
  // YouTube is a SPA — navigating between pages doesn't reload the content script.
  // Watch for URL changes and mount/unmount the clip button accordingly.
  let lastUrl = window.location.href;
  const urlObserver = new MutationObserver(() => {
    const currentUrl = window.location.href;
    if (currentUrl === lastUrl) return;
    lastUrl = currentUrl;

    if (isYouTubeWatch()) {
      // Navigated to a watch page — mount button after player loads
      ytWrap = null; // reset so mountYtButton runs again
      ytInit();
    } else {
      // Navigated away from a watch page — remove button
      if (ytWrap) { ytWrap.remove(); ytWrap = null; }
    }
  });

  if (window.location.hostname.includes("youtube.com")) {
    urlObserver.observe(document.querySelector("title") || document.documentElement, {
      subtree: true,
      childList: true,
    });
  }

  // ============================================================
  //  TOAST
  // ============================================================

  function showToast(message) {
    if (toast) toast.remove();
    toast = document.createElement("div");
    toast.className = "notecrate-toast";
    toast.innerHTML = `<div class="notecrate-toast-dot ${activeColor}"></div><span>${message}</span>`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { if (toast) toast.classList.add("show"); });
    });
    setTimeout(() => {
      if (toast) {
        toast.classList.remove("show");
        setTimeout(() => { if (toast) { toast.remove(); toast = null; } }, 250);
      }
    }, 2000);
  }

  // ============================================================
  //  UTILS
  // ============================================================

  function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }
})();
