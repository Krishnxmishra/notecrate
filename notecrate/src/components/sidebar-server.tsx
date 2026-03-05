import { getFolderTree } from "@/lib/db";
import { Sidebar } from "@/components/sidebar";

export async function SidebarServer() {
  const tree = await getFolderTree();
  return <Sidebar tree={tree} />;
}
