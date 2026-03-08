"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import Link from "next/link";
import { LayoutGrid, List, GalleryHorizontal, Play, Clock, ExternalLink, MoreHorizontal, Trash2, FolderInput, ChevronLeft, ChevronRight } from "lucide-react";
import { HighlightCard } from "@/components/highlight-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Highlight, Folder } from "@/lib/data";
import { deleteHighlight, moveHighlight } from "@/lib/actions";
import { useRealtimeHighlights } from "@/hooks/use-realtime-highlights";
import { createClient } from "@/lib/supabase/client";

const COLORS = ["yellow", "blue", "pink", "green", "orange"] as const;
const COLOR_DOTS: Record<string, string> = {
  yellow: "bg-amber-400", blue: "bg-sky-400", pink: "bg-rose-400",
  green: "bg-emerald-400", orange: "bg-orange-400",
};

interface FolderViewProps {
  highlights: Highlight[];
  subfolders: Folder[];
  allFolders: Folder[];
}

interface VideoGroup {
  type: "video-group";
  videoId: string;
  sourceTitle: string;
  sourceUrl: string;
  highlights: Highlight[];
}

type RenderItem = Highlight | VideoGroup;

function isVideoGroup(item: RenderItem): item is VideoGroup {
  return (item as VideoGroup).type === "video-group";
}

function groupHighlights(highlights: Highlight[]): RenderItem[] {
  const result: RenderItem[] = [];
  const seenVideoIds = new Set<string>();

  for (const h of highlights) {
    if (h.type === "video" && h.videoId) {
      if (!seenVideoIds.has(h.videoId)) {
        seenVideoIds.add(h.videoId);
        result.push({
          type: "video-group",
          videoId: h.videoId,
          sourceTitle: h.sourceTitle,
          sourceUrl: h.sourceUrl,
          highlights: highlights.filter((x) => x.type === "video" && x.videoId === h.videoId),
        });
      }
    } else {
      result.push(h);
    }
  }
  return result;
}

