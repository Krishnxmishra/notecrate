/**
 * NoteCrate Extension – Unit Tests
 *
 * Run with Node (no framework needed):
 *   node extension/tests/extension.test.js
 *
 * These tests cover the pure utility functions extracted from content.js,
 * background.js, and sidepanel.js. Functions are re-implemented here so
 * they can be tested without a browser environment.
 */

// ─── Mini test harness ────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
const failures = [];

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`      ${err.message}`);
    failures.push({ name, message: err.message });
    failed++;
  }
}

function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected) {
      const a = JSON.stringify(actual);
      const b = JSON.stringify(expected);
      if (a !== b) {
        throw new Error(`Expected ${b}, got ${a}`);
      }
    },
    toBeNull() {
      if (actual !== null) {
        throw new Error(`Expected null, got ${JSON.stringify(actual)}`);
      }
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`);
    },
    toContain(str) {
      if (!String(actual).includes(str)) {
        throw new Error(`Expected "${actual}" to contain "${str}"`);
      }
    },
    toHaveLength(n) {
      if (!actual || actual.length !== n) {
        throw new Error(`Expected length ${n}, got ${actual?.length}`);
      }
    },
  };
}

function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}

// ─── Functions under test (copied from extension source) ─────────────────────

// From content.js
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// From content.js
function isYouTubeWatch(url) {
  const u = new URL(url);
  return u.hostname.includes("youtube.com") && u.pathname.startsWith("/watch");
}

// From background.js and sidepanel.js (URL API-based, handles any query param order)
function extractYouTubeId(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return v;
      const parts = u.pathname.split("/");
      if ((parts[1] === "embed" || parts[1] === "shorts") && parts[2]) return parts[2].slice(0,11);
    }
    if (u.hostname === 'youtu.be') {
      return u.pathname.slice(1, 12) || null;
    }
  } catch (_) {
    // malformed URL — return null
    return null;
  }
  return null;
}

// Escape function from sidepanel.js (logic only, no DOM)
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// From background.js
function buildHighlightPayload(data, prefs) {
  return {
    text: data.text || "",
    sourceTitle: data.sourceTitle || "",
    sourceUrl: data.sourceUrl || "",
    color: prefs.activeColor || "yellow",
    folderId: prefs.activeFolder,
    type: data.type || "text",
    imageUrl: data.imageUrl || null,
    videoId: data.videoId || null,
    videoTimestamp: data.videoTimestamp || null,
  };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("formatTime()", () => {
  test("formats seconds-only (< 1 min)", () => {
    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(9)).toBe("0:09");
    expect(formatTime(59)).toBe("0:59");
  });

  test("formats minutes and seconds", () => {
    expect(formatTime(60)).toBe("1:00");
    expect(formatTime(90)).toBe("1:30");
    expect(formatTime(125)).toBe("2:05");
    expect(formatTime(3599)).toBe("59:59");
  });

  test("formats hours:minutes:seconds", () => {
    expect(formatTime(3600)).toBe("1:00:00");
    expect(formatTime(3661)).toBe("1:01:01");
    expect(formatTime(7384)).toBe("2:03:04");
  });

  test("pads single-digit minutes and seconds with zero", () => {
    expect(formatTime(61)).toBe("1:01");
    expect(formatTime(3601)).toBe("1:00:01");
  });
});

describe("isYouTubeWatch()", () => {
  test("returns true for youtube.com/watch URLs", () => {
    expect(isYouTubeWatch("https://www.youtube.com/watch?v=abc123")).toBeTruthy();
    expect(isYouTubeWatch("https://youtube.com/watch?v=xyz")).toBeTruthy();
  });

  test("returns false for non-watch YouTube pages", () => {
    expect(isYouTubeWatch("https://www.youtube.com/")).toBeFalsy();
    expect(isYouTubeWatch("https://www.youtube.com/shorts/abc")).toBeFalsy();
    expect(isYouTubeWatch("https://www.youtube.com/feed/subscriptions")).toBeFalsy();
  });

  test("returns false for non-YouTube URLs", () => {
    expect(isYouTubeWatch("https://google.com")).toBeFalsy();
    expect(isYouTubeWatch("https://localhost:3000")).toBeFalsy();
    expect(isYouTubeWatch("https://youtu.be/abc")).toBeFalsy();
  });
});

describe("extractYouTubeId()", () => {
  test("extracts id from standard watch URL", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://youtube.com/watch?v=BBz-Jyr23M4")).toBe("BBz-Jyr23M4");
  });

  test("extracts id from youtu.be short URL", () => {
    expect(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  test("extracts id from embed URL", () => {
    expect(extractYouTubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  test("extracts id from shorts URL", () => {
    expect(extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  test("returns null for non-YouTube URLs", () => {
    expect(extractYouTubeId("https://google.com")).toBeNull();
    expect(extractYouTubeId("https://example.com/watch?v=abc")).toBeNull();
  });

  test("returns null for null/undefined input", () => {
    expect(extractYouTubeId(null)).toBeNull();
    expect(extractYouTubeId("")).toBeNull();
    expect(extractYouTubeId(undefined)).toBeNull();
  });

  test("handles URLs with extra query params", () => {
    expect(extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=30s")).toBe("dQw4w9WgXcQ");
    expect(extractYouTubeId("https://www.youtube.com/watch?list=PL123&v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });
});

describe("escapeHtml()", () => {
  test("escapes < and >", () => {
    expect(escapeHtml("<script>")).toContain("&lt;");
    expect(escapeHtml("<script>")).toContain("&gt;");
  });

  test("escapes ampersands", () => {
    expect(escapeHtml("fish & chips")).toContain("&amp;");
  });

  test("escapes quotes", () => {
    expect(escapeHtml('"hello"')).toContain("&quot;");
    expect(escapeHtml("it's")).toContain("&#039;");
  });

  test("returns empty string for falsy input", () => {
    expect(escapeHtml("")).toBe("");
    expect(escapeHtml(null)).toBe("");
    expect(escapeHtml(undefined)).toBe("");
  });

  test("passes through plain text unchanged", () => {
    expect(escapeHtml("Hello World 123")).toBe("Hello World 123");
  });
});

describe("buildHighlightPayload()", () => {
  test("builds a text highlight payload", () => {
    const data = {
      text: "Some highlighted text",
      sourceTitle: "My Article",
      sourceUrl: "https://example.com",
      type: "text",
    };
    const prefs = { activeColor: "blue", activeFolder: "f1" };
    const result = buildHighlightPayload(data, prefs);

    expect(result.text).toBe("Some highlighted text");
    expect(result.color).toBe("blue");
    expect(result.folderId).toBe("f1");
    expect(result.type).toBe("text");
    expect(result.videoId).toBeNull();
    expect(result.imageUrl).toBeNull();
  });

  test("builds a video highlight payload", () => {
    const data = {
      text: "My Video (at 1:23)",
      sourceTitle: "Tutorial",
      sourceUrl: "https://www.youtube.com/watch?v=abc123",
      type: "video",
      videoId: "abc123",
      videoTimestamp: "1:23",
    };
    const prefs = { activeColor: "yellow", activeFolder: "f2" };
    const result = buildHighlightPayload(data, prefs);

    expect(result.type).toBe("video");
    expect(result.videoId).toBe("abc123");
    expect(result.videoTimestamp).toBe("1:23");
  });

  test("defaults color to yellow when not set", () => {
    const result = buildHighlightPayload({ text: "hi" }, { activeFolder: "f1" });
    expect(result.color).toBe("yellow");
  });

  test("defaults type to text when not set", () => {
    const result = buildHighlightPayload({}, { activeColor: "pink", activeFolder: "f1" });
    expect(result.type).toBe("text");
  });

  test("handles empty text gracefully", () => {
    const result = buildHighlightPayload({}, { activeColor: "green", activeFolder: "f1" });
    expect(result.text).toBe("");
    expect(result.sourceTitle).toBe("");
    expect(result.sourceUrl).toBe("");
  });
});

// ─── Results ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`Extension tests: ${passed} passed, ${failed} failed`);

if (failures.length > 0) {
  console.error("\nFailed tests:");
  failures.forEach((f) => console.error(`  ✗ ${f.name}: ${f.message}`));
  process.exit(1);
}
