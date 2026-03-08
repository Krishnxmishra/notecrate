import { AppShell } from "@/components/app-shell";
import { TopNav } from "@/components/topnav";
import { NewFolderButton } from "@/components/new-folder-button";
import { getFolderById, getHighlightsByFolder, getFolders } from "@/lib/db";
import { FolderView } from "./folder-view";
import { ExportCta } from "@/components/export-cta";

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
        <div className="flex flex-1 items-center justify-center bg-[#fbfbfb] dark:bg-neutral-950">
          <p className="text-neutral-400 dark:text-neutral-500">This folder does not exist.</p>
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
      <div className="flex-1 overflow-y-auto bg-[#fbfbfb] dark:bg-neutral-950">
        <div className="mx-auto max-w-[960px] px-8 py-8">
          <ExportCta folderId={studioFolderId} highlightCount={highlights.length} />

          {!folder.parentId && (
            <div className="mb-4 flex justify-end">
              <NewFolderButton parentId={id} label="New subfolder" />
            </div>
          )}
          <FolderView highlights={highlights} subfolders={subfolders} allFolders={allFolders} />
        </div>
      </div>
    </AppShell>
  );
}
