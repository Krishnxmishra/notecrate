"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FolderClosed,
  Copy,
  Check,
  Download,
  FileText,
  ExternalLink,
  BookOpen,
  Sparkles,
  Filter,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TopNav } from "@/components/topnav";
import {
  getFolderById,
  getHighlightsByFolder,
  HIGHLIGHT_COLORS,
  type Highlight,
  type HighlightColor,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type ExportFormat = "markdown" | "json" | "txt";

export default function StudioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const folder = getFolderById(id);
  const highlights = getHighlightsByFolder(id);
  const [copied, setCopied] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("markdown");
  const [selectedColors, setSelectedColors] = useState<Set<HighlightColor>>(
    new Set()
  );

  const filteredHighlights = useMemo(() => {
    if (selectedColors.size === 0) return highlights;
    return highlights.filter((h) => selectedColors.has(h.color));
  }, [highlights, selectedColors]);

  if (!folder) {
    return (
      <AppShell>
        <TopNav title="Studio" subtitle="Folder not found" />
        <div className="flex flex-1 items-center justify-center bg-[#fbfbfb]">
          <p className="text-neutral-400">This folder does not exist.</p>
        </div>
      </AppShell>
    );
  }

  function formatForClaude(hs: Highlight[], format: ExportFormat): string {
    if (format === "json") {
      return JSON.stringify(
        {
          folder: folder!.name,
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

    if (format === "txt") {
      const lines = [`Folder: ${folder!.name}`, `Highlights: ${hs.length}`, ""];
      hs.forEach((h, i) => {
        lines.push(`[${i + 1}] ${h.text}`);
        lines.push(`    Source: ${h.sourceTitle}`);
        lines.push(`    URL: ${h.sourceUrl}`);
        if (h.videoId) lines.push(`    Video timestamp: ${h.videoTimestamp}`);
        lines.push("");
      });
      return lines.join("\n");
    }

    // markdown (default)
    const lines = [
      `# ${folder!.name}`,
      "",
      `> ${hs.length} highlights from ${new Set(hs.map((h) => h.sourceTitle)).size} sources`,
      "",
    ];

    // Group by source
    const bySource = new Map<string, Highlight[]>();
    hs.forEach((h) => {
      const existing = bySource.get(h.sourceTitle) || [];
      existing.push(h);
      bySource.set(h.sourceTitle, existing);
    });

    bySource.forEach((sourceHighlights, source) => {
      const url = sourceHighlights[0].sourceUrl;
      lines.push(`## ${source}`);
      lines.push(`[${url}](${url})`);
      lines.push("");
      sourceHighlights.forEach((h) => {
        lines.push(`- ${h.text}`);
        if (h.videoId) lines.push(`  - *Video at ${h.videoTimestamp}*`);
      });
      lines.push("");
    });

    return lines.join("\n");
  }

  const formattedContent = formatForClaude(filteredHighlights, exportFormat);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const ext = exportFormat === "json" ? "json" : exportFormat === "txt" ? "txt" : "md";
    const mime = exportFormat === "json" ? "application/json" : "text/plain";
    const blob = new Blob([formattedContent], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${folder!.name.toLowerCase().replace(/\s+/g, "-")}-highlights.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleColor = (color: HighlightColor) => {
    setSelectedColors((prev) => {
      const next = new Set(prev);
      if (next.has(color)) next.delete(color);
      else next.add(color);
      return next;
    });
  };

  return (
    <AppShell>
      <TopNav
        title="Upload to Claude"
        subtitle={folder.name}
        actions={
          <Link href={`/folder/${folder.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-[12px] text-neutral-500"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to folder
            </Button>
          </Link>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main content */}
        <div className="flex flex-1 flex-col">
          {/* Header card */}
          <div className="border-b border-neutral-200/60 bg-white px-6 py-5">
            <div className="mx-auto max-w-[800px]">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-neutral-900">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold tracking-[-0.01em] text-neutral-900">
                    Export for Claude
                  </h2>
                  <p className="mt-1 text-[13px] leading-relaxed text-neutral-500">
                    Copy or download your highlights to use with Claude. Upload the
                    file as context in any Claude conversation, or use the{" "}
                    <span className="font-medium text-neutral-700">
                      NoteCrate MCP server
                    </span>{" "}
                    for direct integration.
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {/* Format selector */}
                <div className="flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-50 p-0.5">
                  {(["markdown", "json", "txt"] as ExportFormat[]).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => setExportFormat(fmt)}
                      className={cn(
                        "rounded-md px-3 py-1.5 text-[12px] font-medium transition-all",
                        exportFormat === fmt
                          ? "bg-white text-neutral-900 shadow-sm"
                          : "text-neutral-500 hover:text-neutral-700"
                      )}
                    >
                      {fmt === "markdown" ? "Markdown" : fmt === "json" ? "JSON" : "Plain Text"}
                    </button>
                  ))}
                </div>

                {/* Color filter */}
                <div className="flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-neutral-400" />
                  {(Object.keys(HIGHLIGHT_COLORS) as HighlightColor[]).map((color) => (
                    <button
                      key={color}
                      onClick={() => toggleColor(color)}
                      className={cn(
                        "h-5 w-5 rounded-full border-2 transition-all",
                        HIGHLIGHT_COLORS[color].dot,
                        selectedColors.has(color)
                          ? "border-neutral-900 scale-110"
                          : selectedColors.size === 0
                            ? "border-transparent opacity-60 hover:opacity-100"
                            : "border-transparent opacity-30 hover:opacity-60"
                      )}
                    />
                  ))}
                </div>

                <div className="flex-1" />

                {/* Actions */}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 border-neutral-200 text-[12px]"
                  onClick={handleDownload}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 bg-neutral-900 text-[12px] hover:bg-neutral-800"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy to clipboard
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="flex-1 overflow-y-auto bg-[#fbfbfb] px-6 py-5">
            <div className="mx-auto max-w-[800px]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] text-neutral-400">
                  <FileText className="h-3.5 w-3.5" />
                  Preview &middot; {filteredHighlights.length} highlights
                </div>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-white">
                <ScrollArea className="max-h-[calc(100vh-340px)]">
                  <pre className="whitespace-pre-wrap p-5 font-mono text-[12px] leading-[1.8] text-neutral-700">
                    {formattedContent}
                  </pre>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar - MCP instructions */}
        <div className="hidden w-[300px] flex-col border-l border-neutral-200/60 bg-[#fafafa] xl:flex">
          <div className="px-4 py-4">
            <h3 className="text-[12px] font-medium uppercase tracking-[0.06em] text-neutral-400">
              How to use with Claude
            </h3>
          </div>
          <ScrollArea className="flex-1 px-4">
            <div className="flex flex-col gap-5 pb-6">
              {/* Option 1 */}
              <div className="rounded-lg border border-neutral-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-900 text-[11px] font-bold text-white">
                    1
                  </div>
                  <span className="text-[13px] font-medium text-neutral-900">
                    Copy & paste
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-neutral-500">
                  Click &quot;Copy to clipboard&quot; and paste directly into a Claude
                  conversation as context for your questions.
                </p>
              </div>

              {/* Option 2 */}
              <div className="rounded-lg border border-neutral-200 bg-white p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-900 text-[11px] font-bold text-white">
                    2
                  </div>
                  <span className="text-[13px] font-medium text-neutral-900">
                    Upload file
                  </span>
                </div>
                <p className="text-[12px] leading-relaxed text-neutral-500">
                  Download the file and upload it to Claude. Works great with the
                  Projects feature for persistent context.
                </p>
              </div>

              {/* Option 3 - MCP */}
              <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50/50 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded bg-neutral-900 text-[11px] font-bold text-white">
                    3
                  </div>
                  <span className="text-[13px] font-medium text-neutral-900">
                    MCP Server
                  </span>
                  <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                    Advanced
                  </span>
                </div>
                <p className="mb-3 text-[12px] leading-relaxed text-neutral-500">
                  Connect Claude directly to your highlights using the NoteCrate MCP
                  server. Claude can read your folders automatically.
                </p>
                <div className="rounded-md bg-neutral-900 p-3">
                  <code className="block text-[11px] leading-relaxed text-neutral-300">
                    <span className="text-neutral-500">{"// claude_desktop_config.json"}</span>
                    {"\n"}
                    {`{`}
                    {"\n  "}
                    <span className="text-amber-400">{`"mcpServers"`}</span>
                    {`: {`}
                    {"\n    "}
                    <span className="text-amber-400">{`"notecrate"`}</span>
                    {`: {`}
                    {"\n      "}
                    <span className="text-amber-400">{`"command"`}</span>
                    {`: `}
                    <span className="text-green-400">{`"node"`}</span>
                    {`,`}
                    {"\n      "}
                    <span className="text-amber-400">{`"args"`}</span>
                    {`: [`}
                    <span className="text-green-400">{`"server.js"`}</span>
                    {`]`}
                    {"\n    "}
                    {`}`}
                    {"\n  "}
                    {`}`}
                    {"\n"}
                    {`}`}
                  </code>
                </div>
              </div>

              {/* Suggestions */}
              <div>
                <h4 className="mb-2 text-[12px] font-medium text-neutral-500">
                  Suggested prompts for Claude
                </h4>
                <div className="flex flex-col gap-1.5">
                  {[
                    "Summarize the key themes",
                    "Create a comparison table",
                    "What are the main takeaways?",
                    "Find contradictions across sources",
                  ].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => {
                        navigator.clipboard.writeText(prompt);
                      }}
                      className="rounded-md border border-neutral-200 bg-white px-3 py-2 text-left text-[12px] text-neutral-600 transition-colors hover:border-neutral-300 hover:bg-neutral-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </AppShell>
  );
}
