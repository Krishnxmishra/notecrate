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
  yellow: { bg: "bg-amber-100/80", text: "text-amber-900", border: "border-amber-200", dot: "bg-amber-400" },
  blue: { bg: "bg-sky-100/80", text: "text-sky-900", border: "border-sky-200", dot: "bg-sky-400" },
  pink: { bg: "bg-rose-100/70", text: "text-rose-900", border: "border-rose-200", dot: "bg-rose-400" },
  green: { bg: "bg-emerald-100/70", text: "text-emerald-900", border: "border-emerald-200", dot: "bg-emerald-400" },
  orange: { bg: "bg-orange-100/70", text: "text-orange-900", border: "border-orange-200", dot: "bg-orange-400" },
};
