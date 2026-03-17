export type HighlightColor = "yellow" | "blue" | "pink" | "green" | "orange";

export interface Highlight {
  id: string;
  text: string;
  sourceTitle: string;
  sourceUrl: string;
  color: HighlightColor;
  folderId: string;
  createdAt: string;
  type: "text" | "image" | "video";
  imageUrl?: string;
  videoId?: string;
  videoTimestamp?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  highlightCount: number;
  createdAt: string;
}

export const HIGHLIGHT_COLORS: Record<HighlightColor, { bg: string; text: string; border: string; dot: string }> = {
  yellow: { bg: "bg-amber-200/70 dark:bg-amber-500/25", text: "text-amber-900 dark:text-amber-200", border: "border-amber-200 dark:border-amber-700", dot: "bg-amber-400" },
  blue:   { bg: "bg-sky-200/70 dark:bg-sky-500/25",   text: "text-sky-900 dark:text-sky-200",   border: "border-sky-200 dark:border-sky-700",   dot: "bg-sky-400" },
  pink:   { bg: "bg-rose-200/60 dark:bg-rose-500/25",  text: "text-rose-900 dark:text-rose-200",  border: "border-rose-200 dark:border-rose-700",  dot: "bg-rose-400" },
  green:  { bg: "bg-emerald-200/60 dark:bg-emerald-500/25", text: "text-emerald-900 dark:text-emerald-200", border: "border-emerald-200 dark:border-emerald-700", dot: "bg-emerald-400" },
  orange: { bg: "bg-orange-200/60 dark:bg-orange-500/25", text: "text-orange-900 dark:text-orange-200", border: "border-orange-200 dark:border-orange-700", dot: "bg-orange-400" },
};
