/**
 * NoteCrate MCP Server
 *
 * Exposes NoteCrate highlights and folders as MCP tools so Claude can
 * read your research directly without copy-pasting.
 *
 * Tools:
 *   list_folders          – list all folders
 *   get_folder_highlights – get all highlights in a folder (+ subfolders)
 *   search_highlights     – full-text search across all highlights
 *   export_folder         – export a folder as Markdown/JSON/TXT
 *
 * The server reads from a local data file (notecrate-data.json) that is
 * produced by the web app's "Download" export button, or kept in sync
 * by the Supabase integration. Point DATA_FILE env var to its path.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "fs";
import path from "path";

// ─── Data loading ─────────────────────────────────────────────────────────────

const DATA_FILE = process.env.DATA_FILE
  ? path.resolve(process.env.DATA_FILE)
  : path.join(process.cwd(), "notecrate-data.json");

function loadData() {
  if (!fs.existsSync(DATA_FILE)) {
    return { folders: [], highlights: [] };
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return { folders: [], highlights: [] };
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
      exportedAt: new Date().toISOString(),
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

// ─── MCP Server ───────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "notecrate",
  version: "1.0.0",
});

// Tool: list_folders
server.tool(
  "list_folders",
  "List all NoteCrate folders with highlight counts",
  {},
  async () => {
    const { folders, highlights } = loadData();
    const rows = folders.map((f) => {
      const count = highlights.filter((h) => h.folderId === f.id).length;
      const parent = f.parentId
        ? folders.find((p) => p.id === f.parentId)?.name
        : null;
      return `- ${f.name}${parent ? ` (in ${parent})` : ""} [id: ${f.id}] — ${count} highlights`;
    });

    return {
      content: [
        {
          type: "text",
          text:
            rows.length > 0
              ? `NoteCrate folders:\n\n${rows.join("\n")}`
              : "No folders found. Export your data from the NoteCrate web app first.",
        },
      ],
    };
  }
);

// Tool: get_folder_highlights
server.tool(
  "get_folder_highlights",
  "Get all highlights saved in a folder (includes highlights from sub-folders)",
  {
    folder_id: z.string().describe("The folder id (from list_folders)"),
    format: z
      .enum(["markdown", "json", "txt"])
      .optional()
      .default("markdown")
      .describe("Output format"),
  },
  async ({ folder_id, format }) => {
    const { folders, highlights } = loadData();
    const result = getFolderWithChildren(folders, folder_id);

    if (!result) {
      return {
        content: [
          {
            type: "text",
            text: `Folder with id "${folder_id}" not found. Use list_folders to see available folders.`,
          },
        ],
      };
    }

    const { folder, childIds } = result;
    const hs = highlightsForFolder(highlights, childIds);

    if (hs.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: `Folder "${folder.name}" has no highlights yet.`,
          },
        ],
      };
    }

    const text =
      format === "json"
        ? formatJson(folder.name, hs)
        : format === "txt"
        ? formatTxt(folder.name, hs)
        : formatMarkdown(folder.name, hs);

    return { content: [{ type: "text", text }] };
  }
);

// Tool: search_highlights
server.tool(
  "search_highlights",
  "Search all saved highlights by keyword",
  {
    query: z.string().describe("Search term"),
    limit: z
      .number()
      .optional()
      .default(20)
      .describe("Max results to return (default 20)"),
  },
  async ({ query, limit }) => {
    const { highlights, folders } = loadData();
    const q = query.toLowerCase();
    const results = highlights
      .filter(
        (h) =>
          h.text.toLowerCase().includes(q) ||
          h.sourceTitle.toLowerCase().includes(q)
      )
      .slice(0, limit);

    if (results.length === 0) {
      return {
        content: [{ type: "text", text: `No highlights found for "${query}".` }],
      };
    }

    const lines = [
      `Found ${results.length} highlight(s) for "${query}":`,
      "",
    ];
    results.forEach((h, i) => {
      const folder = folders.find((f) => f.id === h.folderId);
      lines.push(
        `[${i + 1}] ${h.text}\n    Source: ${h.sourceTitle}\n    Folder: ${folder?.name ?? h.folderId}`
      );
    });

    return { content: [{ type: "text", text: lines.join("\n") }] };
  }
);

// Tool: export_folder
server.tool(
  "export_folder",
  "Export an entire folder's highlights as a formatted document (Markdown, JSON, or plain text). Use this when you want Claude to have full context of a folder before answering questions.",
  {
    folder_id: z.string().describe("The folder id (from list_folders)"),
    format: z
      .enum(["markdown", "json", "txt"])
      .optional()
      .default("markdown")
      .describe("Export format"),
  },
  async ({ folder_id, format }) => {
    // Same as get_folder_highlights but named more clearly for export use
    const { folders, highlights } = loadData();
    const result = getFolderWithChildren(folders, folder_id);

    if (!result) {
      return {
        content: [
          {
            type: "text",
            text: `Folder "${folder_id}" not found.`,
          },
        ],
      };
    }

    const { folder, childIds } = result;
    const hs = highlightsForFolder(highlights, childIds);
    const text =
      format === "json"
        ? formatJson(folder.name, hs)
        : format === "txt"
        ? formatTxt(folder.name, hs)
        : formatMarkdown(folder.name, hs);

    return { content: [{ type: "text", text }] };
  }
);

// ─── Start ────────────────────────────────────────────────────────────────────

const transport = new StdioServerTransport();
await server.connect(transport);
