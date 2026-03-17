// Shared runtime config for background.js and sidepanel.js
// The production ID is the permanent Chrome Web Store extension ID.
// Any other ID = unpacked dev install → use localhost.
const PROD_EXT_ID = "oooeihfbclammiikoclfioafldbgacma";
const APP_URL = chrome.runtime.id === PROD_EXT_ID
  ? "https://notecrate.me"
  : "http://localhost:3000";
