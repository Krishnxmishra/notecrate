import Link from "next/link";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TopNav } from "@/components/topnav";
import { NewFolderButton } from "@/components/new-folder-button";
import { getFolderById, getHighlightsByFolder, getFolders } from "@/lib/db";
import { FolderView } from "./folder-view";

export default async function FolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [folder, highlights, allFolders] = await Promise.all([
    getFolderById(id),
    getHighlightsByFolder(id),
    getFolders(),
  ]);

  if (!folder) {
    return (
      <AppShell>
        <TopNav title="Folder not found" />
        <div className="flex flex-1 items-center justify-center bg-[#fbfbfb]">
          <p className="text-neutral-400">This folder does not exist.</p>
        </div>
      </AppShell>
    );
  }

  const parentFolder = folder.parentId
    ? allFolders.find((f) => f.id === folder.parentId) ?? null
    : null;
  const subfolders = allFolders.filter((f) => f.parentId === id);
  const studioFolderId = folder.parentId || folder.id;

  return (
    <AppShell>
      <TopNav
        title={folder.name}
        subtitle={
          parentFolder
            ? `${parentFolder.name} / ${folder.name}`
            : `${highlights.length} highlights`
        }
      />
      <div className="flex-1 overflow-y-auto bg-[#fbfbfb]">
        <div className="mx-auto max-w-[960px] px-8 py-8">
          {/* Export CTA */}
          <Link
            href={`/studio/${studioFolderId}`}
            className="group mb-6 flex items-center justify-between rounded-xl border border-neutral-200/80 bg-white p-5 transition-all hover:border-neutral-300 hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-900">
                <Sparkles className="h-[18px] w-[18px] text-white" />
              </div>
              <div>
                <p className="text-[14px] font-medium text-neutral-900">
                  Upload to Claude
                </p>
                <p className="text-[12px] text-neutral-400">
                  Export your {highlights.length} highlights to use with Claude
                </p>
              </div>
            </div>
            <div className="rounded-md bg-neutral-900 px-3 py-1.5 text-[12px] font-medium text-white transition-colors group-hover:bg-neutral-800">
              Export
            </div>
          </Link>

          <div className="mb-4 flex justify-end">
            <NewFolderButton parentId={id} label="New subfolder" />
          </div>
          <FolderView highlights={highlights} subfolders={subfolders} />
        </div>
      </div>
    </AppShell>
  );
}
