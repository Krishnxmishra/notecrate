<<<<<<< HEAD
importScripts("config.js", "supabase.min.js", "supabase-client.js");
=======
importScripts("supabase.min.js", "supabase-client.js");
>>>>>>> cdc6ccf65ee72e1b66d9182116deac52c10599f3

const SUPABASE_URL = "https://jlzalpnwplpkllgfyxqz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsemFscG53cGxwa2xsZ2Z5eHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjUwNTUsImV4cCI6MjA4NjQ0MTA1NX0.WFu4wmSKUOsnh1XPR5SqLoUmLx13zbfwuiS0fVFhQ6w";

let realtimeChannel = null;

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

<<<<<<< HEAD
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: `${APP_URL}/signup` });
  }
=======
chrome.runtime.onInstalled.addListener(() => {
>>>>>>> cdc6ccf65ee72e1b66d9182116deac52c10599f3
  chrome.contextMenus.create({ id: "save-text", title: "Save to NoteCrate", contexts: ["selection"] });
  chrome.contextMenus.create({ id: "save-image", title: "Save image to NoteCrate", contexts: ["image"] });
  chrome.storage.local.get("activeColor", (r) => {
    if (!r.activeColor) chrome.storage.local.set({ activeColor: "yellow", activeFolder: null, highlightingActive: false });
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "save-text" && info.selectionText) {
    saveHighlight({ text: info.selectionText, sourceTitle: tab.title, sourceUrl: tab.url, type: "text" });
  }
  if (info.menuItemId === "save-image" && info.srcUrl) {
    saveHighlight({ text: "", sourceTitle: tab.title, sourceUrl: tab.url, type: "image", imageUrl: info.srcUrl });
  }
});

// ---- Raw fetch helpers (bypass Supabase client entirely) ----

async function getSessionToken() {
  // Use sbClient directly — it handles the chrome.storage adapter internally
  const { data: { session } } = await sbClient.auth.getSession();
  return session ?? null;
}

async function supabaseInsert(table, record, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${token}`,
      "Prefer": "return=representation",
    },
    body: JSON.stringify(record),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text}`);
  const rows = JSON.parse(text);
  return Array.isArray(rows) ? rows[0] : rows;
}

async function supabaseSelect(table, filters, token) {
  const params = new URLSearchParams(filters);
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${params}&order=created_at.desc`, {
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${token}`,
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text}`);
  return JSON.parse(text);
}

async function supabaseDelete(table, id, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "DELETE",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
}

async function supabaseDeleteWhere(table, whereQuery, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${whereQuery}`, {
    method: "DELETE",
    headers: {
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
}

async function supabaseUpdate(table, id, updates, token) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${token}`,
      "Prefer": "return=representation",
    },
    body: JSON.stringify(updates),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status}: ${text}`);
  const rows = text ? JSON.parse(text) : [];
  return Array.isArray(rows) ? rows[0] : rows;
}

async function broadcastInsert(mapped, token) {
  // Use Supabase Realtime HTTP Broadcast API — works without an active WebSocket
  try {
    await fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages: [{
          topic: "realtime:public:highlights",
          event: "custom-insert",
          payload: mapped,
        }],
      }),
    });
    console.log("[NC] broadcast custom-insert sent");
  } catch (e) {
    console.warn("[NC] broadcast failed (non-critical):", e.message);
  }
}

// ---- Context Menu Save highlight ----

async function saveHighlight(data) {
  const session = await getSessionToken();
<<<<<<< HEAD
  console.log("[NC] session found:", !!session);
=======
  console.log("[NC] session found:", !!session, "user:", session?.user?.email);
>>>>>>> cdc6ccf65ee72e1b66d9182116deac52c10599f3
  if (!session || !session.user || !session.access_token) {
    throw new Error("Not logged in");
  }

  const token = session.access_token;
  const user = session.user;
  const prefs = await chrome.storage.local.get(["activeColor", "activeFolder"]);
  let folderId = prefs.activeFolder;

  // Auto-resolve folder
  if (!folderId) {
    const folders = await supabaseSelect("folders", { "user_id": `eq.${user.id}`, "limit": "1" }, token);
    if (folders.length > 0) {
      folderId = folders[0].id;
    } else {
      const f = await supabaseInsert("folders", { name: "Inbox", user_id: user.id, parent_id: null }, token);
      folderId = f.id;
    }
    await chrome.storage.local.set({ activeFolder: folderId });
  }

  const record = {
    text: data.text || "",
    source_title: data.sourceTitle || "",
    source_url: data.sourceUrl || "",
    color: prefs.activeColor || "yellow",
    type: data.type || "text",
    image_url: data.imageUrl || null,
    video_id: data.videoId || null,
    video_timestamp: data.videoTimestamp || null,
    folder_id: folderId,
    user_id: user.id,
  };

  console.log("[NC] inserting record:", record.source_title, record.source_url);
  const row = await supabaseInsert("highlights", record, token);
  console.log("[NC] insert OK, id:", row.id);

  const mapped = {
    id: row.id,
    text: row.text,
    sourceTitle: row.source_title,
    sourceUrl: row.source_url,
    color: row.color,
    folderId: row.folder_id,
    createdAt: row.created_at?.split("T")[0] || "",
    type: row.type || "text",
    imageUrl: row.image_url || null,
    videoId: row.video_id || null,
    videoTimestamp: row.video_timestamp || null,
  };
  chrome.runtime.sendMessage({ action: "highlight-saved", highlight: mapped }).catch(() => { });
  // Broadcast to web app via HTTP (service worker has no persistent WebSocket)
  broadcastInsert(mapped, token);
  return mapped;
}

