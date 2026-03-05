// Supabase client for NoteCrate extension (service worker + sidepanel)
// Uses chrome.storage.local as the auth storage backend so sessions survive
// service worker terminations (MV3).
//
// Wrapped in IIFE so const declarations don't collide with supabase.min.js's
// top-level `var supabase` UMD export.

(() => {
  const SUPABASE_URL = "https://jlzalpnwplpkllgfyxqz.supabase.co";
  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsemFscG53cGxwa2xsZ2Z5eHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjUwNTUsImV4cCI6MjA4NjQ0MTA1NX0.WFu4wmSKUOsnh1XPR5SqLoUmLx13zbfwuiS0fVFhQ6w";

  // chrome.storage.local adapter — survives service worker restarts
  const chromeStorageAdapter = {
    getItem: (key) =>
      new Promise((resolve) => {
        chrome.storage.local.get(key, (result) => {
          resolve(result[key] ?? null);
        });
      }),
    setItem: (key, value) =>
      new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, resolve);
      }),
    removeItem: (key) =>
      new Promise((resolve) => {
        chrome.storage.local.remove(key, resolve);
      }),
  };

  const sbClient = self.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      storage: chromeStorageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  // ---- Auth helpers ----

  // Restores session from storage (required after every service worker wake),
  // then validates the token. Returns the user or null.
  self.getUser = async function getUser() {
    const { data: { session } } = await sbClient.auth.getSession();
    if (!session) return null;
    const { data: { user }, error } = await sbClient.auth.getUser();
    if (error || !user) return null;
    return user;
  };

  self.signInWithEmail = async function signInWithEmail(email, password) {
    const { data, error } = await sbClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  self.signUpWithEmail = async function signUpWithEmail(email, password) {
    const { data, error } = await sbClient.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  self.signOut = async function signOut() {
    const { error } = await sbClient.auth.signOut();
    if (error) throw error;
  };

  // ---- Data helpers ----

  self.fetchFolders = async function fetchFolders(userId) {
    const { data, error } = await sbClient
      .from("folders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return data;
  };

  self.createFolderRemote = async function createFolderRemote(name, parentId, userId) {
    const { data, error } = await sbClient
      .from("folders")
      .insert({ name, parent_id: parentId || null, user_id: userId })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  self.fetchHighlights = async function fetchHighlights(userId) {
    const { data, error } = await sbClient
      .from("highlights")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  };

  self.createHighlightRemote = async function createHighlightRemote(highlight, userId) {
    const { data, error } = await sbClient
      .from("highlights")
      .insert({
        text: highlight.text || "",
        source_title: highlight.sourceTitle || "",
        source_url: highlight.sourceUrl || "",
        color: highlight.color || "yellow",
        type: highlight.type || "text",
        image_url: highlight.imageUrl || null,
        video_id: highlight.videoId || null,
        video_timestamp: highlight.videoTimestamp || null,
        folder_id: highlight.folderId,
        user_id: userId,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  };

  self.deleteHighlightRemote = async function deleteHighlightRemote(id) {
    const { error } = await sbClient.from("highlights").delete().eq("id", id);
    if (error) throw error;
  };

  // ---- Row mappers ----

  self.mapRow = function mapRow(row) {
    return {
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
  };

  self.mapFolderRow = function mapFolderRow(row) {
    return {
      id: row.id,
      name: row.name,
      parentId: row.parent_id,
    };
  };
})();
