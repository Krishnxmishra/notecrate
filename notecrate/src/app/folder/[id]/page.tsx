"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Filter,
  LayoutGrid,
  List,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TopNav } from "@/components/topnav";
import { HighlightCard } from "@/components/highlight-card";
import {
  getFolderById,
  getHighlightsByFolder,
  folders,
} from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function FolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const folder = getFolderById(id);
  const highlights = getHighlightsByFolder(id);
  const subfolders = folders.filter((f) => f.parentId === id);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  if (!folder) {
    return (
      <AppShell>
        <TopNav title="Folder not found" />
        <div className="flex flex-1 items-center justify-center bg-[#fbfbfb]">
          <p className="text-neutral-400">This folder does not exist.</p>
        </div>
      </AppShell>
    );
  }

  const parentFolder = folder.parentId ? getFolderById(folder.parentId) : null;
  const studioFolderId = folder.parentId || folder.id;

  return (
    <AppShell>
      <TopNav
        title={folder.name}
        subtitle={
          parentFolder
            ? `${parentFolder.name} / ${folder.name}`
            : `${highlights.length} highlights`
        }
      />
      <div className="flex-1 overflow-y-auto bg-[#fbfbfb]">
        <div className="mx-auto max-w-[960px] px-8 py-8">
          {/* AI Studio CTA */}
          <Link
            href={`/studio/${studioFolderId}`}
            className="group mb-6 flex items-center justify-between rounded-xl border border-neutral-200/80 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900">
                <Sparkles className="h-[18px] w-[18px] text-white" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-neutral-900">
                  Upload to Claude
                </p>
                <p className="text-[12px] text-neutral-400">
                  Export your {highlights.length} highlights to use with Claude
                </p>
              </div>
            </div>
            <div className="rounded-md bg-neutral-900 px-3 py-1.5 text-[12px] font-medium text-white transition-colors group-hover:bg-neutral-800">
              Export
            </div>
          </Link>

          {/* Subfolders */}
          {subfolders.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2.5 text-[12px] font-medium uppercase tracking-[0.06em] text-neutral-400">
                Subfolders
              </h3>
              <div className="flex flex-wrap gap-2">
                {subfolders.map((sf) => (
                  <Link
                    key={sf.id}
                    href={`/folder/${sf.id}`}
                    className="flex items-center gap-2 rounded-md border border-neutral-200/80 bg-white px-3 py-2 text-[13px] font-medium text-neutral-700 transition-all hover:border-neutral-300"
                  >
                    {sf.name}
                    <Badge variant="secondary" className="h-5 bg-neutral-100 text-[10px] font-normal text-neutral-500">
                      {sf.highlightCount}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Highlights header */}
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-[12px] font-medium uppercase tracking-[0.06em] text-neutral-400">
              Highlights ({highlights.length})
            </h3>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[12px] text-neutral-400 hover:text-neutral-600">
                <Filter className="h-3 w-3" />
                Filter
              </Button>
              <Separator orientation="vertical" className="mx-0.5 h-4 opacity-40" />
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-7 w-7", viewMode === "grid" && "bg-neutral-100")}
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="h-3.5 w-3.5 text-neutral-500" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-7 w-7", viewMode === "list" && "bg-neutral-100")}
                onClick={() => setViewMode("list")}
              >
                <List className="h-3.5 w-3.5 text-neutral-500" />
              </Button>
            </div>
          </div>

          {/* Highlights */}
          {highlights.length > 0 ? (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-2 gap-3"
                  : "flex flex-col gap-2.5"
              )}
            >
              {highlights.map((h) => (
                <HighlightCard
                  key={h.id}
                  highlight={h}
                  compact={viewMode === "grid"}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-white py-16">
              <p className="text-[13px] font-medium text-neutral-500">
                No highlights yet
              </p>
              <p className="mt-1 text-[12px] text-neutral-400">
                Use the browser extension to save highlights to this folder.
              </p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
