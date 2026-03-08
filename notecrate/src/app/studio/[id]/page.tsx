import { AppShell } from "@/components/app-shell";
import { TopNav } from "@/components/topnav";
import { getFolderById, getHighlightsByFolder } from "@/lib/db";
import { StudioView } from "./studio-view";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function StudioPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tool?: string }>;
}) {
  const { id } = await params;
  const { tool } = await searchParams;
  const [folder, highlights] = await Promise.all([
    getFolderById(id),
    getHighlightsByFolder(id),
  ]);

  if (!folder) {
    return (
      <AppShell>
        <TopNav title="Studio" subtitle="Folder not found" />
        <div className="flex flex-1 items-center justify-center bg-[#fbfbfb] dark:bg-neutral-950">
          <p className="text-neutral-400 dark:text-neutral-500">This folder does not exist.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <TopNav
        title={`Export for ${tool === "chatgpt" ? "ChatGPT" : tool === "gemini" ? "Gemini" : "Claude"}`}
        subtitle={folder.name}
        actions={
          <Link href={`/folder/${folder.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 text-[12px] text-neutral-500"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to folder
            </Button>
          </Link>
        }
      />
      <StudioView folder={folder} highlights={highlights} tool={tool ?? "claude"} />
    </AppShell>
  );
}
