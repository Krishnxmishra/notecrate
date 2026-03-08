import { getFolderTree, getProfile } from "@/lib/db";
import { Sidebar } from "@/components/sidebar";

export async function SidebarServer() {
  const [tree, profile] = await Promise.all([getFolderTree(), getProfile()]);
  return <Sidebar tree={tree} userEmail={profile?.name ?? profile?.email ?? null} />;
}
