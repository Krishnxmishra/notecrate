"use client";

import { ExternalLink, MoreHorizontal, Play, Clock } from "lucide-react";
import { type Highlight, HIGHLIGHT_COLORS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HighlightCardProps {
  highlight: Highlight;
  compact?: boolean;
}

export function HighlightCard({ highlight, compact }: HighlightCardProps) {
  const colors = HIGHLIGHT_COLORS[highlight.color];
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="group relative">
      {/* YouTube embed */}
      {highlight.type === "video" && highlight.videoId && (
        <div className="mb-0 overflow-hidden rounded-t-lg border border-b-0 border-border bg-black">
          {showVideo ? (
            <div className="relative aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${highlight.videoId}?autoplay=1${highlight.videoTimestamp ? `&start=${timestampToSeconds(highlight.videoTimestamp)}` : ""}`}
                className="absolute inset-0 h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <button
              onClick={() => setShowVideo(true)}
              className="relative block w-full"
            >
              <div className="relative aspect-video w-full bg-neutral-900">
                <img
                  src={`https://img.youtube.com/vi/${highlight.videoId}/hqdefault.jpg`}
                  alt={highlight.sourceTitle}
                  className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
                    <Play className="h-6 w-6 fill-current pl-0.5" />
                  </div>
                </div>
                {highlight.videoTimestamp && (
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-medium text-white">
                    <Clock className="h-3 w-3" />
                    {highlight.videoTimestamp}
                  </div>
                )}
              </div>
            </button>
          )}
        </div>
      )}

      {/* Card body */}
      <div
        className={cn(
          "relative border border-border bg-card transition-all hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
          highlight.type === "video" ? "rounded-b-lg" : "rounded-lg",
          compact && "p-0"
        )}
      >
        {/* Highlighted text with colored background */}
        <div className={cn("p-4", compact && "p-3.5")}>
          {/* Source row */}
          <div className="mb-2 flex items-start justify-between gap-2">
            <a
              href={highlight.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-w-0 items-center gap-1.5 text-[11px] font-medium text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              <span className="truncate">{highlight.sourceTitle}</span>
              <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </a>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem className="text-[13px]">Edit color</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px]">Move to folder</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px]">Copy text</DropdownMenuItem>
                <DropdownMenuItem className="text-[13px] text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* The highlight text with colored marker effect */}
          <div className="mb-2.5">
            <span
              className={cn(
                "box-decoration-clone rounded-[3px] px-1 py-[1px] text-[13.5px] leading-[1.7]",
                colors.bg,
                compact && "line-clamp-3"
              )}
            >
              {highlight.text}
            </span>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-2">
            <div className={cn("h-2 w-2 rounded-full", colors.dot)} />
            <time className="text-[11px] text-muted-foreground/60">
              {new Date(highlight.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </time>
            {highlight.type === "video" && (
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                Video
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function timestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(":").map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}
