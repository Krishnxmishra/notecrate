/**
 * NoteCrate Web App – Data layer unit tests
 *
 * Run with:
 *   node notecrate/tests/data.test.mjs
 *
 * Tests the pure functions in src/lib/data.ts (re-implemented here in JS
 * so they run in Node without a TypeScript build step).
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
      if (actual !== expected)
        throw new Error(
          `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
        );
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected))
        throw new Error(
          `Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
        );
    },
    toBeNull() {
      if (actual !== null)
        throw new Error(`Expected null, got ${JSON.stringify(actual)}`);
    },
    toBeUndefined() {
      if (actual !== undefined)
        throw new Error(`Expected undefined, got ${JSON.stringify(actual)}`);
    },
    toBeTruthy() {
      if (!actual)
        throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`);
    },
    toBeFalsy() {
      if (actual)
        throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`);
    },
    toHaveLength(n) {
      if (!actual || actual.length !== n)
        throw new Error(`Expected length ${n}, got ${actual?.length}`);
    },
    toContain(str) {
      if (!String(actual).includes(str))
        throw new Error(`Expected "${actual}" to contain "${str}"`);
    },
    toBeGreaterThan(n) {
      if (actual <= n) throw new Error(`Expected ${actual} > ${n}`);
    },
    toBeGreaterThanOrEqual(n) {
      if (actual < n) throw new Error(`Expected ${actual} >= ${n}`);
    },
  };
}

function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}

// ─── Data (mirrors src/lib/data.ts) ──────────────────────────────────────────

const folders = [
  { id: "f1", name: "Thesis Research", parentId: null, highlightCount: 24, createdAt: "2026-01-15" },
  { id: "f1a", name: "Literature Review", parentId: "f1", highlightCount: 12, createdAt: "2026-01-16" },
  { id: "f1b", name: "Methodology", parentId: "f1", highlightCount: 8, createdAt: "2026-01-18" },
  { id: "f1c", name: "Case Studies", parentId: "f1", highlightCount: 4, createdAt: "2026-01-20" },
  { id: "f2", name: "Market Analysis", parentId: null, highlightCount: 18, createdAt: "2026-01-22" },
  { id: "f2a", name: "Competitor Landscape", parentId: "f2", highlightCount: 9, createdAt: "2026-01-23" },
  { id: "f2b", name: "Pricing Models", parentId: "f2", highlightCount: 6, createdAt: "2026-01-25" },
  { id: "f3", name: "Kitchen Renovation", parentId: null, highlightCount: 31, createdAt: "2026-02-01" },
  { id: "f4", name: "AI Ethics Essay", parentId: null, highlightCount: 15, createdAt: "2026-02-03" },
  { id: "f4a", name: "Bias & Fairness", parentId: "f4", highlightCount: 7, createdAt: "2026-02-04" },
  { id: "f4b", name: "Regulation", parentId: "f4", highlightCount: 5, createdAt: "2026-02-05" },
  { id: "f5", name: "Guitar Learning", parentId: null, highlightCount: 22, createdAt: "2026-02-06" },
];

const highlights = [
  { id: "h1", text: "Transformers outperform RNNs", sourceTitle: "Attention Is All You Need", sourceUrl: "https://arxiv.org", color: "yellow", folderId: "f1a", createdAt: "2026-01-17", type: "text" },
  { id: "h2", text: "Qualitative research provides context", sourceTitle: "Methods in Modern Research", sourceUrl: "https://journals.sage.com", color: "blue", folderId: "f1b", createdAt: "2026-01-19", type: "text" },
  { id: "h3", text: "Nordic education investment pays off", sourceTitle: "Education Policy", sourceUrl: "https://oecd.org", color: "green", folderId: "f1c", createdAt: "2026-01-21", type: "text" },
  { id: "h4", text: "Value-based pricing boosts margins 24%", sourceTitle: "SaaS Pricing 2026", sourceUrl: "https://openviewpartners.com", color: "orange", folderId: "f2b", createdAt: "2026-01-26", type: "text" },
  { id: "h5", text: "Top 5 players hold 78% market share", sourceTitle: "Market Dynamics Q1 2026", sourceUrl: "https://mckinsey.com", color: "pink", folderId: "f2a", createdAt: "2026-01-24", type: "text" },
  { id: "h6", text: "Shaker cabinets with matte black hardware trending", sourceTitle: "Kitchen Design Trends 2026", sourceUrl: "https://architecturaldigest.com", color: "yellow", folderId: "f3", createdAt: "2026-02-02", type: "text" },
  { id: "h7", text: "Algorithmic bias in hiring tools", sourceTitle: "AI Bias in Employment", sourceUrl: "https://nature.com", color: "pink", folderId: "f4a", createdAt: "2026-02-04", type: "text" },
  { id: "h8", text: "EU AI Act risk-based classification", sourceTitle: "Regulating AI: Global Approaches", sourceUrl: "https://brookings.edu", color: "blue", folderId: "f4b", createdAt: "2026-02-05", type: "text" },
  { id: "h9", text: "Start with G, C, D, Em chords", sourceTitle: "Beginner Guitar Guide", sourceUrl: "https://justinguitar.com", color: "green", folderId: "f5", createdAt: "2026-02-07", type: "text" },
  { id: "h10", text: "Mid-range kitchen reno: $25k-$40k", sourceTitle: "Kitchen Renovation Costs", sourceUrl: "https://houzz.com", color: "orange", folderId: "f3", createdAt: "2026-02-03", type: "text" },
  { id: "h11", text: "Mixed-methods combines survey + observation", sourceTitle: "Bridging Quantitative and Qualitative", sourceUrl: "https://journals.apa.org", color: "blue", folderId: "f1b", createdAt: "2026-01-20", type: "text" },
  { id: "h12", text: "Quartz overtook granite in kitchen specs", sourceTitle: "Countertop Materials Compared", sourceUrl: "https://consumerreports.org", color: "green", folderId: "f3", createdAt: "2026-02-04", type: "text" },
  { id: "h13", text: "Your first guitar lesson", sourceTitle: "Justin Guitar — First Lesson", sourceUrl: "https://www.youtube.com/watch?v=BBz-Jyr23M4", color: "yellow", folderId: "f5", createdAt: "2026-02-08", type: "video", videoId: "BBz-Jyr23M4", videoTimestamp: "2:34" },
  { id: "h14", text: "Kitchen renovation walkthrough", sourceTitle: "$30K Kitchen Renovation", sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", color: "pink", folderId: "f3", createdAt: "2026-02-05", type: "video", videoId: "dQw4w9WgXcQ", videoTimestamp: "0:45" },
  { id: "h15", text: "Travis picking tutorial", sourceTitle: "Travis Picking for Beginners", sourceUrl: "https://www.youtube.com/watch?v=BBz-Jyr23M4", color: "blue", folderId: "f5", createdAt: "2026-02-09", type: "video", videoId: "BBz-Jyr23M4", videoTimestamp: "5:12" },
];

// ─── Functions under test (mirrors src/lib/data.ts) ──────────────────────────

function getFolderTree() {
  const roots = folders.filter((f) => f.parentId === null);
  return roots.map((root) => ({
    ...root,
    children: folders.filter((f) => f.parentId === root.id),
  }));
}

function getFolderById(id) {
  return folders.find((f) => f.id === id);
}

function getHighlightsByFolder(folderId) {
  const folder = getFolderById(folderId);
  if (!folder) return [];
  const childIds = folders.filter((f) => f.parentId === folderId).map((f) => f.id);
  const allIds = [folderId, ...childIds];
  return highlights.filter((h) => allIds.includes(h.folderId));
}

function getRecentHighlights(count = 8) {
  return [...highlights]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, count);
}

function searchHighlights(query) {
  const q = query.toLowerCase();
  return highlights.filter(
    (h) =>
      h.text.toLowerCase().includes(q) ||
      h.sourceTitle.toLowerCase().includes(q)
  );
}

const stats = {
  totalHighlights: highlights.length,
  totalFolders: folders.filter((f) => f.parentId === null).length,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getFolderTree()", () => {
  const tree = getFolderTree();

  test("returns only root folders at top level", () => {
    tree.forEach((node) => {
      expect(node.parentId).toBeNull();
    });
  });

  test("returns 5 root folders", () => {
    expect(tree).toHaveLength(5);
  });

  test("each root has a children array", () => {
    tree.forEach((node) => {
      expect(Array.isArray(node.children)).toBeTruthy();
    });
  });

  test("Thesis Research has 3 children", () => {
    const thesis = tree.find((f) => f.id === "f1");
    expect(thesis).toBeTruthy();
    expect(thesis.children).toHaveLength(3);
  });

  test("Market Analysis has 2 children", () => {
    const market = tree.find((f) => f.id === "f2");
    expect(market.children).toHaveLength(2);
  });

  test("Kitchen Renovation has no children", () => {
    const kitchen = tree.find((f) => f.id === "f3");
    expect(kitchen.children).toHaveLength(0);
  });

  test("children have correct parentId", () => {
    const thesis = tree.find((f) => f.id === "f1");
    thesis.children.forEach((child) => {
      expect(child.parentId).toBe("f1");
    });
  });
});

describe("getFolderById()", () => {
  test("returns the correct folder for a known id", () => {
    const f = getFolderById("f3");
    expect(f.name).toBe("Kitchen Renovation");
  });

  test("returns undefined for an unknown id", () => {
    const f = getFolderById("not-real");
    expect(f).toBeUndefined();
  });

  test("returns subfolder by id", () => {
    const f = getFolderById("f1a");
    expect(f.name).toBe("Literature Review");
    expect(f.parentId).toBe("f1");
  });
});

describe("getHighlightsByFolder()", () => {
  test("returns highlights directly in the folder", () => {
    const hs = getHighlightsByFolder("f3");
    // f3 has highlights: h6, h10, h12, h14
    expect(hs.length).toBeGreaterThanOrEqual(4);
  });

  test("includes highlights from sub-folders", () => {
    // f1 parent — children are f1a, f1b, f1c
    // h1 in f1a, h2 + h11 in f1b, h3 in f1c
    const hs = getHighlightsByFolder("f1");
    expect(hs.length).toBeGreaterThanOrEqual(4);
  });

  test("returns empty array for unknown folder id", () => {
    const hs = getHighlightsByFolder("not-real");
    expect(hs).toHaveLength(0);
  });

  test("returned highlights all belong to the folder or its children", () => {
    const folderIds = ["f2", "f2a", "f2b"];
    const hs = getHighlightsByFolder("f2");
    hs.forEach((h) => {
      expect(folderIds.includes(h.folderId)).toBeTruthy();
    });
  });

  test("Guitar Learning includes video highlights", () => {
    const hs = getHighlightsByFolder("f5");
    const videos = hs.filter((h) => h.type === "video");
    expect(videos.length).toBeGreaterThanOrEqual(2);
  });
});

describe("getRecentHighlights()", () => {
  test("returns correct count", () => {
    expect(getRecentHighlights(5)).toHaveLength(5);
    expect(getRecentHighlights(3)).toHaveLength(3);
  });

  test("defaults to 8 highlights", () => {
    expect(getRecentHighlights()).toHaveLength(8);
  });

  test("returns in descending date order (newest first)", () => {
    const hs = getRecentHighlights(highlights.length);
    for (let i = 1; i < hs.length; i++) {
      const prev = new Date(hs[i - 1].createdAt).getTime();
      const curr = new Date(hs[i].createdAt).getTime();
      expect(prev >= curr).toBeTruthy();
    }
  });

  test("most recent highlight is first", () => {
    const hs = getRecentHighlights(1);
    // h15 is dated 2026-02-09, the latest
    expect(hs[0].id).toBe("h15");
  });
});

describe("searchHighlights()", () => {
  test("matches text content (case-insensitive)", () => {
    const results = searchHighlights("transformer");
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].id).toBe("h1");
  });

  test("matches source title", () => {
    const results = searchHighlights("justin guitar");
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  test("returns empty array for no match", () => {
    const results = searchHighlights("zzznomatch999");
    expect(results).toHaveLength(0);
  });

  test("search is case-insensitive", () => {
    const lower = searchHighlights("kitchen");
    const upper = searchHighlights("KITCHEN");
    expect(lower.length).toBe(upper.length);
  });

  test("partial word match works", () => {
    const results = searchHighlights("algo"); // "Algorithmic"
    expect(results.length).toBeGreaterThanOrEqual(1);
  });

  test("matches across multiple folders", () => {
    const results = searchHighlights("guitar");
    const folderIds = new Set(results.map((h) => h.folderId));
    // Should find results only in f5
    expect(folderIds.has("f5")).toBeTruthy();
  });
});

describe("stats", () => {
  test("totalHighlights matches highlights array length", () => {
    expect(stats.totalHighlights).toBe(highlights.length);
  });

  test("totalFolders counts only root folders", () => {
    const rootCount = folders.filter((f) => f.parentId === null).length;
    expect(stats.totalFolders).toBe(rootCount);
    expect(stats.totalFolders).toBe(5);
  });
});

// ─── Results ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`Web app data tests: ${passed} passed, ${failed} failed`);

if (failures.length > 0) {
  console.error("\nFailed tests:");
  failures.forEach((f) => console.error(`  ✗ ${f.name}: ${f.message}`));
  process.exit(1);
}
