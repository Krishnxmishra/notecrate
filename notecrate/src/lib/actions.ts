"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createFolder(name: string, parentId: string | null = null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("folders")
    .insert({ name, parent_id: parentId, user_id: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/folder/[id]", "layout");
  return data;
}

export async function deleteHighlight(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("highlights").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/folder/[id]", "layout");
  revalidatePath("/search");
}

export async function moveHighlight(id: string, folderId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("highlights")
    .update({ folder_id: folderId })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/folder/[id]", "layout");
  revalidatePath("/search");
}

export async function updateHighlightColor(id: string, color: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("highlights")
    .update({ color })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/folder/[id]", "layout");
  revalidatePath("/search");
}

export async function updateProfile(name: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { error } = await supabase
    .from("profiles")
    .update({ name })
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function renameFolder(id: string, name: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("folders").update({ name }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}

export async function deleteFolder(id: string) {
  const supabase = await createClient();
  // Delete all highlights in this folder and subfolders
  const { data: children } = await supabase.from("folders").select("id").eq("parent_id", id);
  const allIds = [id, ...(children ?? []).map((c: { id: string }) => c.id)];
  await supabase.from("highlights").delete().in("folder_id", allIds);
  // Delete subfolders first, then the folder
  if (children && children.length > 0) {
    await supabase.from("folders").delete().in("id", children.map((c: { id: string }) => c.id));
  }
  const { error } = await supabase.from("folders").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/", "layout");
}
