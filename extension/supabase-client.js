// Auth-only Supabase client for the extension service worker.
// Data operations use raw fetch() in background.js to avoid client bugs.
// Wrapped in IIFE to avoid collision with supabase.min.js's `var supabase`.

(() => {
  const SUPABASE_URL = "https://jlzalpnwplpkllgfyxqz.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsemFscG53cGxwa2xsZ2Z5eHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4NjUwNTUsImV4cCI6MjA4NjQ0MTA1NX0.WFu4wmSKUOsnh1XPR5SqLoUmLx13zbfwuiS0fVFhQ6w";

  const storage = {
    getItem: (key) => new Promise(resolve => chrome.storage.local.get(key, r => resolve(r[key] ?? null))),
    setItem: (key, val) => new Promise(resolve => chrome.storage.local.set({ [key]: val }, resolve)),
    removeItem: (key) => new Promise(resolve => chrome.storage.local.remove(key, resolve)),
  };

  const sbClient = self.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { storage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
  });

  self.sbClient = sbClient;

<<<<<<< HEAD
  // Sign out extension when account is deleted (or token is invalidated)
  sbClient.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT" || event === "USER_DELETED") {
      chrome.storage.local.remove(
        ["sb-jlzalpnwplpkllgfyxqz-auth-token"],
        () => {
          chrome.storage.local.set({ activeFolder: null, highlightingActive: false });
          // Use force-sign-out so sidepanel skips trySyncFromWeb and goes straight to auth screen
          chrome.runtime.sendMessage({ action: "force-sign-out" }).catch(() => {});
        }
      );
    }
  });

=======
>>>>>>> cdc6ccf65ee72e1b66d9182116deac52c10599f3
  // Returns user from local session (no network call)
  self.getUser = async function () {
    const { data: { session } } = await sbClient.auth.getSession();
    return session?.user ?? null;
  };

  self.signInWithEmail = async function (email, password) {
    const { data, error } = await sbClient.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  self.signUpWithEmail = async function (email, password) {
    const { data, error } = await sbClient.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  self.signOut = async function () {
    const { error } = await sbClient.auth.signOut();
    if (error) throw error;
  };
})();