// ---- Supabase Realtime Subscription ----

async function setupRealtimeSync(user) {
  if (realtimeChannel) {
    sbClient.removeChannel(realtimeChannel);
  }
  if (!user) return;

  realtimeChannel = sbClient.channel("public:highlights")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "highlights", filter: `user_id=eq.${user.id}` },
      async (payload) => {
        if (payload.eventType === "DELETE") {
          chrome.tabs.query({}, (tabs) => {
            for (const tab of tabs) {
              chrome.tabs.sendMessage(tab.id, { action: "remove-single", id: payload.old.id }).catch(() => { });
            }
          });
          return;
        }

        const row = payload.new;
        if (!row) return;

        const mapped = {
          id: row.id,
          text: row.text,
          sourceTitle: row.source_title,
          sourceUrl: row.source_url,
          color: row.color,
          folderId: row.folder_id,
          createdAt: row.created_at?.split("T")[0] || "",
          type: row.type || "text",
          imageUrl: row.image_url || null,
          videoId: row.video_id || null,
          videoTimestamp: row.video_timestamp || null,
        };

        // Broadcast directly to ALL active tabs in the browser instantly
        chrome.tabs.query({}, (tabs) => {
          for (const tab of tabs) {
            chrome.tabs.sendMessage(tab.id, { action: "reinject-single", highlight: mapped }).catch(() => { });
          }
        });
      }
    )
    .subscribe();
}

// ---- Message handler ----

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message, sendResponse);
  return true; // critical for async sendResponse
});

