import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
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
  document_url: string | null;
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
    type: row.type as "text" | "image" | "video" | "document",
    imageUrl: row.image_url ?? undefined,
    videoId: row.video_id ?? undefined,
    videoTimestamp: row.video_timestamp ?? undefined,
    documentUrl: row.document_url ?? undefined,
  };
}

// ─── Query functions ───────────────────────────────────────────────────────────

export const getProfile = cache(async function getProfile(): Promise<{ name: string | null; email: string } | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", user.id)
    .single();
  return data ?? null;
});

export const getFolders = cache(async function getFolders(): Promise<Folder[]> {
  const supabase = await createClient();
  const { data: folderRows } = await supabase
    .from("folders")
    .select("*")
    .order("created_at", { ascending: true });

  const { data: countRows } = await supabase
    .from("highlights")
    .select("folder_id");

  // Direct counts per folder
  const directCounts: Record<string, number> = {};
  (countRows ?? []).forEach((r: { folder_id: string }) => {
    directCounts[r.folder_id] = (directCounts[r.folder_id] ?? 0) + 1;
  });

  const rows = folderRows ?? [];
  const childrenByParent: Record<string, string[]> = {};
  rows.forEach((r) => {
    if (!r.parent_id) return;
    if (!childrenByParent[r.parent_id]) childrenByParent[r.parent_id] = [];
    childrenByParent[r.parent_id].push(r.id);
  });

  // For each folder, count own highlights + all children's highlights
  return rows.map((r) => {
    const childIds = childrenByParent[r.id] ?? [];
    const total = (directCounts[r.id] ?? 0) + childIds.reduce((sum, cid) => sum + (directCounts[cid] ?? 0), 0);
    return mapFolder(r, total);
  });
});

export const getFolderTree = cache(async function getFolderTree() {
  const folders = await getFolders();
  const roots = folders.filter((f) => f.parentId === null);
  return roots.map((root) => ({
    ...root,
    children: folders.filter((f) => f.parentId === root.id),
  }));
});

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

  const [{ count: totalHighlights }, { count: totalFolders }, { count: thisWeek }, { data: textRows }] =
    await Promise.all([
      supabase.from("highlights").select("*", { count: "exact", head: true }),
      supabase.from("folders").select("*", { count: "exact", head: true }).is("parent_id", null),
      supabase
        .from("highlights")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneWeekAgo.toISOString()),
      supabase.from("highlights").select("text, source_title, source_url"),
    ]);

  // Estimate storage: sum of text field lengths in bytes
  const estimatedBytes = (textRows ?? []).reduce((sum, row) => {
    return sum + (row.text?.length ?? 0) + (row.source_title?.length ?? 0) + (row.source_url?.length ?? 0);
  }, 0);

  return {
    totalHighlights: totalHighlights ?? 0,
    totalFolders: totalFolders ?? 0,
    thisWeek: thisWeek ?? 0,
    estimatedBytes,
  };
}
