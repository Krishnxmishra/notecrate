(() => {
  // ---- State ----
  let highlights = [];
  let folders = [];
  let activeColor = "yellow";
  let activeFolder = null;
  let highlightingActive = false;
  let currentTab = "highlights";
  let currentPageUrl = "";
  let ytPollInterval = null;
  let currentUser = null;

  // ---- Elements ----
  const $ = (sel) => document.querySelector(sel);

  const toggleBtn = $("#toggleHighlight");
  const folderSelect = $("#folderSelect");
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

  const authScreen = $("#authScreen");
  const authEmail = $("#authEmail");
  const authPassword = $("#authPassword");
  const authSignIn = $("#authSignIn");
  const authSignUp = $("#authSignUp");
  const authError = $("#authError");
  const userBar = $("#userBar");
  const userEmailEl = $("#userEmail");
  const signOutBtn = $("#signOutBtn");

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
      userBar.classList.remove("hidden");
      userEmailEl.textContent = currentUser.email || "";
    } else {
      userBar.classList.add("hidden");
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

  signOutBtn.addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "sign-out" }, () => {
      currentUser = null;
      highlights = [];
      folders = [];
      activeFolder = null;
      highlightingActive = false;
      toggleBtn.classList.remove("active");
      updateUserBar();
      render();
      showAuthScreen();
    });
  });

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

      hideAuthScreen();
      updateUserBar();

      highlights = result.highlights || [];
      folders = result.folders || [];
      activeColor = result.activeColor || "yellow";
      activeFolder = result.activeFolder || null;
      highlightingActive = result.highlightingActive || false;

      toggleBtn.classList.toggle("active", highlightingActive);

      colorBtns.forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.color === activeColor);
      });

      populateFolders();
      if (activeFolder) folderSelect.value = activeFolder;

      detectCurrentPage();
      render();
    });
  }

  function populateFolders() {
    folderSelect.innerHTML = "";
    if (folders.length === 0) {
      const opt = document.createElement("option");
      opt.value = "";
      opt.textContent = "No folders yet";
      folderSelect.appendChild(opt);
      return;
    }
    folders.forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = f.name;
      folderSelect.appendChild(opt);
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
    const list = currentTab === "page"
      ? highlights.filter((h) => h.sourceUrl === currentPageUrl)
      : highlights;

    highlightTabCount.textContent = highlights.length;
    pageTabCount.textContent = highlights.filter((h) => h.sourceUrl === currentPageUrl).length;

    if (!list.length) {
      content.innerHTML = `
        <div class="empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d4d4d4" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="m9 11-6 6v3h9l3-3"/>
            <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>
          </svg>
          <p>${currentTab === "page" ? "No highlights on this page" : "No highlights yet"}</p>
          <p class="sub">Select text on any page to save</p>
        </div>
      `;
      return;
    }

    content.innerHTML = list.map(cardHtml).join("");

    content.querySelectorAll(".h-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        chrome.runtime.sendMessage({ action: "delete-highlight", id }, (res) => {
          if (res?.success !== false) {
            highlights = highlights.filter((h) => h.id !== id);
            render();
          }
        });
      });
    });
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
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
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
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
      t.style.cssText = "position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#0a0a0a;color:#fff;font-size:12px;padding:8px 14px;border-radius:8px;z-index:9999;opacity:0;transition:opacity 0.2s;white-space:nowrap;pointer-events:none";
      document.body.appendChild(t);
    }
    t.textContent = text;
    t.style.opacity = "1";
    setTimeout(() => { t.style.opacity = "0"; }, 2500);
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

  folderSelect.addEventListener("change", () => {
    activeFolder = folderSelect.value;
    chrome.runtime.sendMessage({ action: "set-folder", folderId: activeFolder });
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentTab = tab.dataset.tab;
      render();
    });
  });

  openAppBtn.addEventListener("click", () => {
    // Pass session tokens so the web app can log in automatically
    chrome.runtime.sendMessage({ action: "get-session-tokens" }, (res) => {
      if (res?.accessToken && res?.refreshToken) {
        const url = `http://localhost:3000/auth/extension#access_token=${encodeURIComponent(res.accessToken)}&refresh_token=${encodeURIComponent(res.refreshToken)}&type=recovery`;
        chrome.tabs.create({ url });
      } else {
        chrome.tabs.create({ url: "http://localhost:3000/dashboard" });
      }
    });
  });

  saveClipBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabList) => {
      if (!tabList?.[0]) return;
      const tab = tabList[0];
      chrome.tabs.sendMessage(tab.id, { action: "get-yt-time" }, (response) => {
        const timestamp = response?.timestamp || "0:00";
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
        });
      });
    });
  });

  newFolderBtn.addEventListener("click", () => {
    newFolderDialog.classList.remove("hidden");
    newFolderInput.value = "";
    newFolderInput.focus();
  });

  cancelFolder.addEventListener("click", () => newFolderDialog.classList.add("hidden"));

  confirmFolder.addEventListener("click", () => {
    const name = newFolderInput.value.trim();
    if (!name) return;
    chrome.runtime.sendMessage({ action: "create-folder", name }, (response) => {
      if (response?.success) {
        folders.push(response.folder);
        populateFolders();
        folderSelect.value = response.folder.id;
        activeFolder = response.folder.id;
        chrome.runtime.sendMessage({ action: "set-folder", folderId: activeFolder });
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
