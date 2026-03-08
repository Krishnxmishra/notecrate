/**
 * NoteCrate MCP Server – Unit Tests
 *
 * Run with:
 *   node mcp-server/tests/server.test.js
 *
 * Tests cover the pure helper functions used by the MCP tools.
 * No MCP SDK or network calls are made.
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
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
      }
    },
    toBeNull() {
      if (actual !== null)
        throw new Error(`Expected null, got ${JSON.stringify(actual)}`);
    },
    toBeTruthy() {
      if (!actual) throw new Error(`Expected truthy, got ${JSON.stringify(actual)}`);
    },
    toBeFalsy() {
      if (actual) throw new Error(`Expected falsy, got ${JSON.stringify(actual)}`);
    },
    toContain(str) {
      if (!String(actual).includes(str))
        throw new Error(`Expected "${actual}" to contain "${str}"`);
    },
    toHaveLength(n) {
      if (!actual || actual.length !== n)
        throw new Error(`Expected length ${n}, got ${actual?.length}`);
    },
    toBeGreaterThan(n) {
      if (actual <= n) throw new Error(`Expected ${actual} > ${n}`);
    },
  };
}

function describe(name, fn) {
  console.log(`\n${name}`);
  fn();
}

// ─── Functions under test (copied from server.js) ────────────────────────────

function getFolderWithChildren(folders, folderId) {
  const folder = folders.find((f) => f.id === folderId);
  if (!folder) return null;
  const childIds = folders
    .filter((f) => f.parentId === folderId)
    .map((f) => f.id);
  return { folder, childIds: [folderId, ...childIds] };
}

function highlightsForFolder(highlights, folderIds) {
  return highlights.filter((h) => folderIds.includes(h.folderId));
}

function formatMarkdown(folderName, hs) {
  const sources = new Map();
  hs.forEach((h) => {
    const list = sources.get(h.sourceTitle) || [];
    list.push(h);
    sources.set(h.sourceTitle, list);
  });

  const lines = [
    `# ${folderName}`,
    "",
    `> ${hs.length} highlights from ${sources.size} sources`,
    "",
  ];

  sources.forEach((items, source) => {
    const url = items[0].sourceUrl;
    lines.push(`## ${source}`);
    lines.push(url);
    lines.push("");
    items.forEach((h) => {
      lines.push(`- ${h.text}`);
      if (h.videoId) lines.push(`  *(video at ${h.videoTimestamp})*`);
    });
    lines.push("");
  });

  return lines.join("\n");
}

function formatJson(folderName, hs) {
  return JSON.stringify(
    {
      folder: folderName,
      highlightCount: hs.length,
      highlights: hs.map((h) => ({
        text: h.text,
        source: h.sourceTitle,
        url: h.sourceUrl,
        color: h.color,
        type: h.type,
        ...(h.videoId ? { videoId: h.videoId, timestamp: h.videoTimestamp } : {}),
        savedAt: h.createdAt,
      })),
    },
    null,
    2
  );
}

function formatTxt(folderName, hs) {
  const lines = [`Folder: ${folderName}`, `Highlights: ${hs.length}`, ""];
  hs.forEach((h, i) => {
    lines.push(`[${i + 1}] ${h.text}`);
    lines.push(`    Source: ${h.sourceTitle}`);
    lines.push(`    URL: ${h.sourceUrl}`);
    if (h.videoId) lines.push(`    Video at: ${h.videoTimestamp}`);
    lines.push("");
  });
  return lines.join("\n");
}

// ─── Test data ────────────────────────────────────────────────────────────────

const folders = [
  { id: "f1", name: "Research", parentId: null },
  { id: "f1a", name: "Literature", parentId: "f1" },
  { id: "f1b", name: "Methods", parentId: "f1" },
  { id: "f2", name: "Kitchen Reno", parentId: null },
];

const highlights = [
  {
    id: "h1",
    text: "Transformers outperform RNNs",
    sourceTitle: "Attention Is All You Need",
    sourceUrl: "https://arxiv.org/abs/1706",
    color: "yellow",
    folderId: "f1",
    type: "text",
    createdAt: "2026-01-01",
  },
  {
    id: "h2",
    text: "Qualitative methods provide context",
    sourceTitle: "Research Methods",
    sourceUrl: "https://journals.example.com/methods",
    color: "blue",
    folderId: "f1a",
    type: "text",
    createdAt: "2026-01-02",
  },
  {
    id: "h3",
    text: "Mixed methods combine both",
    sourceTitle: "Research Methods",
    sourceUrl: "https://journals.example.com/methods",
    color: "blue",
    folderId: "f1b",
    type: "text",
    createdAt: "2026-01-03",
  },
  {
    id: "h4",
    text: "Shaker cabinets are trending",
    sourceTitle: "Kitchen Trends 2026",
    sourceUrl: "https://example.com/kitchen",
    color: "green",
    folderId: "f2",
    type: "text",
    createdAt: "2026-02-01",
  },
  {
    id: "h5",
    text: "Kitchen walkthrough",
    sourceTitle: "Our $30K Kitchen",
    sourceUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    color: "pink",
    folderId: "f2",
    type: "video",
    videoId: "dQw4w9WgXcQ",
    videoTimestamp: "0:45",
    createdAt: "2026-02-02",
  },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("getFolderWithChildren()", () => {
  test("returns folder and its own id when no children", () => {
    const result = getFolderWithChildren(folders, "f2");
    expect(result).toBeTruthy();
    expect(result.folder.name).toBe("Kitchen Reno");
    expect(result.childIds).toEqual(["f2"]);
  });

  test("includes child folder ids", () => {
    const result = getFolderWithChildren(folders, "f1");
    expect(result.childIds).toContain("f1");
    expect(result.childIds).toContain("f1a");
    expect(result.childIds).toContain("f1b");
    expect(result.childIds).toHaveLength(3);
  });

  test("returns null for unknown folder id", () => {
    const result = getFolderWithChildren(folders, "not-real");
    expect(result).toBeNull();
  });

  test("returns null for empty folders array", () => {
    const result = getFolderWithChildren([], "f1");
    expect(result).toBeNull();
  });
});

describe("highlightsForFolder()", () => {
  test("returns highlights matching the folder id list", () => {
    const result = highlightsForFolder(highlights, ["f2"]);
    expect(result).toHaveLength(2);
  });

  test("includes highlights from all provided folder ids", () => {
    const result = highlightsForFolder(highlights, ["f1", "f1a", "f1b"]);
    expect(result).toHaveLength(3);
  });

  test("returns empty array when no highlights match", () => {
    const result = highlightsForFolder(highlights, ["f99"]);
    expect(result).toHaveLength(0);
  });

  test("returns empty array when folderIds is empty", () => {
    const result = highlightsForFolder(highlights, []);
    expect(result).toHaveLength(0);
  });
});

describe("formatMarkdown()", () => {
  test("includes folder name as h1", () => {
    const md = formatMarkdown("Research", highlights.slice(0, 1));
    expect(md).toContain("# Research");
  });

  test("includes highlight count in summary line", () => {
    const md = formatMarkdown("Research", highlights.slice(0, 3));
    expect(md).toContain("3 highlights");
  });

  test("groups highlights under source h2 headings", () => {
    const md = formatMarkdown("Research", highlights.slice(0, 1));
    expect(md).toContain("## Attention Is All You Need");
    expect(md).toContain("- Transformers outperform RNNs");
  });

  test("multiple highlights from same source appear under one heading", () => {
    const sameSourceHighlights = highlights.filter(
      (h) => h.sourceTitle === "Research Methods"
    );
    const md = formatMarkdown("Research", sameSourceHighlights);
    // Only one ## Research Methods heading
    const headingCount = (md.match(/## Research Methods/g) || []).length;
    expect(headingCount).toBe(1);
    expect(md).toContain("- Qualitative methods provide context");
    expect(md).toContain("- Mixed methods combine both");
  });

  test("includes video timestamp annotation for video highlights", () => {
    const md = formatMarkdown("Kitchen", highlights.filter((h) => h.videoId));
    expect(md).toContain("video at 0:45");
  });

  test("includes source URL", () => {
    const md = formatMarkdown("Research", highlights.slice(0, 1));
    expect(md).toContain("https://arxiv.org/abs/1706");
  });
});

describe("formatJson()", () => {
  test("produces valid JSON", () => {
    const json = formatJson("Research", highlights.slice(0, 2));
    const parsed = JSON.parse(json);
    expect(parsed.folder).toBe("Research");
  });

  test("includes correct highlight count", () => {
    const parsed = JSON.parse(formatJson("Research", highlights.slice(0, 3)));
    expect(parsed.highlightCount).toBe(3);
  });

  test("maps highlight fields correctly", () => {
    const parsed = JSON.parse(formatJson("Research", highlights.slice(0, 1)));
    const h = parsed.highlights[0];
    expect(h.text).toBe("Transformers outperform RNNs");
    expect(h.source).toBe("Attention Is All You Need");
    expect(h.color).toBe("yellow");
    expect(h.type).toBe("text");
  });

  test("includes videoId and timestamp for video highlights", () => {
    const videoHighlight = highlights.find((h) => h.videoId);
    const parsed = JSON.parse(formatJson("Kitchen", [videoHighlight]));
    const h = parsed.highlights[0];
    expect(h.videoId).toBe("dQw4w9WgXcQ");
    expect(h.timestamp).toBe("0:45");
  });

  test("does not include videoId for text highlights", () => {
    const textHighlight = highlights.find((h) => !h.videoId);
    const parsed = JSON.parse(formatJson("Research", [textHighlight]));
    const h = parsed.highlights[0];
    expect(h.videoId === undefined).toBeTruthy();
  });
});

describe("formatTxt()", () => {
  test("includes folder name and count header", () => {
    const txt = formatTxt("Research", highlights.slice(0, 2));
    expect(txt).toContain("Folder: Research");
    expect(txt).toContain("Highlights: 2");
  });

  test("numbers highlights starting from 1", () => {
    const txt = formatTxt("Research", highlights.slice(0, 2));
    expect(txt).toContain("[1]");
    expect(txt).toContain("[2]");
  });

  test("includes source and URL for each highlight", () => {
    const txt = formatTxt("Research", highlights.slice(0, 1));
    expect(txt).toContain("Source: Attention Is All You Need");
    expect(txt).toContain("URL: https://arxiv.org/abs/1706");
  });

  test("includes video timestamp for video highlights", () => {
    const txt = formatTxt("Kitchen", highlights.filter((h) => h.videoId));
    expect(txt).toContain("Video at: 0:45");
  });

  test("returns header-only string for empty highlights", () => {
    const txt = formatTxt("Empty", []);
    expect(txt).toContain("Folder: Empty");
    expect(txt).toContain("Highlights: 0");
  });
});

describe("Full folder export pipeline", () => {
  test("Research folder (f1) with children returns all 3 highlights", () => {
    const { childIds } = getFolderWithChildren(folders, "f1");
    const hs = highlightsForFolder(highlights, childIds);
    expect(hs).toHaveLength(3);
  });

  test("Kitchen Reno folder (f2) returns 2 highlights", () => {
    const { childIds } = getFolderWithChildren(folders, "f2");
    const hs = highlightsForFolder(highlights, childIds);
    expect(hs).toHaveLength(2);
  });

  test("Markdown export of f1 contains all highlight texts", () => {
    const { folder, childIds } = getFolderWithChildren(folders, "f1");
    const hs = highlightsForFolder(highlights, childIds);
    const md = formatMarkdown(folder.name, hs);
    expect(md).toContain("Transformers outperform RNNs");
    expect(md).toContain("Qualitative methods provide context");
    expect(md).toContain("Mixed methods combine both");
  });

  test("JSON export of f2 contains video highlight with timestamp", () => {
    const { folder, childIds } = getFolderWithChildren(folders, "f2");
    const hs = highlightsForFolder(highlights, childIds);
    const parsed = JSON.parse(formatJson(folder.name, hs));
    const videoH = parsed.highlights.find((h) => h.videoId);
    expect(videoH).toBeTruthy();
    expect(videoH.timestamp).toBe("0:45");
  });
});

// ─── Results ──────────────────────────────────────────────────────────────────

console.log(`\n${"─".repeat(50)}`);
console.log(`MCP server tests: ${passed} passed, ${failed} failed`);

if (failures.length > 0) {
  console.error("\nFailed tests:");
  failures.forEach((f) => console.error(`  ✗ ${f.name}: ${f.message}`));
  process.exit(1);
}
