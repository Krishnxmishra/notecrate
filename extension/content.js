(() => {
  if (window.self !== window.top) return;
  if (location.hostname === "localhost" || location.hostname.includes("notecrate")) return;

  let activeColor = "yellow";
  let extensionActive = false;
  let tooltip = null, ytWrap = null;
  let pendingText = "", pendingRange = null;
  let activeMark = null;

  // ---- Boot: get state, inject persisted marks, set up YT ----
  let fetchAndReinject = null;
  let cachedHighlights = [];

  chrome.storage.local.get(["activeColor", "highlightingActive"], (r) => {
    activeColor = r.activeColor || "yellow";
    extensionActive = !!r.highlightingActive;

    // Apply toggle immediately — no network needed, just storage
    applyToggleState();

    if (isYTWatch()) ytInit();

    // Best-effort: re-inject persisted marks from Supabase (needs SW awake)
    // Retry once if SW was sleeping on first try
    fetchAndReinject = function (attempt) {
      chrome.runtime.sendMessage({ action: "get-state" }, (result) => {
        if (chrome.runtime.lastError) {
          if (attempt < 2) setTimeout(() => fetchAndReinject(attempt + 1), 1500);
          return;
        }
        if (result?.highlights) {
          cachedHighlights = result.highlights;
          reinjectMarks(result.highlights);
          applyToggleState();
        }
      });
    };
    fetchAndReinject(1);
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (changes.activeColor) activeColor = changes.activeColor.newValue;
    if (changes.highlightingActive) {
      extensionActive = changes.highlightingActive.newValue;
      applyToggleState();
    }
  });

  // ---- URL fingerprint: strips session-volatile params so highlights survive page reloads ----
  function urlFingerprint(url) {
    try {
      const u = new URL(url);
      // Google Search: only retain the search query `q=`
      if ((u.hostname.includes("google.") || u.hostname.includes("bing.")) && u.pathname === "/search") {
        const q = u.searchParams.get("q");
        return u.origin + u.pathname + (q ? "?q=" + encodeURIComponent(q) : "");
      }
      // YouTube: retain video ID
      if (u.hostname.includes("youtube.com") || u.hostname === "youtu.be") {
        const v = u.searchParams.get("v");
        return u.origin + u.pathname + (v ? "?v=" + v : "");
      }
      // Generic: sort all params so order differences don't break matching
      const params = [...u.searchParams.entries()].sort((a, b) => a[0].localeCompare(b[0]));
      return u.origin + u.pathname + (params.length ? "?" + params.map(([k, v]) => k + "=" + v).join("&") : "");
    } catch { return url; }
  }

  // ---- Persist marks across reload ----
  function reinjectMarks(highlights) {
    const currentFingerprint = urlFingerprint(location.href.split("#")[0]);
    const pageHighlights = highlights.filter(
      (h) => h.sourceUrl && urlFingerprint(h.sourceUrl.split("#")[0]) === currentFingerprint && h.type === "text" && h.text && h.text.length > 1
    );
    if (!pageHighlights.length) return;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => doReinject(pageHighlights));
    } else {
      doReinject(pageHighlights);
    }
  }

  function doReinject(pageHighlights) {
    if (!pageHighlights.length) return;

    // De-duplicate highlights to prevent double injections
    const existing = document.querySelectorAll(".notecrate-mark[data-nc-persisted='1']");
    const existingTexts = Array.from(existing).map(el => el.textContent.replace(/[\s\u200B-\u200D\uFEFF]+/g, ""));
    const toInject = pageHighlights.filter(h => !existingTexts.includes(h.text.replace(/[\s\u200B-\u200D\uFEFF]+/g, "")));
    if (!toInject.length) return;

    // Track newly injected strings locally so two highlights with the EXACT SAME text block don't double loop
    const injectedThisPass = new Set();

    for (const h of toInject) {
      if (!h.text || h.text.length < 2) continue;
      const strippedH = h.text.replace(/[\s\u200B-\u200D\uFEFF]+/g, "");
      if (!strippedH || injectedThisPass.has(strippedH)) continue;

      injectedThisPass.add(strippedH);

      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName;
          if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
          if (parent.closest && parent.closest(".notecrate-mark")) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      });

      // Streaming Text Matcher (O(1) Memory sliding window)
      let buffer = "";
      let nodes = [];
      let found = false;
      let node;

      while ((node = walker.nextNode())) {
        const text = node.textContent;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (!/[\s\u200B-\u200D\uFEFF]/.test(char)) {
            buffer += char;
            nodes.push({ node, offset: i });

            if (buffer.length > strippedH.length) {
              buffer = buffer.substring(1);
              nodes.shift();
            }

            if (buffer === strippedH) {
              try {
                const startMapping = nodes[0];
                const endMapping = nodes[nodes.length - 1];

                const range = document.createRange();
                range.setStart(startMapping.node, startMapping.offset);
                range.setEnd(endMapping.node, endMapping.offset + 1);

                const marks = wrapRangeWithMark(range, h.color || "yellow");
                marks.forEach(m => {
                  m.setAttribute("data-nc-persisted", "1");
                  m.setAttribute("data-nc-id", h.id); // Add tracking ID for realtime deletions
                  if (!extensionActive) m.classList.add("nc-hidden");
                });
                found = true;
              } catch (e) {
                console.warn("[NC] Could not reinject bounds:", e);
              }
              break;
            }
          }
        }
        if (found) break; // Move to next highlight 
      }
    }
  }

  // ---- Toggle: show/hide all extension-injected UI ----
  function applyToggleState() {
    // All highlight marks: toggle CSS class (preserves text layout, no reflow)
    document.querySelectorAll(".notecrate-mark").forEach((el) => {
      el.classList.toggle("nc-hidden", !extensionActive);
    });

    // YouTube clip button
    if (ytWrap) ytWrap.style.display = extensionActive ? "block" : "none";

    // Hide tooltip if toggled off mid-selection
    if (!extensionActive) {
      hideTooltip();
      clearOptimisticMark();
    }
  }

  // ---- Selection / tooltip ----
  document.addEventListener("selectionchange", () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      if (!activeMark) hideTooltip();
    }
  });

  document.addEventListener("mouseup", (e) => {
    if (!extensionActive) return;
    if (e.target.closest?.(".nc-tooltip") || e.target.closest?.(".nc-yt-wrap")) return;

    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel?.toString().trim();

      if (!text || text.length < 2) {
        if (!activeMark) hideTooltip();
        return;
      }

      pendingText = text;
      try { pendingRange = sel.getRangeAt(0).cloneRange(); } catch (_) { pendingRange = null; }
      showTooltip(sel);
    }, 10);
  }, true);

  document.addEventListener("mousedown", (e) => {
    if (!e.target.closest?.(".nc-tooltip")) {
      clearOptimisticMark();
      hideTooltip();
    }
  }, true);

  function showTooltip(sel) {
    hideTooltip();
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const dot = { yellow: "#fde047", blue: "#7dd3fc", pink: "#fda4af", green: "#6ee7b7", orange: "#fdba74" }[activeColor] || "#fde047";

    tooltip = document.createElement("div");
    tooltip.className = "nc-tooltip";
    Object.assign(tooltip.style, {
      position: "fixed",
      backgroundColor: "#171717",
      color: "#fff",
      padding: "6px 12px",
      borderRadius: "6px",
      fontSize: "13px",
      fontFamily: "system-ui, sans-serif",
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), 0 0 0 1px rgba(255,255,255,0.1)",
      zIndex: "2147483647",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      opacity: "0",
      transform: "translateY(5px)",
      transition: "opacity 0.15s ease, transform 0.15s ease",
      userSelect: "none"
    });

    tooltip.innerHTML = `
      <div style="width:8px;height:8px;border-radius:50%;background:${dot};"></div>
      <span style="font-weight:500;">Save Selection</span>
    `;

    document.body.appendChild(tooltip);

    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    let left = rect.left + (rect.width / 2) - (tw / 2);
    let top = rect.top - th - 8;
    if (top < 0) top = rect.bottom + 8;
    if (left < 4) left = 4;
    if (left + tw > window.innerWidth - 4) left = window.innerWidth - tw - 4;
    tooltip.style.left = left + "px";
    tooltip.style.top = top + "px";

    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (tooltip) { tooltip.style.opacity = "1"; tooltip.style.transform = "translateY(0)"; }
    }));

    tooltip.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const textToSave = pendingText;
      const rangeToSave = pendingRange;
      hideTooltip();
      if (textToSave) doSave(textToSave, rangeToSave);
    });
  }

  function hideTooltip() {
    if (tooltip) { tooltip.remove(); tooltip = null; }
  }

  function clearOptimisticMark() {
    if (activeMark && activeMark.parentNode) {
      const parent = activeMark.parentNode;
      while (activeMark.firstChild) parent.insertBefore(activeMark.firstChild, activeMark);
      parent.removeChild(activeMark);
    }
    activeMark = null;
    pendingText = "";
    pendingRange = null;
  }

  // ---- Multiline-safe highlight wrap ----
  function wrapRangeWithMark(range, color) {
    const bgMap = {
      yellow: "rgba(253, 224, 71, 0.4)", blue: "rgba(125, 211, 252, 0.4)",
      pink: "rgba(253, 164, 175, 0.4)", green: "rgba(110, 231, 183, 0.4)",
      orange: "rgba(253, 186, 116, 0.4)"
    };
    const bg = bgMap[color] || bgMap.yellow;

    // Simple case: same text node
    try {
      if (range.startContainer === range.endContainer && range.startContainer.nodeType === Node.TEXT_NODE) {
        const mark = document.createElement("mark");
        mark.className = "notecrate-mark nc-" + color;
        mark.style.cssText = `background:${bg};border-radius:2px;padding:1px 0;box-decoration-break:clone;-webkit-box-decoration-break:clone;color:inherit;`;
        range.surroundContents(mark);
        return [mark];
      }
    } catch (_) { }

    const walker = document.createTreeWalker(range.commonAncestorContainer, NodeFilter.SHOW_TEXT);
    let startNode = range.startContainer;

    // Jump walker to the nearest text node inside startContainer
    if (startNode.nodeType !== Node.TEXT_NODE) {
      walker.currentNode = startNode;
      startNode = walker.nextNode() || startNode;
    }
    walker.currentNode = startNode;

    const nodes = [];
    if (startNode.nodeType === Node.TEXT_NODE) {
      try {
        if (range.comparePoint(startNode, startNode.length) !== -1 && range.comparePoint(startNode, 0) !== 1) {
          nodes.push(startNode);
        }
      } catch (e) { }
    }

    let node;
    while ((node = walker.nextNode())) {
      try {
        const compStart = range.comparePoint(node, node.length);
        if (compStart === -1) continue; // Note is completely before range

        const compEnd = range.comparePoint(node, 0);
        if (compEnd === 1) break; // Node is completely after range (we are done)

        nodes.push(node);
      } catch (e) {
        break;
      }
    }

    const marks = [];
    for (const n of nodes) {
      const nodeRange = document.createRange();
      try {
        nodeRange.selectNodeContents(n);
        if (n === range.startContainer) nodeRange.setStart(n, range.startOffset);
        if (n === range.endContainer) nodeRange.setEnd(n, range.endOffset);

        if (nodeRange.startOffset === nodeRange.endOffset) continue; // Skip empty segments

        const mark = document.createElement("mark");
        mark.className = "notecrate-mark nc-" + color;
        mark.style.cssText = `background:${bg};border-radius:2px;padding:1px 0;box-decoration-break:clone;-webkit-box-decoration-break:clone;color:inherit;`;
        nodeRange.surroundContents(mark);
        marks.push(mark);
      } catch (e) {
        // Cross-element bounds or DOM constraints prevent wrap on this segment, skip
      }
    }
    return marks;
  }

  function doSave(text, range) {
    let marks = [];
    if (range) {
      try {
        marks = wrapRangeWithMark(range, activeColor);
        activeMark = marks[0] || null;
        window.getSelection().removeAllRanges();
      } catch (err) {
        console.warn("[NC] Could not highlight selection", err);
      }
    }

    const data = {
      text,
      sourceTitle: document.title,
      sourceUrl: location.href,
      type: "text"
    };

    if (isYTWatch()) {
      const v = document.querySelector("video");
      data.videoId = new URLSearchParams(location.search).get("v");
      const seconds = v ? Math.floor(v.currentTime) : 0;
      data.videoTimestamp = fmt(seconds);

      // Update the saved URL to jump directly to this timestamp safely
      try {
        const url = new URL(location.href);
        url.searchParams.set("t", `${seconds}s`);
        data.sourceUrl = url.toString();
      } catch (e) {
        // Fallback for malformed location.href objects
        data.sourceUrl = location.href;
      }

      data.sourceTitle = document.title.replace(" - YouTube", "").trim();
      data.type = "video";
    }

    chrome.runtime.sendMessage({ action: "save-highlight", data }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("[NC] sendMessage error:", chrome.runtime.lastError.message);
        showToast("Error: Could not reach extension background.");
        removeMarks(marks); activeMark = null;
        return;
      }
      if (response?.success) {
        const id = response.highlight?.id;
        if (id) marks.forEach(m => m.setAttribute("data-nc-id", id));
        showToast("Saved to NoteCrate ✓");
        activeMark = null;
      } else {
        const err = response?.error || "Unknown error";
        showToast(err.includes("Not logged in") ? "Error: Please sign in to NoteCrate" : "Failed to save: " + err);
        removeMarks(marks); activeMark = null;
      }
    });
  }

  function removeMarks(marks) {
    marks.forEach((mark) => {
      if (mark?.parentNode) {
        const parent = mark.parentNode;
        while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
        parent.removeChild(mark);
      }
    });
  }

  // ---- Toast ----
  function showToast(msg) {
    let old = document.getElementById("nc-toast-container");
    if (old) old.remove();

    const toast = document.createElement("div");
    toast.id = "nc-toast-container";
    const dot = { yellow: "#fde047", blue: "#7dd3fc", pink: "#fda4af", green: "#6ee7b7", orange: "#fdba74" }[activeColor] || "#fde047";

    Object.assign(toast.style, {
      position: "fixed", bottom: "24px", left: "50%",
      transform: "translateX(-50%) translateY(10px)",
      backgroundColor: "#171717", color: "#fff",
      padding: "10px 16px", borderRadius: "8px", fontSize: "14px",
      fontFamily: "system-ui, sans-serif", display: "flex",
      alignItems: "center", gap: "10px",
      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1)",
      zIndex: "2147483647", opacity: "0",
      transition: "opacity 0.2s ease, transform 0.2s ease", pointerEvents: "none"
    });

    toast.innerHTML = `<div style="width:8px;height:8px;border-radius:50%;background:${dot};flex-shrink:0;"></div><span style="font-weight:400;white-space:nowrap;">${msg}</span>`;
    document.body.appendChild(toast);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      toast.style.opacity = "1"; toast.style.transform = "translateX(-50%) translateY(0)";
    }));

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(10px)";
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }

  // ---- YouTube ----
  function isYTWatch() {
    return location.hostname.includes("youtube.com") && location.pathname.startsWith("/watch");
  }

  function ytInit() {
    if (ytWrap) return;
    const iv = setInterval(() => {
      const player = document.querySelector("#movie_player");
      if (!player) return;
      clearInterval(iv);
      if (getComputedStyle(player).position === "static") player.style.position = "relative";

      ytWrap = document.createElement("div");
      ytWrap.className = "nc-yt-wrap";
      Object.assign(ytWrap.style, {
        position: "absolute", top: "12px", right: "60px",
        zIndex: "999", pointerEvents: "none",
        display: extensionActive ? "block" : "none"
      });

      ytWrap.innerHTML = `
        <button class="nc-yt-btn" style="pointer-events:auto;background:rgba(0,0,0,0.6);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:6px;padding:6px 12px;display:flex;align-items:center;gap:6px;cursor:pointer;font-family:Roboto,Arial,sans-serif;font-size:13px;backdrop-filter:blur(4px);">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          Save clip
        </button>
      `;

      player.appendChild(ytWrap);
      ytWrap.querySelector(".nc-yt-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        if (!extensionActive) return;
        const v = document.querySelector("video");
        const seconds = v ? Math.floor(v.currentTime) : 0;
        const ts = fmt(seconds);
        const title = document.title.replace(" - YouTube", "").trim();
        doSave(`${title} — ${ts}`, null);
      });
    }, 500);
    setTimeout(() => clearInterval(iv), 20000);
  }

  let lastUrl = location.href;
  let injectTimeout = null;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;

      // SPA navigation: reinject marks after a short wait for new content to render
      if (fetchAndReinject) setTimeout(() => fetchAndReinject(1), 600);

      if (isYTWatch()) {
        if (ytWrap) { ytWrap.remove(); ytWrap = null; }
        ytInit();
      } else if (ytWrap) {
        ytWrap.remove(); ytWrap = null;
      }
      return;
    }

    // Same URL mutation: retry injection for late-rendering elements (React, SPAs, Google Search)
    if (cachedHighlights.length > 0) {
      clearTimeout(injectTimeout);
      injectTimeout = setTimeout(() => reinjectMarks(cachedHighlights), 400);
    }
  }).observe(document.documentElement, { subtree: true, childList: true, characterData: true });

  chrome.runtime.onMessage.addListener((msg, _, sendResponse) => {
    if (msg.action === "get-yt-time") {
      const v = document.querySelector("video");
      sendResponse({ timestamp: v ? fmt(Math.floor(v.currentTime)) : "0:00" });
      return true;
    }
    if (msg.action === "seek-yt" && msg.timestamp) {
      const v = document.querySelector("video");
      if (v) {
        const parts = msg.timestamp.split(":").map(Number);
        const secs = parts.length === 3
          ? parts[0] * 3600 + parts[1] * 60 + parts[2]
          : parts.length === 2
          ? parts[0] * 60 + parts[1]
          : parts[0];
        v.currentTime = secs;
        v.play().catch(() => {});
      }
      sendResponse({ success: true });
      return true;
    }
    if (msg.action === "scroll-to-highlight" && msg.id) {
      const marks = Array.from(document.querySelectorAll(`.notecrate-mark[data-nc-id="${msg.id}"]`));
      if (marks.length > 0) {
        marks[0].scrollIntoView({ behavior: "smooth", block: "center" });
        // Brief flash to show which highlight was jumped to
        marks.forEach((m) => {
          m.style.transition = "outline 0.1s";
          m.style.outline = "2px solid rgba(251,191,36,0.8)";
          m.style.borderRadius = "2px";
          setTimeout(() => { m.style.outline = ""; }, 1200);
        });
      }
      sendResponse({ success: true });
      return true;
    }
    if (msg.action === "reinject-single" && msg.highlight) {
      cachedHighlights.push(msg.highlight);
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => doReinject([msg.highlight]));
      } else {
        doReinject([msg.highlight]);
      }
      sendResponse({ success: true });
      return true;
    }
    if (msg.action === "remove-single" && msg.id) {
      cachedHighlights = cachedHighlights.filter((h) => h.id !== msg.id);
      const marks = Array.from(document.querySelectorAll(`.notecrate-mark[data-nc-id="${msg.id}"]`));
      removeMarks(marks);
      sendResponse({ success: true });
      return true;
    }
  });

  function fmt(s) {
    if (isNaN(s)) return "0:00";
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h > 0
      ? `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`
      : `${m}:${String(sec).padStart(2, "0")}`;
  }

})();