// ---- Timestamp chip action menu ----
function TimestampChip({
  h,
  active,
  onClick,
  allFolders,
  onDeleted,
  onMoved,
}: {
  h: Highlight;
  active: boolean;
  onClick: () => void;
  allFolders: Folder[];
  onDeleted: (id: string) => void;
  onMoved: (id: string) => void;
}) {
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  const moveFolders = allFolders.filter((f) => f.id !== h.folderId);
  const roots = moveFolders.filter((f) => !f.parentId);
  const children = moveFolders.filter((f) => f.parentId);

  function handleDelete() {
    startTransition(async () => {
      const id = h.id;
      await deleteHighlight(id);
      onDeleted(id);
      // Broadcast to extension sidepanel
      try {
        const supabase = createClient();
        await supabase.channel("public:highlights").send({
          type: "broadcast",
          event: "custom-delete",
          payload: { id },
        });
      } catch (_) { }
    });
  }

  function handleMove(folderId: string) {
    setShowMoveDialog(false);
    startTransition(async () => {
      await moveHighlight(h.id, folderId);
      onMoved(h.id);
    });
  }

  return (
    <>
      <div className={cn("flex items-center gap-0.5 rounded-md border transition-colors",
        active ? "border-neutral-900 bg-neutral-900 dark:border-neutral-100 dark:bg-white" : "border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600",
        isPending && "opacity-50 pointer-events-none"
      )}>
        <button
          onClick={onClick}
          className={cn("flex items-center gap-1 px-2 py-1 text-[11px] font-medium",
            active ? "text-white dark:text-neutral-900" : "text-neutral-600 dark:text-neutral-300"
          )}
        >
          <Clock className="h-3 w-3" />
          {h.videoTimestamp ?? "0:00"}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-sm transition-colors",
                active
                  ? "text-white/60 hover:text-white hover:bg-white/10"
                  : "text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
              )}
            >
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 p-1">
            {moveFolders.length > 0 && (
              <DropdownMenuItem
                className="gap-2 text-[12.5px]"
                onSelect={() => setShowMoveDialog(true)}
              >
                <FolderInput className="h-3.5 w-3.5" /> Move to
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-2 text-[12.5px] text-red-600 focus:bg-red-50 focus:text-red-600"
              onSelect={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Move dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="max-w-xs p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-[14px] font-semibold">Move to folder</DialogTitle>
          </DialogHeader>
          <div className="max-h-56 overflow-y-auto pb-2">
            {roots.map((root) => (
              <>
                <button
                  key={root.id}
                  onClick={() => handleMove(root.id)}
                  className="flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] font-medium text-neutral-900 dark:text-neutral-100 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  {root.name}
                  <span className="ml-auto text-[11px] text-neutral-400">{root.highlightCount}</span>
                </button>
                {children.filter((c) => c.parentId === root.id).map((child) => (
                  <button
                    key={child.id}
                    onClick={() => handleMove(child.id)}
                    className="flex w-full items-center gap-2 pl-8 pr-4 py-2 text-left text-[13px] text-neutral-500 dark:text-neutral-400 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  >
                    {child.name}
                    <span className="ml-auto text-[11px] text-neutral-400">{child.highlightCount}</span>
                  </button>
                ))}
              </>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ---- Video Group Card ----
function VideoGroupCard({
  group: initialGroup,
  compact,
  allFolders,
}: {
  group: VideoGroup;
  compact: boolean;
  allFolders: Folder[];
}) {
  const [group, setGroup] = useState(initialGroup);
  const [showVideo, setShowVideo] = useState(false);
  const [activeTimestamp, setActiveTimestamp] = useState<string | null>(null);

  const startTs = activeTimestamp ?? group.highlights[0]?.videoTimestamp ?? "0:00";

  function handleTimestampClick(ts: string) {
    setActiveTimestamp(ts);
    setShowVideo(true);
  }

  function handleDeleted(id: string) {
    setGroup((g) => ({ ...g, highlights: g.highlights.filter((h) => h.id !== id) }));
  }

  function handleMoved(id: string) {
    setGroup((g) => ({ ...g, highlights: g.highlights.filter((h) => h.id !== id) }));
  }

  if (group.highlights.length === 0) return null;

  return (
    <div className="group relative rounded-lg border border-border bg-card transition-all hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      {/* Thumbnail / Player */}
      <div className="overflow-hidden rounded-t-lg border-b border-border bg-black">
        {showVideo ? (
          <div className="relative aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${group.videoId}?autoplay=1${timestampToSeconds(startTs) > 0 ? `&start=${timestampToSeconds(startTs)}` : ""}`}
              className="absolute inset-0 h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <button onClick={() => setShowVideo(true)} className="relative block w-full">
            <div className="relative aspect-video w-full bg-neutral-900">
              <img
                src={`https://img.youtube.com/vi/${group.videoId}/hqdefault.jpg`}
                alt={group.sourceTitle}
                className="h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-transform group-hover:scale-110">
                  <Play className="h-6 w-6 fill-current pl-0.5" />
                </div>
              </div>
            </div>
          </button>
        )}
      </div>

      <div className={cn("p-4", compact && "p-3.5")}>
        {/* Source */}
        <a
          href={group.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mb-3 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground/70 transition-colors hover:text-foreground"
        >
          <span className="truncate">{group.sourceTitle}</span>
          <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </a>

        {/* Timestamp chips with actions */}
        <div className="flex flex-wrap gap-1.5">
          {group.highlights.map((h) => (
            <TimestampChip
              key={h.id}
              h={h}
              active={activeTimestamp === h.videoTimestamp && showVideo}
              onClick={() => handleTimestampClick(h.videoTimestamp ?? "0:00")}
              allFolders={allFolders}
              onDeleted={handleDeleted}
              onMoved={handleMoved}
            />
          ))}
        </div>

        <p className="mt-2.5 text-[11px] text-muted-foreground/50">
          {group.highlights.length} saved clip{group.highlights.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

// ---- Carousel ----
function CarouselView({
  items,
  allFolders,
}: {
  items: RenderItem[];
  allFolders: Folder[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  const scrollTo = useCallback((index: number) => {
    const container = scrollRef.current;
    if (!container) return;
    const child = container.children[index] as HTMLElement;
    if (!child) return;
    container.scrollTo({ left: child.offsetLeft, behavior: "smooth" });
    setCurrent(index);
  }, []);

  function prev() { scrollTo(Math.max(0, current - 1)); }
  function next() { scrollTo(Math.min(items.length - 1, current + 1)); }

  return (
    <div className="relative">
      {/* Track */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory overflow-x-hidden gap-4"
        style={{ scrollbarWidth: "none" }}
        onScroll={(e) => {
          const el = e.currentTarget;
          const idx = Math.round(el.scrollLeft / el.clientWidth);
          setCurrent(idx);
        }}
      >
        {items.map((item, i) => (
          <div key={isVideoGroup(item) ? `vg-${item.videoId}` : item.id}
            className="w-full shrink-0 snap-start"
          >
            {isVideoGroup(item) ? (
              <VideoGroupCard group={item} compact={false} allFolders={allFolders} />
            ) : (
              <HighlightCard highlight={item} compact={false} folders={allFolders} />
            )}
          </div>
        ))}
      </div>

      {/* Nav arrows */}
      {current > 0 && (
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm transition-shadow hover:shadow-md"
        >
          <ChevronLeft className="h-4 w-4 text-neutral-600" />
        </button>
      )}
      {current < items.length - 1 && (
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 shadow-sm transition-shadow hover:shadow-md"
        >
          <ChevronRight className="h-4 w-4 text-neutral-600" />
        </button>
      )}

      {/* Dots */}
      {items.length > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === current ? "w-4 bg-neutral-900 dark:bg-neutral-100" : "w-1.5 bg-neutral-300 dark:bg-neutral-600 hover:bg-neutral-400 dark:hover:bg-neutral-500"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Main FolderView ----
export function FolderView({ highlights: initialHighlights, subfolders, allFolders }: FolderViewProps) {
  const highlights = useRealtimeHighlights(initialHighlights);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "carousel">("grid");
  const [activeColors, setActiveColors] = useState<string[]>([]);

  function toggleColor(c: string) {
    setActiveColors((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);
  }

  const filtered = activeColors.length > 0
    ? highlights.filter((h) => activeColors.includes(h.color))
    : highlights;

  const renderItems = groupHighlights(filtered);

  return (
    <>
      {/* Subfolders */}
      {subfolders.length > 0 && (
        <div className="mb-6">
          <p className="mb-2.5 text-[12px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:text-neutral-500">
            Subfolders
          </p>
          <div className="flex flex-wrap gap-2">
            {subfolders.map((sf) => (
              <Link
                key={sf.id}
                href={`/folder/${sf.id}`}
                className="flex items-center gap-2 rounded-md border border-neutral-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-[13px] font-medium text-neutral-700 dark:text-neutral-300 transition-all hover:border-neutral-300 dark:hover:border-neutral-600"
              >
                {sf.name}
                <Badge variant="secondary" className="h-5 bg-neutral-100 dark:bg-neutral-800 text-[10px] font-normal text-neutral-500 dark:text-neutral-400">
                  {sf.highlightCount}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <p className="text-[12px] font-medium uppercase tracking-[0.06em] text-neutral-400 dark:text-neutral-500">
            Highlights
          </p>
          <span className="text-[12px] text-neutral-300 dark:text-neutral-600">
            {filtered.length}{activeColors.length > 0 ? ` / ${highlights.length}` : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Color filter */}
          <div className="flex items-center gap-1">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => toggleColor(c)}
                title={c}
                className={cn(
                  "h-4 w-4 rounded-full border-2 transition-all",
                  COLOR_DOTS[c],
                  activeColors.includes(c)
                    ? "border-neutral-900 scale-110"
                    : "border-transparent opacity-40 hover:opacity-70"
                )}
              />
            ))}
            {activeColors.length > 0 && (
              <button onClick={() => setActiveColors([])} className="ml-1 text-[11px] text-neutral-400 hover:text-neutral-600">
                Clear
              </button>
            )}
          </div>

          <Separator orientation="vertical" className="h-4 opacity-40" />

          <Button variant="ghost" size="icon" className={cn("h-7 w-7", viewMode === "grid" && "bg-neutral-100 dark:bg-neutral-800")} onClick={() => setViewMode("grid")}>
            <LayoutGrid className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
          </Button>
          <Button variant="ghost" size="icon" className={cn("h-7 w-7", viewMode === "list" && "bg-neutral-100 dark:bg-neutral-800")} onClick={() => setViewMode("list")}>
            <List className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
          </Button>
          <Button variant="ghost" size="icon" className={cn("h-7 w-7", viewMode === "carousel" && "bg-neutral-100 dark:bg-neutral-800")} onClick={() => setViewMode("carousel")}>
            <GalleryHorizontal className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {renderItems.length > 0 ? (
        viewMode === "carousel" ? (
          <CarouselView items={renderItems} allFolders={allFolders} />
        ) : (
          <div className={cn(viewMode === "grid" ? "grid grid-cols-2 gap-3" : "flex flex-col gap-2.5")}>
            {renderItems.map((item) =>
              isVideoGroup(item) ? (
                <VideoGroupCard key={`vg-${item.videoId}`} group={item} compact={viewMode === "grid"} allFolders={allFolders} />
              ) : (
                <HighlightCard key={item.id} highlight={item} compact={viewMode === "grid"} folders={allFolders} />
              )
            )}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-16">
          <p className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">
            {activeColors.length > 0 ? "No highlights with selected colors" : "No highlights yet"}
          </p>
          {activeColors.length === 0 && (
            <p className="mt-1 text-[12px] text-neutral-400 dark:text-neutral-500">Use the browser extension to save highlights to this folder.</p>
          )}
        </div>
      )}
    </>
  );
}

function timestampToSeconds(ts: string): number {
  const p = ts.split(":").map(Number);
  if (p.length === 2) return p[0] * 60 + p[1];
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  return 0;
}
