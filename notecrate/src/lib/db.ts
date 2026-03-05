import { createClient } from "@/lib/supabase/server";
import type { Folder, Highlight, HighlightColor } from "@/lib/data";

// ─── Raw Supabase row types ────────────────────────────────────────────────────

interface FolderRow {
  id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
}

interface HighlightRow {
  id: string;
  text: string;
  source_title: string;
  source_url: string;
  color: string;
  folder_id: string;
  created_at: string;
  type: string;
  image_url: string | null;
  video_id: string | null;
  video_timestamp: string | null;
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

function mapFolder(row: FolderRow, highlightCount = 0): Folder {
  return {
    id: row.id,
    name: row.name,
    parentId: row.parent_id,
    highlightCount,
    createdAt: row.created_at,
  };
}

function mapHighlight(row: HighlightRow): Highlight {
  return {
    id: row.id,
    text: row.text,
    sourceTitle: row.source_title,
    sourceUrl: row.source_url,
    color: row.color as HighlightColor,
    folderId: row.folder_id,
    createdAt: row.created_at,
    type: row.type as "text" | "image" | "video",
    imageUrl: row.image_url ?? undefined,
    videoId: row.video_id ?? undefined,
    videoTimestamp: row.video_timestamp ?? undefined,
  };
}

// ─── Query functions ───────────────────────────────────────────────────────────

export async function getFolders(): Promise<Folder[]> {
  const supabase = await createClient();
  const { data: folderRows } = await supabase
    .from("folders")
    .select("*")
    .order("created_at", { ascending: true });

  const { data: countRows } = await supabase
    .from("highlights")
    .select("folder_id");

  const counts: Record<string, number> = {};
  (countRows ?? []).forEach((r: { folder_id: string }) => {
    counts[r.folder_id] = (counts[r.folder_id] ?? 0) + 1;
  });

  return (folderRows ?? []).map((r) => mapFolder(r, counts[r.id] ?? 0));
}

export async function getFolderTree() {
  const folders = await getFolders();
  const roots = folders.filter((f) => f.parentId === null);
  return roots.map((root) => ({
    ...root,
    children: folders.filter((f) => f.parentId === root.id),
  }));
}

export async function getFolderById(id: string): Promise<Folder | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("folders")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) return null;

  const { count } = await supabase
    .from("highlights")
    .select("*", { count: "exact", head: true })
    .eq("folder_id", id);

  return mapFolder(data, count ?? 0);
}

export async function getHighlightsByFolder(folderId: string): Promise<Highlight[]> {
  const supabase = await createClient();

  // Get child folder ids
  const { data: children } = await supabase
    .from("folders")
    .select("id")
    .eq("parent_id", folderId);

  const allIds = [folderId, ...(children ?? []).map((c: { id: string }) => c.id)];

  const { data } = await supabase
    .from("highlights")
    .select("*")
    .in("folder_id", allIds)
    .order("created_at", { ascending: false });

  return (data ?? []).map(mapHighlight);
}

export async function getRecentHighlights(count = 8): Promise<Highlight[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("highlights")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(count);

  return (data ?? []).map(mapHighlight);
}

export async function searchHighlights(query: string): Promise<Highlight[]> {
  const supabase = await createClient();
  const q = `%${query}%`;
  const { data } = await supabase
    .from("highlights")
    .select("*")
    .or(`text.ilike.${q},source_title.ilike.${q}`)
    .order("created_at", { ascending: false });

  return (data ?? []).map(mapHighlight);
}

export async function getAllHighlights(): Promise<Highlight[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("highlights")
    .select("*")
    .order("created_at", { ascending: false });

  return (data ?? []).map(mapHighlight);
}

export async function getStats() {
  const supabase = await createClient();

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [{ count: totalHighlights }, { count: totalFolders }, { count: thisWeek }] =
    await Promise.all([
      supabase.from("highlights").select("*", { count: "exact", head: true }),
      supabase.from("folders").select("*", { count: "exact", head: true }).is("parent_id", null),
      supabase
        .from("highlights")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo.toISOString()),
    ]);

  return {
    totalHighlights: totalHighlights ?? 0,
    totalFolders: totalFolders ?? 0,
    thisWeek: thisWeek ?? 0,
  };
}
