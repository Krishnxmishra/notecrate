(() => {
  // ---- State ----
  let highlights = [];
  let folders = [];
  let activeColor = "yellow";
  let activeFolderIds = []; // multi-select: array of folder IDs
  let highlightingActive = false;
  let currentTab = "highlights";
  let currentPageUrl = "";
  let ytPollInterval = null;
  let currentUser = null;
  let currentUserName = null;
  let isDark = false;

  // ---- Elements ----
  const $ = (sel) => document.querySelector(sel);

  const toggleBtn = $("#toggleHighlight");
  const folderList = $("#folderList");
  const content = $("#content");
  const highlightTabCount = $("#highlightTabCount");
  const pageTabCount = $("#pageTabCount");
  const openAppBtn = $("#openApp");
  const colorBtns = document.querySelectorAll(".color-btn");
  const tabs = document.querySelectorAll(".tab");
  const ytBanner = $("#ytBanner");
  const ytTitle = $("#ytTitle");
  const ytTime = $("#ytTime");
  const saveClipBtn = $("#saveClipBtn");
  const newFolderBtn = $("#newFolderBtn");
  const newFolderDialog = $("#newFolderDialog");
  const newFolderInput = $("#newFolderInput");
  const cancelFolder = $("#cancelFolder");
  const confirmFolder = $("#confirmFolder");
  const parentFolderSelect = $("#parentFolderSelect");

  const authScreen = $("#authScreen");
  const authEmail = $("#authEmail");
  const authPassword = $("#authPassword");
  const authSignIn = $("#authSignIn");
  const authSignUp = $("#authSignUp");
  const authError = $("#authError");
  const headerAccountName = $("#headerAccountName");

  const settingsBtn = $("#settingsBtn");
  const iconMoon = $("#iconMoon");
  const iconSun = $("#iconSun");

  // ---- Theme ----
  function initTheme() {
    try {
      const stored = localStorage.getItem("nc_ext_theme");
      isDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch (_) { isDark = false; }
    applyTheme();
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    if (iconMoon && iconSun) {
      iconMoon.style.display = isDark ? "none" : "";
      iconSun.style.display = isDark ? "" : "none";
    }
  }

  function toggleDark() {
    isDark = !isDark;
    try { localStorage.setItem("nc_ext_theme", isDark ? "dark" : "light"); } catch (_) {}
    applyTheme();
  }

  initTheme();

  // ---- Settings button = direct dark/light toggle ----
  settingsBtn.addEventListener("click", () => toggleDark());

  // ---- URL fingerprint (mirrors content.js) ----
  function urlFingerprint(url) {
    try {
      const u = new URL(url);
      if ((u.hostname.includes("google.") || u.hostname.includes("bing.")) && u.pathname === "/search") {
        const q = u.searchParams.get("q");
        return u.origin + u.pathname + (q ? "?q=" + encodeURIComponent(q) : "");
      }
      if (u.hostname.includes("youtube.com") || u.hostname === "youtu.be") {
        const v = u.searchParams.get("v");
        return u.origin + u.pathname + (v ? "?v=" + v : "");
      }
      const params = [...u.searchParams.entries()].sort((a, b) => a[0].localeCompare(b[0]));
      return u.origin + u.pathname + (params.length ? "?" + params.map(([k, v]) => k + "=" + v).join("&") : "");
    } catch { return url; }
  }

  // ---- Boot ----
  loadState();

  // ---- Background messages ----
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "highlight-saved") {
      highlights.unshift(msg.highlight);
      render();
    }
    if (msg.action === "auth-required") {
      if (authScreen.classList.contains("hidden")) showAuthScreen();
    }
    if (msg.action === "save-error") {
      showToastMsg("Failed to save — check connection");
    }
  });

  // ---- Auth UI ----

  function showAuthScreen() {
    authScreen.classList.remove("hidden");
    authError.classList.add("hidden");
    authEmail.value = "";
    authPassword.value = "";
    authEmail.focus();
  }

  function hideAuthScreen() {
    authScreen.classList.add("hidden");
  }

  function showAuthError(msg) {
    authError.textContent = msg;
    authError.classList.remove("hidden");
  }

  function updateUserBar() {
    if (currentUser) {
      const displayName = currentUserName || currentUser.email || "Account";
      headerAccountName.textContent = displayName;
      headerAccountName.title = displayName;
    } else {
      headerAccountName.textContent = "NoteCrate";
      headerAccountName.title = "NoteCrate";
    }
  }

  authSignIn.addEventListener("click", () => {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    if (!email || !password) return showAuthError("Email and password required.");

    authSignIn.disabled = true;
    authSignIn.textContent = "Signing in\u2026";
    authError.classList.add("hidden");

    chrome.runtime.sendMessage({ action: "sign-in", email, password }, (res) => {
      authSignIn.disabled = false;
      authSignIn.textContent = "Sign in";

      if (chrome.runtime.lastError) return showAuthError("Extension error \u2014 try reloading.");

      if (res?.success && res.user) {
        currentUser = res.user;
        hideAuthScreen();
        updateUserBar();
        loadState();
      } else {
        showAuthError(res?.error || "Sign in failed. Check your credentials.");
      }
    });
  });

  authSignUp.addEventListener("click", () => {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    if (!email || !password) return showAuthError("Email and password required.");
    if (password.length < 6) return showAuthError("Password must be at least 6 characters.");

    authSignUp.disabled = true;
    authSignUp.textContent = "Creating\u2026";
    authError.classList.add("hidden");

    chrome.runtime.sendMessage({ action: "sign-up", email, password }, (res) => {
      authSignUp.disabled = false;
      authSignUp.textContent = "Create account";

      if (chrome.runtime.lastError) return showAuthError("Extension error \u2014 try reloading.");

      if (res?.success) {
        if (res.user) {
          currentUser = res.user;
          hideAuthScreen();
          updateUserBar();
          loadState();
        } else {
          showAuthError("Check your email to confirm your account, then sign in.");
        }
      } else {
        showAuthError(res?.error || "Sign up failed.");
      }
    });
  });

  authPassword.addEventListener("keydown", (e) => {
    if (e.key === "Enter") authSignIn.click();
  });

  // ---- Supabase Realtime ----
  const SUPABASE_URL = "https://jlzalpnwplpkllgfyxqz.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsemFscG53cGxwa2xsZ2Z5eHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjUwNTUsImV4cCI6MjA4NjQ0MTA1NX0.WFu4wmSKUOsnh1XPR5SqLoUmLx13zbfwuiS0fVFhQ6w";
  let realtimeClient = null;
  let realtimeChannel = null;
  let realtimeConnected = false;
  let pollInterval = null;

  function setupRealtime(userId, accessToken) {
    if (!window.supabase || realtimeChannel) return;

    realtimeClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    });

    realtimeChannel = realtimeClient
      .channel("public:highlights")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "highlights",
        filter: `user_id=eq.${userId}`,
      }, handleHighlightChange)
      .on("postgres_changes", {
        event: "*", schema: "public", table: "folders",
        filter: `user_id=eq.${userId}`,
      }, handleFolderChange)
      .on("broadcast", { event: "custom-delete" }, (payload) => {
        highlights = highlights.filter((h) => h.id !== payload.payload.id);
        render();
      })
      .on("broadcast", { event: "custom-insert" }, (payload) => {
        const h = payload.payload;
        if (h && !highlights.find((x) => x.id === h.id)) {
          highlights.unshift(h);
          render();
        }
      })
      .subscribe((status) => {
        realtimeConnected = status === "SUBSCRIBED";
        if (realtimeConnected) {
          stopPoll();
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          startPoll();
        }
      });

    setTimeout(() => {
      if (!realtimeConnected) startPoll();
    }, 5000);
  }

  function teardownRealtime() {
    if (realtimeClient && realtimeChannel) {
      realtimeClient.removeChannel(realtimeChannel).catch(() => { });
    }
    realtimeClient = null;
    realtimeChannel = null;
    realtimeConnected = false;
    stopPoll();
  }

  function startPoll() {
    if (pollInterval) return;
    pollInterval = setInterval(() => {
      if (realtimeConnected) { stopPoll(); return; }
      chrome.runtime.sendMessage({ action: "get-state" }, (result) => {
        if (chrome.runtime.lastError || !result?.highlights) return;
        highlights = result.highlights;
        folders = result.folders || folders;
        renderFolderChips();
        render();
      });
    }, 15000);
  }

  function stopPoll() {
    if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
  }

  function mapHighlightRow(r) {
    return {
      id: r.id, text: r.text, sourceTitle: r.source_title, sourceUrl: r.source_url,
      color: r.color, folderId: r.folder_id, createdAt: r.created_at?.split("T")[0] || "",
      type: r.type || "text", imageUrl: r.image_url || null,
      videoId: r.video_id || null, videoTimestamp: r.video_timestamp || null,
    };
  }

  function mapFolderRow(r) {
    return { id: r.id, name: r.name, parentId: r.parent_id };
  }

  function handleHighlightChange({ eventType, new: nr, old: or }) {
    if (eventType === "INSERT") {
      if (!highlights.find((h) => h.id === nr.id)) highlights.unshift(mapHighlightRow(nr));
    } else if (eventType === "UPDATE") {
      const idx = highlights.findIndex((h) => h.id === nr.id);
      if (idx !== -1) highlights[idx] = mapHighlightRow(nr);
    } else if (eventType === "DELETE") {
      highlights = highlights.filter((h) => h.id !== or.id);
    }
    render();
  }

  function handleFolderChange({ eventType, new: nr, old: or }) {
    if (eventType === "INSERT") {
      if (!folders.find((f) => f.id === nr.id)) folders.push(mapFolderRow(nr));
    } else if (eventType === "UPDATE") {
      const idx = folders.findIndex((f) => f.id === nr.id);
      if (idx !== -1) folders[idx] = mapFolderRow(nr);
    } else if (eventType === "DELETE") {
      folders = folders.filter((f) => f.id !== or.id);
      activeFolderIds = activeFolderIds.filter((id) => id !== or.id);
      if (activeFolderIds.length === 0 && folders.length > 0) {
        activeFolderIds = [folders[0].id];
        chrome.runtime.sendMessage({ action: "set-folder", folderId: activeFolderIds[0] });
      }
    }
    renderFolderChips();
    render();
  }

  // ---- Load state from background ----

  function loadState() {
    chrome.runtime.sendMessage({ action: "get-state" }, (result) => {
      if (chrome.runtime.lastError || !result) {
        setTimeout(loadState, 500);
        return;
      }

      currentUser = result.user || null;

      if (!currentUser) {
        showAuthScreen();
        return;
      }

      currentUserName = result.userName || null;
      hideAuthScreen();
      updateUserBar();

      highlights = result.highlights || [];
      folders = result.folders || [];
      activeColor = result.activeColor || "yellow";
      // Migrate single activeFolder → activeFolderIds array
      const prevActive = result.activeFolder;
      if (prevActive && !activeFolderIds.includes(prevActive)) {
        activeFolderIds = [prevActive];
      } else if (activeFolderIds.length === 0 && folders.length > 0) {
        activeFolderIds = [folders[0].id];
      }
      highlightingActive = result.highlightingActive || false;

      toggleBtn.classList.toggle("active", highlightingActive);

      colorBtns.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.color === activeColor);
      });

      renderFolderChips();
      detectCurrentPage();
      render();

      chrome.runtime.sendMessage({ action: "get-session-tokens" }, (res) => {
        if (res?.accessToken) {
          setupRealtime(currentUser.id, res.accessToken);
        }
      });
    });
  }

  // ---- Folder list (multi-select rows) ----
  function renderFolderChips() {
    folderList.innerHTML = "";

    if (folders.length === 0) {
      folderList.innerHTML = '<span class="folder-empty-state">No folders yet</span>';
      updateParentFolderSelect();
      return;
    }

    const roots = folders.filter((f) => !f.parentId);
    const children = folders.filter((f) => f.parentId);
    const counts = {};
    highlights.forEach((h) => {
      counts[h.folderId] = (counts[h.folderId] || 0) + 1;
    });

    const ordered = [];
    roots.forEach((root) => {
      ordered.push({ folder: root, isChild: false });
      children.filter((c) => c.parentId === root.id).forEach((child) => {
        ordered.push({ folder: child, isChild: true });
      });
    });
    // Orphaned children
    children.filter((c) => !roots.find((r) => r.id === c.parentId)).forEach((child) => {
      ordered.push({ folder: child, isChild: true });
    });

    ordered.forEach(({ folder, isChild }) => {
      const selected = activeFolderIds.includes(folder.id);
      const row = document.createElement("button");
      row.className = "folder-row-item" + (isChild ? " child" : "") + (selected ? " selected" : "");
      row.dataset.id = folder.id;

      const icon = document.createElement("span");
      icon.className = "frow-icon";
      icon.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z"/></svg>`;
      row.appendChild(icon);

      const name = document.createElement("span");
      name.className = "frow-name";
      name.textContent = folder.name;
      row.appendChild(name);

      const count = document.createElement("span");
      count.className = "frow-count";
      count.textContent = String(counts[folder.id] || 0);
      row.appendChild(count);

      row.addEventListener("click", () => toggleFolder(folder.id));
      folderList.appendChild(row);
    });

    updateParentFolderSelect();
  }

  function toggleFolder(folderId) {
    if (activeFolderIds.includes(folderId)) {
      // Deselect only if there's more than one selected
      if (activeFolderIds.length > 1) {
        activeFolderIds = activeFolderIds.filter((id) => id !== folderId);
      }
    } else {
      activeFolderIds = [...activeFolderIds, folderId];
    }
    // Persist primary (first) active folder for backwards compat with background save
    chrome.runtime.sendMessage({ action: "set-folder", folderId: activeFolderIds[0] });
    renderFolderChips();
    render();
  }

  function updateParentFolderSelect() {
    parentFolderSelect.innerHTML = '<option value="">— None (root folder) —</option>';
    const roots = folders.filter((f) => !f.parentId);
    roots.forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = f.name;
      parentFolderSelect.appendChild(opt);
    });
  }

  // ---- YouTube detection ----

  function detectCurrentPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabList) => {
      if (!tabList || !tabList[0]) return;
      const tab = tabList[0];
      currentPageUrl = tab.url || "";

      if (currentPageUrl.includes("youtube.com/watch")) {
        ytBanner.classList.remove("hidden");
        ytTitle.textContent = (tab.title || "").replace(" - YouTube", "");
        startYtPoll(tab.id);
      } else {
        ytBanner.classList.add("hidden");
        stopYtPoll();
      }

      render();
    });
  }

  function startYtPoll(tabId) {
    stopYtPoll();
    ytPollInterval = setInterval(() => {
      chrome.tabs.sendMessage(tabId, { action: "get-yt-time" }, (response) => {
        if (chrome.runtime.lastError) return;
        if (response?.timestamp) ytTime.textContent = response.timestamp;
      });
    }, 1000);
  }

  function stopYtPoll() {
    if (ytPollInterval) { clearInterval(ytPollInterval); ytPollInterval = null; }
  }

  // ---- Render ----

  function render() {
    const pageFingerprint = urlFingerprint(currentPageUrl);
    const pageList = highlights.filter(
      (h) => h.sourceUrl && urlFingerprint(h.sourceUrl) === pageFingerprint
    );

    // "Folder" tab: show 5 latest from selected folder(s)
    let folderList_h;
    if (activeFolderIds.length > 0) {
      folderList_h = highlights.filter((h) => activeFolderIds.includes(h.folderId));
    } else {
      folderList_h = highlights;
    }
    const folderListTop5 = folderList_h.slice(0, 5);
    const folderTotal = folderList_h.length;

    const list = currentTab === "page" ? pageList : folderListTop5;

    highlightTabCount.textContent = folderTotal;
    pageTabCount.textContent = pageList.length;

    if (!list.length) {
      content.innerHTML = `
        <div class="empty">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="empty-icon">
            <path d="m9 11-6 6v3h9l3-3"/>
            <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>
          </svg>
          <p>${currentTab === "page" ? "No highlights on this page" : "No highlights in this folder"}</p>
          <p class="sub">Select text on any page to save</p>
        </div>
      `;
      return;
    }

    let html = list.map(cardHtml).join("");

    // Add "See all in dashboard" if there are more than 5
    if (currentTab === "highlights" && folderTotal > 5) {
      html += `
        <div class="see-all-row">
          <button class="see-all-btn" id="seeAllBtn">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            See all ${folderTotal} in dashboard
          </button>
        </div>
      `;
    }

    content.innerHTML = html;

    content.querySelectorAll(".h-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        chrome.runtime.sendMessage({ action: "delete-highlight", id }, (res) => {
          if (res?.success !== false) {
            highlights = highlights.filter((h) => h.id !== id);
            render();
            if (realtimeChannel && realtimeConnected) {
              realtimeChannel.send({ type: "broadcast", event: "custom-delete", payload: { id } });
            }
          }
        });
      });
    });

    const seeAllBtn = $("#seeAllBtn");
    if (seeAllBtn) {
      seeAllBtn.addEventListener("click", () => openWithTokens("dashboard"));
    }
  }

  function cardHtml(h) {
    const isVideo = h.type === "video" && h.videoId;
    const isImage = h.type === "image" && h.imageUrl;
    let body = "";

    if (isImage) body += `<img class="h-image" src="${esc(h.imageUrl)}" alt="Saved image" />`;
    if (h.text) body += `<div class="h-text">${esc(h.text)}</div>`;
    if (isVideo) {
      body += `
        <div class="h-video-badge">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          ${h.videoTimestamp || "0:00"}
        </div>
      `;
    }

    return `
      <div class="h-card">
        <div class="h-bar ${h.color}"></div>
        <div class="h-body">
          ${body}
          <div class="h-meta">
            <span class="h-source">${esc(h.sourceTitle)}</span>
            <span class="h-date">${h.createdAt}</span>
          </div>
        </div>
        <button class="h-delete" data-id="${h.id}" title="Delete">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    `;
  }

  function esc(str) {
    if (!str) return "";
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  function showToastMsg(text) {
    let t = $("#sp-toast");
    if (!t) {
      t = document.createElement("div");
      t.id = "sp-toast";
      t.style.cssText = "position:fixed;bottom:14px;left:50%;transform:translateX(-50%);background:var(--accent);color:var(--accent-fg);font-size:12px;padding:7px 14px;border-radius:8px;z-index:9999;opacity:0;transition:opacity 0.18s;white-space:nowrap;pointer-events:none;font-family:inherit";
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.style.opacity = "1";
    setTimeout(() => { t.style.opacity = "0"; }, 2500);
  }

  function openWithTokens(path) {
    chrome.runtime.sendMessage({ action: "get-session-tokens" }, (res) => {
      if (res?.accessToken && res?.refreshToken) {
        const url = `http://localhost:3000/auth/extension#access_token=${encodeURIComponent(res.accessToken)}&refresh_token=${encodeURIComponent(res.refreshToken)}&type=recovery&next=/${path}`;
        chrome.tabs.create({ url });
      } else {
        chrome.tabs.create({ url: `http://localhost:3000/${path}` });
      }
    });
  }

  // ---- Events ----

  toggleBtn.addEventListener("click", () => {
    highlightingActive = !highlightingActive;
    toggleBtn.classList.toggle("active", highlightingActive);
    chrome.runtime.sendMessage({ action: "toggle-highlighting", active: highlightingActive });
  });

  colorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      colorBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeColor = btn.dataset.color;
      chrome.runtime.sendMessage({ action: "set-color", color: activeColor });
    });
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentTab = tab.dataset.tab;
      render();
    });
  });

  openAppBtn.addEventListener("click", () => openWithTokens("dashboard"));

  saveClipBtn.addEventListener("click", () => {
    saveClipBtn.disabled = true;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabList) => {
      if (!tabList?.[0]) { saveClipBtn.disabled = false; return; }
      const tab = tabList[0];

      const fallbackTs = ytTime?.textContent || "0:00";
      function doSaveClip(timestamp) {
        const videoId = extractYouTubeId(tab.url);
        const title = (tab.title || "").replace(" - YouTube", "").trim();
        chrome.runtime.sendMessage({
          action: "save-highlight",
          data: {
            text: `${title} (at ${timestamp})`,
            sourceTitle: title,
            sourceUrl: tab.url,
            type: "video",
            videoId,
            videoTimestamp: timestamp,
          },
        }, (res) => {
          saveClipBtn.disabled = false;
          if (res?.success) showToastMsg("Clip saved ✓");
        });
      }

      chrome.tabs.sendMessage(tab.id, { action: "get-yt-time" }, (response) => {
        if (chrome.runtime.lastError || !response?.timestamp) {
          doSaveClip(fallbackTs);
        } else {
          doSaveClip(response.timestamp);
        }
      });
    });
  });

  newFolderBtn.addEventListener("click", () => {
    newFolderDialog.classList.remove("hidden");
    newFolderInput.value = "";
    updateParentFolderSelect();
    newFolderInput.focus();
  });

  cancelFolder.addEventListener("click", () => newFolderDialog.classList.add("hidden"));

  confirmFolder.addEventListener("click", () => {
    const name = newFolderInput.value.trim();
    if (!name) return;
    const parentId = parentFolderSelect.value || null;
    confirmFolder.disabled = true;
    chrome.runtime.sendMessage({ action: "create-folder", name, parentId }, (response) => {
      confirmFolder.disabled = false;
      if (response?.success && response.folder) {
        folders.push(response.folder);
        // Auto-select the new folder
        activeFolderIds = [...activeFolderIds, response.folder.id];
        chrome.runtime.sendMessage({ action: "set-folder", folderId: activeFolderIds[0] });
        renderFolderChips();
        render();
      }
      newFolderDialog.classList.add("hidden");
    });
  });

  newFolderInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") confirmFolder.click();
    if (e.key === "Escape") cancelFolder.click();
  });

  chrome.tabs.onActivated?.addListener(() => detectCurrentPage());
  chrome.tabs.onUpdated?.addListener((_tabId, changeInfo) => {
    if (changeInfo.url || changeInfo.status === "complete") detectCurrentPage();
  });

  // ---- YouTube ID helper ----

  function extractYouTubeId(url) {
    if (!url) return null;
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtube.com")) {
        const v = u.searchParams.get("v");
        if (v) return v;
        const parts = u.pathname.split("/");
        if ((parts[1] === "embed" || parts[1] === "shorts") && parts[2]) return parts[2].slice(0, 11);
      }
      if (u.hostname === "youtu.be") return u.pathname.slice(1, 12) || null;
    } catch (_) {
      const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
      return match ? match[1] : null;
    }
    return null;
  }
})();
