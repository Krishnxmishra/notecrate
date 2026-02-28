(() => {
  // ---- State ----
  let highlights = [];
  let folders = [];
  let activeColor = "yellow";
  let activeFolder = null;
  let highlightingActive = false;
  let currentTab = "highlights"; // "highlights" | "page"
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

  // Auth elements
  const authScreen = $("#authScreen");
  const authEmail = $("#authEmail");
  const authPassword = $("#authPassword");
  const authSignIn = $("#authSignIn");
  const authSignUp = $("#authSignUp");
  const authError = $("#authError");
  const userBar = $("#userBar");
  const userEmailEl = $("#userEmail");
  const signOutBtn = $("#signOutBtn");

  // ---- Init ----
  loadState();

  // Listen for new highlights from background
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === "highlight-saved") {
      highlights.unshift(msg.highlight);
      render();
    }
    if (msg.action === "auth-required") {
      showAuthScreen();
    }
  });

  // ---- Auth ----
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
    if (!email || !password) return showAuthError("Email and password required");

    authSignIn.disabled = true;
    authSignIn.textContent = "Signing in...";

    chrome.runtime.sendMessage({ action: "sign-in", email, password }, (res) => {
      authSignIn.disabled = false;
      authSignIn.textContent = "Sign in";

      if (res?.success) {
        currentUser = res.user;
        hideAuthScreen();
        updateUserBar();
        loadState(); // Reload data from Supabase
      } else {
        showAuthError(res?.error || "Sign in failed");
      }
    });
  });

  authSignUp.addEventListener("click", () => {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    if (!email || !password) return showAuthError("Email and password required");
    if (password.length < 6) return showAuthError("Password must be at least 6 characters");

    authSignUp.disabled = true;
    authSignUp.textContent = "Creating...";

    chrome.runtime.sendMessage({ action: "sign-up", email, password }, (res) => {
      authSignUp.disabled = false;
      authSignUp.textContent = "Create account";

      if (res?.success) {
        if (res.user) {
          currentUser = res.user;
          hideAuthScreen();
          updateUserBar();
          loadState();
        } else {
          showAuthError("Check your email to confirm your account");
        }
      } else {
        showAuthError(res?.error || "Sign up failed");
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
      updateUserBar();
      render();
      showAuthScreen();
    });
  });

  // ---- Load state from background (Supabase) ----
  function loadState() {
    chrome.runtime.sendMessage({ action: "get-state" }, (result) => {
      if (!result) return;

      // Check auth state
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

      // Set UI
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
    folders.forEach((f) => {
      const opt = document.createElement("option");
      opt.value = f.id;
      opt.textContent = f.name;
      folderSelect.appendChild(opt);
    });
  }

  // ---- Detect current page (YouTube, etc) ----
  function detectCurrentPage() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabList) => {
      if (!tabList[0]) return;
      const tab = tabList[0];
      currentPageUrl = tab.url || "";

      // Check YouTube
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
        if (response && response.timestamp) {
          ytTime.textContent = response.timestamp;
        }
      });
    }, 1000);
  }

  function stopYtPoll() {
    if (ytPollInterval) {
      clearInterval(ytPollInterval);
      ytPollInterval = null;
    }
  }

  // ---- Render highlights ----
  function render() {
    let list = highlights;

    if (currentTab === "page") {
      list = highlights.filter((h) => h.sourceUrl === currentPageUrl);
    }

    // Sort newest first (already sorted from Supabase, but ensure)
    list = [...list];

    // Update counts
    highlightTabCount.textContent = highlights.length;
    const pageHighlights = highlights.filter((h) => h.sourceUrl === currentPageUrl);
    pageTabCount.textContent = pageHighlights.length;

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

    content.innerHTML = list.map((h) => cardHtml(h)).join("");

    // Attach delete handlers
    content.querySelectorAll(".h-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        chrome.runtime.sendMessage({ action: "delete-highlight", id }, () => {
          highlights = highlights.filter((h) => h.id !== id);
          render();
        });
      });
    });
  }

  function cardHtml(h) {
    const isVideo = h.type === "video" && h.videoId;
    const isImage = h.type === "image" && h.imageUrl;

    let bodyContent = "";

    if (isImage) {
      bodyContent = `<img class="h-image" src="${esc(h.imageUrl)}" alt="Saved image" />`;
    }

    if (h.text) {
      bodyContent += `<div class="h-text">${esc(h.text)}</div>`;
    }

    if (isVideo) {
      bodyContent += `
        <div class="h-video-badge">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          ${h.videoTimestamp || "0:00"}
        </div>
      `;
    }

    return `
      <div class="h-card">
        <div class="h-bar ${h.color}"></div>
        <div class="h-body">
          ${bodyContent}
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

  // ---- Events ----

  // Toggle highlighting
  toggleBtn.addEventListener("click", () => {
    highlightingActive = !highlightingActive;
    toggleBtn.classList.toggle("active", highlightingActive);
    chrome.runtime.sendMessage({
      action: "toggle-highlighting",
      active: highlightingActive,
    });
  });

  // Color selection
  colorBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      colorBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeColor = btn.dataset.color;
      chrome.runtime.sendMessage({ action: "set-color", color: activeColor });
    });
  });

  // Folder selection
  folderSelect.addEventListener("change", () => {
    activeFolder = folderSelect.value;
    chrome.runtime.sendMessage({ action: "set-folder", folderId: activeFolder });
  });

  // Tab switching
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentTab = tab.dataset.tab;
      render();
    });
  });

  // Open app
  openAppBtn.addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:3000" });
  });

  // Save YouTube clip
  saveClipBtn.addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabList) => {
      if (!tabList[0]) return;
      const tab = tabList[0];
      chrome.tabs.sendMessage(tab.id, { action: "get-yt-time" }, (response) => {
        const timestamp = response?.timestamp || "0:00";
        const videoUrl = tab.url;
        const videoId = extractYouTubeId(videoUrl);
        const title = (tab.title || "").replace(" - YouTube", "");

        chrome.runtime.sendMessage({
          action: "save-highlight",
          data: {
            text: `${title} (at ${timestamp})`,
            sourceTitle: title,
            sourceUrl: videoUrl,
            type: "video",
            videoId: videoId,
            videoTimestamp: timestamp,
          },
        });
      });
    });
  });

  function extractYouTubeId(url) {
    if (!url) return null;
    const match = url.match(
      /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
    );
    return match ? match[1] : null;
  }

  // New folder dialog
  newFolderBtn.addEventListener("click", () => {
    newFolderDialog.classList.remove("hidden");
    newFolderInput.value = "";
    newFolderInput.focus();
  });

  cancelFolder.addEventListener("click", () => {
    newFolderDialog.classList.add("hidden");
  });

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

  // Refresh when tab changes
  chrome.tabs.onActivated?.addListener(() => {
    detectCurrentPage();
  });

  chrome.tabs.onUpdated?.addListener((tabId, changeInfo) => {
    if (changeInfo.url || changeInfo.status === "complete") {
      detectCurrentPage();
    }
  });
})();
