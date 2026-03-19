"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ExternalLink, MoreHorizontal, Play, Clock, Trash2, FolderInput, Palette, Copy, FileText } from "lucide-react";
import { type Highlight, type Folder, HIGHLIGHT_COLORS } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteHighlight, moveHighlight, updateHighlightColor } from "@/lib/actions";
import { createClient } from "@/lib/supabase/client";

const COLORS = ["yellow", "blue", "pink", "green", "orange"] as const;
const COLOR_LABELS: Record<string, string> = { yellow: "Yellow", blue: "Blue", pink: "Pink", green: "Green", orange: "Orange" };
const COLOR_DOTS: Record<string, string> = {
  yellow: "bg-amber-400", blue: "bg-sky-400", pink: "bg-rose-400", green: "bg-emerald-400", orange: "bg-orange-400",
};

interface HighlightCardProps {
  highlight: Highlight;
  compact?: boolean;
  folders?: Folder[];
}

const DOC_TYPE_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  pdf: { color: "text-red-600", bg: "bg-red-50 dark:bg-red-950/40", label: "PDF" },
  doc: { color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40", label: "Word" },
  docx: { color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40", label: "Word" },
  ppt: { color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/40", label: "Presentation" },
  pptx: { color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-950/40", label: "Presentation" },
  xls: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40", label: "Spreadsheet" },
  xlsx: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40", label: "Spreadsheet" },
  csv: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40", label: "Spreadsheet" },
  txt: { color: "text-neutral-600", bg: "bg-neutral-100 dark:bg-neutral-800", label: "Text" },
  rtf: { color: "text-neutral-600", bg: "bg-neutral-100 dark:bg-neutral-800", label: "Text" },
};
const DEFAULT_DOC_CONFIG = { color: "text-neutral-600", bg: "bg-neutral-100 dark:bg-neutral-800", label: "Document" };

function getDocExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const ext = pathname.split(".").pop()?.toLowerCase();
    return ext || "";
  } catch { return ""; }
}

function getDocFilename(url: string, fallback: string): string {
  try {
    const pathname = new URL(url).pathname;
    const segments = pathname.split("/");
    const last = segments[segments.length - 1];
    return last ? decodeURIComponent(last) : fallback;
  } catch { return fallback; }
}

function DocumentPreview({ url, filename }: { url: string; filename: string }) {
  const ext = getDocExtension(url);
  const config = DOC_TYPE_CONFIG[ext] || DEFAULT_DOC_CONFIG;
  const displayName = getDocFilename(url, filename || "Document");
  const isPdf = ext === "pdf";

  return (
    <div className="flex flex-col">
      {isPdf && (
        <div className="relative aspect-[4/3] w-full border-b border-border bg-neutral-100 dark:bg-neutral-900">
          <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
            className="absolute inset-0 h-full w-full border-none"
            title={displayName}
          />
        </div>
      )}
      <div className={cn("flex items-center gap-3 px-4 py-3.5", config.bg)}>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-white/80 dark:bg-neutral-900/80 shadow-sm", config.color)}>
          <FileText className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-neutral-900 dark:text-neutral-100">
            {displayName}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <span className={cn("text-[10px] font-semibold uppercase tracking-wider", config.color)}>
              {config.label}
            </span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] font-medium text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
              onClick={(e) => e.stopPropagation()}
            >
              Open
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HighlightCard({ highlight, compact, folders = [] }: HighlightCardProps) {
  const colors = HIGHLIGHT_COLORS[highlight.color] ?? HIGHLIGHT_COLORS.yellow;
  const router = useRouter();
  const [showVideo, setShowVideo] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (deleted) return null;

  function handleDelete() {
    startTransition(async () => {
      const id = highlight.id;
      await deleteHighlight(id);
      setDeleted(true);
      router.refresh(); // updates folder counts
      try {
        const supabase = createClient();
        await supabase.channel("public:highlights").send({
          type: "broadcast",
          event: "custom-delete",
          payload: { id },
        });
      } catch (_) {/* non-critical */ }
    });
  }

  function handleMove(folderId: string) {
    setShowMoveDialog(false);
    startTransition(async () => {
      await moveHighlight(highlight.id, folderId);
      router.refresh(); // updates folder counts
    });
  }

  function handleColor(color: string) {
    startTransition(() => updateHighlightColor(highlight.id, color));
  }

  function handleCopy() {
    navigator.clipboard.writeText(highlight.text);
  }

  const moveFolders = folders.filter((f) => f.id !== highlight.folderId);

  // Group move folders: roots first, then children indented
  const roots = moveFolders.filter((f) => !f.parentId);
  const children = moveFolders.filter((f) => f.parentId);
  const orderedMoveFolders: Array<Folder & { isChild?: boolean }> = [];
  roots.forEach((root) => {
    orderedMoveFolders.push(root);
    children.filter((c) => c.parentId === root.id).forEach((child) => {
      orderedMoveFolders.push({ ...child, isChild: true });
    });
  });
  // Any children whose parent wasn't in moveFolders
  children.filter((c) => !roots.find((r) => r.id === c.parentId)).forEach((child) => {
    orderedMoveFolders.push({ ...child, isChild: true });
  });

  return (
    <>
      <div className={cn("group relative", isPending && "opacity-50 pointer-events-none")}>
        {/* YouTube embed */}
        {highlight.type === "video" && highlight.videoId && (
          <div className="overflow-hidden rounded-t-lg border border-b-0 border-border bg-black">
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
              <button onClick={() => setShowVideo(true)} className="relative block w-full">
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

        {/* Image preview */}
        {highlight.type === "image" && highlight.imageUrl && (
          <div className="overflow-hidden rounded-t-lg border border-b-0 border-border bg-neutral-100">
            <img
              src={highlight.imageUrl}
              alt={highlight.sourceTitle}
              className="max-h-48 w-full object-cover"
            />
          </div>
        )}

        {/* Document preview */}
        {highlight.type === "document" && highlight.documentUrl && (
          <div className="overflow-hidden rounded-t-lg border border-b-0 border-border">
            <DocumentPreview url={highlight.documentUrl} filename={highlight.text} />
          </div>
        )}

        <div className={cn(
          "relative border border-border bg-card transition-all hover:shadow-[0_1px_4px_rgba(0,0,0,0.06)]",
          (highlight.type === "video" || highlight.type === "image" || highlight.type === "document") ? "rounded-b-lg" : "rounded-lg",
        )}>
          <div className={cn("p-4", compact && "p-3.5")}>
            {/* Source + menu */}
            <div className="mb-2 flex items-start justify-between gap-2">
              <a
                href={highlight.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hc-source flex min-w-0 items-center gap-1.5 font-medium text-muted-foreground/70 transition-colors hover:text-foreground"
              >
                <span className="truncate">{highlight.sourceTitle}</span>
                <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem className="gap-2 text-[13px]" onSelect={handleCopy}>
                    <Copy className="h-3.5 w-3.5" /> Copy text
                  </DropdownMenuItem>

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="gap-2 text-[13px]">
                      <Palette className="h-3.5 w-3.5" /> Color
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent>
                      {COLORS.map((c) => (
                        <DropdownMenuItem key={c} className="gap-2 text-[13px]" onSelect={() => handleColor(c)}>
                          <div className={cn("h-3 w-3 rounded-full", COLOR_DOTS[c])} />
                          {COLOR_LABELS[c]}
                          {highlight.color === c && <span className="ml-auto text-[10px] text-neutral-400">✓</span>}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  {orderedMoveFolders.length > 0 && (
                    <DropdownMenuItem className="gap-2 text-[13px]" onSelect={() => setShowMoveDialog(true)}>
                      <FolderInput className="h-3.5 w-3.5" /> Move to
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="gap-2 text-[13px] text-destructive focus:text-destructive" onSelect={handleDelete}>
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Text */}
            <div className="mb-2.5">
              <span className={cn(
                "hc-text box-decoration-clone rounded-[3px] px-1 py-[1px]",
                colors.bg,
                compact && "line-clamp-3",
              )}>
                {highlight.text}
              </span>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2">
              <div className={cn("h-2 w-2 rounded-full", colors.dot)} />
              <time className="hc-meta text-muted-foreground/60" suppressHydrationWarning>
                {new Date(highlight.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </time>
              {highlight.type === "video" && (
                <span className="hc-meta font-medium uppercase tracking-wider text-muted-foreground/50">Video</span>
              )}
              {highlight.type === "document" && (
                <span className="hc-meta font-medium uppercase tracking-wider text-muted-foreground/50">Document</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Move to folder dialog */}
      <Dialog open={showMoveDialog} onOpenChange={setShowMoveDialog}>
        <DialogContent className="max-w-xs p-0 overflow-hidden">
          <DialogHeader className="px-4 pt-4 pb-2">
            <DialogTitle className="text-[14px] font-semibold">Move to folder</DialogTitle>
          </DialogHeader>
          <div className="max-h-64 overflow-y-auto pb-2">
            {orderedMoveFolders.map((f) => (
              <button
                key={f.id}
                onClick={() => handleMove(f.id)}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-2 text-left text-[13px] transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800",
                  (f as Folder & { isChild?: boolean }).isChild && "pl-8 text-neutral-500 dark:text-neutral-400"
                )}
              >
                <span className={cn("truncate", !(f as Folder & { isChild?: boolean }).isChild && "font-medium text-neutral-900 dark:text-neutral-100")}>
                  {f.name}
                </span>
                <span className="ml-auto text-[11px] text-neutral-400 dark:text-neutral-500 tabular-nums">{f.highlightCount}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function timestampToSeconds(ts: string): number {
  const p = ts.split(":").map(Number);
  if (p.length === 2) return p[0] * 60 + p[1];
  if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
  return 0;
}