async function handleMessage(message, sendResponse) {
  try {
    switch (message.action) {

      case "save-highlight": {
        try {
          const highlight = await saveHighlight(message.data);
          sendResponse({ success: true, highlight });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
        break;
      }

      case "sign-in": {
        const data = await signInWithEmail(message.email, message.password);
        if (data.user) setupRealtimeSync(data.user);
        sendResponse({ success: true, user: data.user });
        break;
      }

      case "sign-up": {
        const data = await signUpWithEmail(message.email, message.password);
        sendResponse({ success: true, user: data.user ?? null });
        break;
      }

      case "sign-out": {
        await signOut();
        await chrome.storage.local.set({ activeFolder: null, highlightingActive: false });
        if (realtimeChannel) {
          sbClient.removeChannel(realtimeChannel);
          realtimeChannel = null;
        }
        sendResponse({ success: true });
        break;
      }

      case "get-state": {
        const session = await getSessionToken();
        const user = session?.user;
        const prefs = await chrome.storage.local.get(["activeColor", "activeFolder", "highlightingActive"]);

        if (!user) {
          sendResponse({ ...prefs, highlights: [], folders: [], user: null });
          break;
        }

        const token = session.access_token || SUPABASE_ANON_KEY;

        const [folderRows, highlightRows, profileRows] = await Promise.all([
          supabaseSelect("folders", { "user_id": `eq.${user.id}` }, token).catch(() => []),
          supabaseSelect("highlights", { "user_id": `eq.${user.id}` }, token).catch(() => []),
          supabaseSelect("profiles", { "id": `eq.${user.id}` }, token).catch(() => []),
        ]);

        const folders = folderRows.map(r => ({ id: r.id, name: r.name, parentId: r.parent_id }));
        const highlights = highlightRows.map(r => ({
          id: r.id, text: r.text, sourceTitle: r.source_title, sourceUrl: r.source_url,
          color: r.color, folderId: r.folder_id, createdAt: r.created_at?.split("T")[0] || "",
          type: r.type || "text", imageUrl: r.image_url || null, videoId: r.video_id || null,
          videoTimestamp: r.video_timestamp || null,
        }));

        const folderIds = new Set(folders.map(f => f.id));
        let activeFolder = prefs.activeFolder;
        if (!activeFolder || !folderIds.has(activeFolder)) {
          activeFolder = folders[0]?.id || null;
          await chrome.storage.local.set({ activeFolder });
        }

        if (!realtimeChannel && user) setupRealtimeSync(user);

        const profile = profileRows[0] || null;
        sendResponse({ ...prefs, activeFolder, highlights, folders, user, userName: profile?.name || null });
        break;
      }

      case "set-color": {
        await chrome.storage.local.set({ activeColor: message.color });
        sendResponse({ success: true });
        break;
      }

      case "set-folder": {
        await chrome.storage.local.set({ activeFolder: message.folderId });
        sendResponse({ success: true });
        break;
      }

      case "toggle-highlighting": {
        await chrome.storage.local.set({ highlightingActive: message.active });
        sendResponse({ success: true });
        break;
      }

      case "delete-highlight": {
        const session = await getSessionToken();
        const tok = session?.access_token || SUPABASE_ANON_KEY;
        await supabaseDelete("highlights", message.id, tok);
        // Immediately un-highlight on the active tab (don't wait for realtime)
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { action: "remove-single", id: message.id }).catch(() => {});
          }
        });
        // Broadcast delete to web app via HTTP
        fetch(`${SUPABASE_URL}/realtime/v1/api/broadcast`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": SUPABASE_ANON_KEY, "Authorization": `Bearer ${tok}` },
          body: JSON.stringify({ messages: [{ topic: "realtime:public:highlights", event: "custom-delete", payload: { id: message.id } }] }),
        }).catch(() => { });
        sendResponse({ success: true });
        break;
      }

      case "create-folder": {
        const session = await getSessionToken();
        const user = session?.user;
        if (!user) { sendResponse({ success: false, error: "Not logged in" }); break; }
        const tok = session?.access_token || SUPABASE_ANON_KEY;
        const row = await supabaseInsert("folders", { name: message.name, parent_id: message.parentId || null, user_id: user.id }, tok);
        sendResponse({ success: true, folder: { id: row.id, name: row.name, parentId: row.parent_id } });
        break;
      }

      case "rename-folder": {
        const session = await getSessionToken();
        const user = session?.user;
        if (!user) { sendResponse({ success: false, error: "Not logged in" }); break; }
        const tok = session?.access_token || SUPABASE_ANON_KEY;
        const row = await supabaseUpdate("folders", message.id, { name: message.name }, tok);
        sendResponse({ success: true, folder: { id: row.id, name: row.name, parentId: row.parent_id } });
        break;
      }

      case "delete-folder": {
        const session = await getSessionToken();
        const user = session?.user;
        if (!user) { sendResponse({ success: false, error: "Not logged in" }); break; }
        const tok = session?.access_token || SUPABASE_ANON_KEY;
        const folderId = message.id;

        const folderRows = await supabaseSelect("folders", { "user_id": `eq.${user.id}` }, tok).catch(() => []);
        const childIds = folderRows.filter((f) => f.parent_id === folderId).map((f) => f.id);
        const allIds = [folderId, ...childIds];

        const inList = `(${allIds.join(",")})`;
        await supabaseDeleteWhere("highlights", `folder_id=in.${encodeURIComponent(inList)}`, tok);
        if (childIds.length > 0) {
          await supabaseDeleteWhere("folders", `id=in.${encodeURIComponent(`(${childIds.join(",")})`)}`, tok);
        }
        await supabaseDelete("folders", folderId, tok);

        const prefs = await chrome.storage.local.get(["activeFolder"]);
        if (prefs.activeFolder && allIds.includes(prefs.activeFolder)) {
          const nextActive = folderRows.find((f) => !allIds.includes(f.id))?.id || null;
          await chrome.storage.local.set({ activeFolder: nextActive });
        }

        sendResponse({ success: true });
        break;
      }

      case "get-session-tokens": {
        const session = await getSessionToken();
        sendResponse({ accessToken: session?.access_token || null, refreshToken: session?.refresh_token || null });
        break;
      }

<<<<<<< HEAD
      case "ping": {
        sendResponse({ pong: true });
        break;
      }

      case "set-session": {
        try {
          await sbClient.auth.setSession({
            access_token: message.accessToken,
            refresh_token: message.refreshToken,
          });
          const { data: { user } } = await sbClient.auth.getUser();
          if (user) await setupRealtimeSync(user);
          // Notify sidepanel (if open) to refresh its state
          chrome.runtime.sendMessage({ action: "auth-changed" }).catch(() => {});
          sendResponse({ success: true });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
        break;
      }

=======
>>>>>>> cdc6ccf65ee72e1b66d9182116deac52c10599f3
      default:
        sendResponse({ success: false, error: "Unknown: " + message.action });
    }
  } catch (err) {
    console.error("[NC] error in", message.action, err.message);
    sendResponse({ success: false, error: err.message });
  }
}
