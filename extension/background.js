importScripts("supabase.min.js", "supabase-client.js");

// Open side panel on extension icon click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// ---- Context menus ----

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "save-text",
    title: "Save highlight to NoteCrate",
    contexts: ["selection"],
  });
  chrome.contextMenus.create({
    id: "save-image",
    title: "Save image to NoteCrate",
    contexts: ["image"],
  });

  chrome.storage.local.get("activeColor", (result) => {
    if (!result.activeColor) {
      chrome.storage.local.set({
        activeColor: "yellow",
        activeFolder: null,
        highlightingActive: false,
      });
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-text" && info.selectionText) {
    saveHighlight({
      text: info.selectionText,
      sourceTitle: tab.title,
      sourceUrl: tab.url,
      type: "text",
    });
  } else if (info.menuItemId === "save-image" && info.srcUrl) {
    saveHighlight({
      text: "",
      sourceTitle: tab.title,
      sourceUrl: tab.url,
      type: "image",
      imageUrl: info.srcUrl,
    });
  }
});

// ---- YouTube ID extraction ----

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

// ---- Save highlight ----

async function saveHighlight(data) {
  const user = await getUser();
  if (!user) {
    chrome.runtime.sendMessage({ action: "auth-required" }).catch(() => {});
    return;
  }

  const prefs = await chrome.storage.local.get(["activeColor", "activeFolder"]);
  let folderId = prefs.activeFolder;

  if (!folderId) {
    const folders = await fetchFolders(user.id);
    if (folders.length === 0) {
      const inbox = await createFolderRemote("Inbox", null, user.id);
      folderId = inbox.id;
    } else {
      folderId = folders[0].id;
    }
    await chrome.storage.local.set({ activeFolder: folderId });
  }

  const highlight = {
    text: data.text || "",
    sourceTitle: data.sourceTitle || "",
    sourceUrl: data.sourceUrl || "",
    color: prefs.activeColor || "yellow",
    folderId,
    type: data.type || "text",
    imageUrl: data.imageUrl || null,
    videoId: data.videoId || null,
    videoTimestamp: data.videoTimestamp || null,
  };

  try {
    const row = await createHighlightRemote(highlight, user.id);
    const mapped = mapRow(row);
    chrome.runtime.sendMessage({ action: "highlight-saved", highlight: mapped }).catch(() => {});
  } catch (err) {
    console.error("NoteCrate: failed to save highlight", err);
    chrome.runtime.sendMessage({ action: "save-error", error: err.message }).catch(() => {});
  }
}

// ---- Message handler ----
// MV3: return true synchronously to keep the message port open for async replies.

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message, sendResponse);
  return true;
});

async function handleMessage(message, sendResponse) {
  try {
    switch (message.action) {

      case "save-highlight":
        await saveHighlight(message.data);
        sendResponse({ success: true });
        break;

      case "get-auth-state": {
        const user = await getUser();
        sendResponse({ user: user ?? null });
        break;
      }

      case "sign-in": {
        const data = await signInWithEmail(message.email, message.password);
        sendResponse({ success: true, user: data.user });
        break;
      }

      case "sign-up": {
        const data = await signUpWithEmail(message.email, message.password);
        sendResponse({ success: true, user: data.user ?? null });
        break;
      }

      case "sign-out":
        await signOut();
        await chrome.storage.local.set({ activeFolder: null, highlightingActive: false });
        sendResponse({ success: true });
        break;

      case "get-folders": {
        const user = await getUser();
        if (!user) { sendResponse({ folders: [] }); break; }
        const rows = await fetchFolders(user.id);
        sendResponse({ folders: rows.map(mapFolderRow) });
        break;
      }

      case "get-highlights": {
        const user = await getUser();
        if (!user) { sendResponse({ highlights: [] }); break; }
        const rows = await fetchHighlights(user.id);
        sendResponse({ highlights: rows.map(mapRow) });
        break;
      }

      case "get-state": {
        const user = await getUser();
        const prefs = await chrome.storage.local.get([
          "activeColor",
          "activeFolder",
          "highlightingActive",
        ]);

        if (!user) {
          sendResponse({ ...prefs, highlights: [], folders: [], user: null });
          break;
        }

        const [folderRows, highlightRows] = await Promise.all([
          fetchFolders(user.id),
          fetchHighlights(user.id),
        ]);

        const folders = folderRows.map(mapFolderRow);
        const highlights = highlightRows.map(mapRow);

        // Validate activeFolder — reset if it no longer exists
        const folderIds = new Set(folders.map((f) => f.id));
        let activeFolder = prefs.activeFolder;
        if (!activeFolder || !folderIds.has(activeFolder)) {
          activeFolder = folders.length > 0 ? folders[0].id : null;
          await chrome.storage.local.set({ activeFolder });
        }

        sendResponse({ ...prefs, activeFolder, highlights, folders, user });
        break;
      }

      case "set-color":
        await chrome.storage.local.set({ activeColor: message.color });
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {});
        });
        sendResponse({ success: true });
        break;

      case "set-folder":
        await chrome.storage.local.set({ activeFolder: message.folderId });
        sendResponse({ success: true });
        break;

      case "toggle-highlighting":
        await chrome.storage.local.set({ highlightingActive: message.active });
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {});
        });
        sendResponse({ success: true });
        break;

      case "delete-highlight":
        await deleteHighlightRemote(message.id);
        sendResponse({ success: true });
        break;

      case "get-session-tokens": {
        // Read the raw Supabase session from chrome.storage.local and return tokens
        const storageKey = "sb-jlzalpnwplpkllgfyxqz-auth-token";
        const stored = await chrome.storage.local.get(storageKey);
        const raw = stored[storageKey];
        try {
          const parsed = JSON.parse(raw);
          sendResponse({
            accessToken: parsed?.access_token || null,
            refreshToken: parsed?.refresh_token || null,
          });
        } catch {
          sendResponse({ accessToken: null, refreshToken: null });
        }
        break;
      }

      case "create-folder": {
        const user = await getUser();
        if (!user) { sendResponse({ success: false, error: "Not logged in" }); break; }
        const row = await createFolderRemote(message.name, message.parentId || null, user.id);
        sendResponse({ success: true, folder: mapFolderRow(row) });
        break;
      }

      default:
        sendResponse({ success: false, error: "Unknown action: " + message.action });
    }
  } catch (err) {
    console.error("NoteCrate background error:", err);
    sendResponse({ success: false, error: err.message });
  }
}
