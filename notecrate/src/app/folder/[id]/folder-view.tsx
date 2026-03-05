"use client";

import { useState } from "react";
import Link from "next/link";
import { Filter, LayoutGrid, List } from "lucide-react";
import { HighlightCard } from "@/components/highlight-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Highlight, Folder } from "@/lib/data";

interface FolderViewProps {
  highlights: Highlight[];
  subfolders: Folder[];
}

export function FolderView({ highlights, subfolders }: FolderViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <>
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
    </>
  );
}
