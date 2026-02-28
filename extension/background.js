importScripts("supabase.min.js", "supabase-client.js");

// Open side panel on extension icon click
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Context menus
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

  // Initialize local preferences (UI-only state)
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

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

async function saveHighlight(data) {
  const user = await getUser();
  if (!user) {
    // Not logged in — notify side panel
    chrome.runtime.sendMessage({ action: "auth-required" }).catch(() => {});
    return;
  }

  // Get active folder from local prefs
  const prefs = await chrome.storage.local.get(["activeColor", "activeFolder"]);

  // If no active folder set, get the first folder from Supabase
  let folderId = prefs.activeFolder;
  if (!folderId) {
    const folders = await fetchFolders(user.id);
    if (folders.length === 0) {
      // Create a default Inbox folder
      const inbox = await createFolderRemote("Inbox", null, user.id);
      folderId = inbox.id;
    } else {
      folderId = folders[0].id;
    }
    chrome.storage.local.set({ activeFolder: folderId });
  }

  const highlight = {
    text: data.text || "",
    sourceTitle: data.sourceTitle || "",
    sourceUrl: data.sourceUrl || "",
    color: prefs.activeColor || "yellow",
    folderId: folderId,
    type: data.type || "text",
    imageUrl: data.imageUrl || null,
    videoId: data.videoId || null,
    videoTimestamp: data.videoTimestamp || null,
  };

  try {
    const row = await createHighlightRemote(highlight, user.id);
    const mapped = mapRow(row);
    // Notify side panel to refresh
    chrome.runtime.sendMessage({ action: "highlight-saved", highlight: mapped }).catch(() => {});
  } catch (err) {
    console.error("NoteCrate: Failed to save highlight", err);
  }
}

// Listen for messages from content script & side panel
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sendResponse);
  return true; // Keep message port open for async responses
});

async function handleMessage(message, sendResponse) {
  try {
    if (message.action === "save-highlight") {
      await saveHighlight(message.data);
      sendResponse({ success: true });

    } else if (message.action === "get-auth-state") {
      const user = await getUser();
      sendResponse({ user });

    } else if (message.action === "sign-in") {
      const data = await signInWithEmail(message.email, message.password);
      sendResponse({ success: true, user: data.user });

    } else if (message.action === "sign-up") {
      const data = await signUpWithEmail(message.email, message.password);
      sendResponse({ success: true, user: data.user });

    } else if (message.action === "sign-out") {
      await signOut();
      sendResponse({ success: true });

    } else if (message.action === "get-folders") {
      const user = await getUser();
      if (!user) return sendResponse({ folders: [] });
      const rows = await fetchFolders(user.id);
      sendResponse({ folders: rows.map(mapFolderRow) });

    } else if (message.action === "get-highlights") {
      const user = await getUser();
      if (!user) return sendResponse({ highlights: [] });
      const rows = await fetchHighlights(user.id);
      sendResponse({ highlights: rows.map(mapRow) });

    } else if (message.action === "get-state") {
      const user = await getUser();
      const prefs = await chrome.storage.local.get([
        "activeColor",
        "activeFolder",
        "highlightingActive",
      ]);
      if (!user) {
        sendResponse({ ...prefs, highlights: [], folders: [], user: null });
        return;
      }
      const [folderRows, highlightRows] = await Promise.all([
        fetchFolders(user.id),
        fetchHighlights(user.id),
      ]);
      const folders = folderRows.map(mapFolderRow);
      const highlights = highlightRows.map(mapRow);

      if (!prefs.activeFolder && folders.length > 0) {
        prefs.activeFolder = folders[0].id;
        chrome.storage.local.set({ activeFolder: folders[0].id });
      }

      sendResponse({ ...prefs, highlights, folders, user });

    } else if (message.action === "set-color") {
      chrome.storage.local.set({ activeColor: message.color });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {});
      });
      sendResponse({ success: true });

    } else if (message.action === "set-folder") {
      chrome.storage.local.set({ activeFolder: message.folderId });
      sendResponse({ success: true });

    } else if (message.action === "toggle-highlighting") {
      chrome.storage.local.set({ highlightingActive: message.active });
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) chrome.tabs.sendMessage(tabs[0].id, message).catch(() => {});
      });
      sendResponse({ success: true });

    } else if (message.action === "delete-highlight") {
      await deleteHighlightRemote(message.id);
      sendResponse({ success: true });

    } else if (message.action === "create-folder") {
      const user = await getUser();
      if (!user) return sendResponse({ success: false, error: "Not logged in" });
      const row = await createFolderRemote(message.name, message.parentId || null, user.id);
      sendResponse({ success: true, folder: mapFolderRow(row) });

    } else {
      sendResponse({ success: false, error: "Unknown action" });
    }
  } catch (err) {
    console.error("NoteCrate background error:", err);
    sendResponse({ success: false, error: err.message });
  }
}
