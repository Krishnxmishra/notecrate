import { createClient } from "./server";
import { requireUser } from "./auth";
import type { Database } from "./types";

type FolderRow = Database["public"]["Tables"]["folders"]["Row"];
type HighlightRow = Database["public"]["Tables"]["highlights"]["Row"];
type ChatMessageRow = Database["public"]["Tables"]["chat_messages"]["Row"];

// ---- Helpers ----

function mapHighlight(h: HighlightRow) {
  return {
    id: h.id,
    text: h.text,
    sourceTitle: h.source_title,
    sourceUrl: h.source_url,
    color: h.color,
    type: h.type as "text" | "image" | "video",
    imageUrl: h.image_url,
    videoId: h.video_id,
    videoTimestamp: h.video_timestamp,
    folderId: h.folder_id,
    createdAt: h.created_at,
  };
}

// ---- Folders ----

export async function getFolders() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: folders, error } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Get highlight counts per folder
  const { data: highlights } = await supabase
    .from("highlights")
    .select("folder_id")
    .eq("user_id", user.id);

  const countMap: Record<string, number> = {};
  (highlights as { folder_id: string }[] | null)?.forEach((h) => {
    countMap[h.folder_id] = (countMap[h.folder_id] ?? 0) + 1;
  });

  return (folders as FolderRow[]).map((f) => ({
    id: f.id,
    name: f.name,
    parentId: f.parent_id,
    userId: f.user_id,
    highlightCount: countMap[f.id] ?? 0,
    createdAt: f.created_at,
    updatedAt: f.updated_at,
  }));
}

export async function getFolderTree() {
  const folders = await getFolders();
  const roots = folders.filter((f) => f.parentId === null);
  return roots.map((root) => ({
    ...root,
    children: folders.filter((f) => f.parentId === root.id),
  }));
}

export async function getFolderById(id: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) return null;

  const folder = data as FolderRow;
  const { count } = await supabase
    .from("highlights")
    .select("*", { count: "exact", head: true })
    .eq("folder_id", id);

  return {
    id: folder.id,
    name: folder.name,
    parentId: folder.parent_id,
    userId: folder.user_id,
    highlightCount: count ?? 0,
    createdAt: folder.created_at,
    updatedAt: folder.updated_at,
  };
}

export async function createFolder(name: string, parentId?: string | null) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("folders")
    .insert({
      name,
      parent_id: parentId ?? null,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateFolder(id: string, name: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("folders")
    .update({ name })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteFolder(id: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("folders")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ---- Highlights ----

export async function getHighlightsByFolder(folderId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  // Get child folder IDs too
  const { data: childFolders } = await supabase
    .from("folders")
    .select("id")
    .eq("parent_id", folderId)
    .eq("user_id", user.id);

  const folderIds = [folderId, ...((childFolders as { id: string }[] | null)?.map((f) => f.id) ?? [])];

  const { data, error } = await supabase
    .from("highlights")
    .select("*")
    .in("folder_id", folderIds)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as HighlightRow[]).map(mapHighlight);
}

export async function getRecentHighlights(count: number = 8) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("highlights")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(count);

  if (error) throw error;
  return (data as HighlightRow[]).map(mapHighlight);
}

export async function searchHighlights(query: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("highlights")
    .select("*")
    .eq("user_id", user.id)
    .or(`text.ilike.%${query}%,source_title.ilike.%${query}%`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as HighlightRow[]).map(mapHighlight);
}

export async function createHighlight(input: {
  text: string;
  sourceTitle: string;
  sourceUrl: string;
  color?: string;
  type?: string;
  imageUrl?: string;
  videoId?: string;
  videoTimestamp?: string;
  folderId: string;
}) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("highlights")
    .insert({
      text: input.text,
      source_title: input.sourceTitle,
      source_url: input.sourceUrl,
      color: input.color ?? "yellow",
      type: input.type ?? "text",
      image_url: input.imageUrl ?? null,
      video_id: input.videoId ?? null,
      video_timestamp: input.videoTimestamp ?? null,
      folder_id: input.folderId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHighlight(id: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("highlights")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ---- Chat Messages ----

export async function getChatMessages(folderId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("folder_id", folderId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return (data as ChatMessageRow[]).map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    timestamp: m.created_at,
    artifact: m.artifact_title
      ? {
          title: m.artifact_title,
          content: m.artifact_content!,
          type: m.artifact_type as "table" | "report" | "comparison" | "timeline" | "summary",
        }
      : undefined,
  }));
}

export async function createChatMessage(input: {
  role: "user" | "assistant";
  content: string;
  folderId: string;
  artifact?: {
    title: string;
    content: string;
    type: string;
  };
}) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      role: input.role,
      content: input.content,
      folder_id: input.folderId,
      user_id: user.id,
      artifact_title: input.artifact?.title ?? null,
      artifact_content: input.artifact?.content ?? null,
      artifact_type: input.artifact?.type ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteChatMessages(folderId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("chat_messages")
    .delete()
    .eq("folder_id", folderId)
    .eq("user_id", user.id);

  if (error) throw error;
}

// ---- Stats ----

export async function getStats() {
  const user = await requireUser();
  const supabase = await createClient();

  const [highlightsRes, foldersRes] = await Promise.all([
    supabase
      .from("highlights")
      .select("created_at", { count: "exact" })
      .eq("user_id", user.id),
    supabase
      .from("folders")
      .select("id", { count: "exact" })
      .eq("user_id", user.id)
      .is("parent_id", null),
  ]);

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const thisWeekCount =
    (highlightsRes.data as { created_at: string }[] | null)?.filter(
      (h) => new Date(h.created_at) >= oneWeekAgo
    ).length ?? 0;

  return {
    totalHighlights: highlightsRes.count ?? 0,
    totalFolders: foldersRes.count ?? 0,
    thisWeek: thisWeekCount,
  };
}
