// Supabase client for NoteCrate extension
// This file initializes the Supabase client and provides auth + data helpers.

const SUPABASE_URL = "https://jlzalpnwplpkllgfyxqz.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsemFscG53cGxwa2xsZ2Z5eHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjUwNTUsImV4cCI6MjA4NjQ0MTA1NX0.WFu4wmSKUOsnh1XPR5SqLoUmLx13zbfwuiS0fVFhQ6w";

const supabase = self.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: {
      // Use chrome.storage.local as the auth storage backend
      getItem: (key) =>
        new Promise((resolve) => {
          chrome.storage.local.get(key, (result) => resolve(result[key] ?? null));
        }),
      setItem: (key, value) =>
        new Promise((resolve) => {
          chrome.storage.local.set({ [key]: value }, resolve);
        }),
      removeItem: (key) =>
        new Promise((resolve) => {
          chrome.storage.local.remove(key, resolve);
        }),
    },
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ---- Auth helpers ----

async function getUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

async function signUpWithEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ---- Data helpers ----

async function fetchFolders(userId) {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data;
}

async function createFolderRemote(name, parentId, userId) {
  const { data, error } = await supabase
    .from("folders")
    .insert({ name, parent_id: parentId || null, user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function fetchHighlights(userId) {
  const { data, error } = await supabase
    .from("highlights")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

async function createHighlightRemote(highlight, userId) {
  const { data, error } = await supabase
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
}

async function deleteHighlightRemote(id) {
  const { error } = await supabase.from("highlights").delete().eq("id", id);
  if (error) throw error;
}

// Map Supabase row to extension highlight format
function mapRow(row) {
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
}

function mapFolderRow(row) {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
  };
}
