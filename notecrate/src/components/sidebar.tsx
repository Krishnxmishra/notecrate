"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ChevronRight,
  FolderClosed,
  FolderOpen,
  Home,
  Pencil,
  Search,
  Settings,
  Trash2,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Folder } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteFolder, renameFolder } from "@/lib/actions";

type FolderWithChildren = Folder & { children: Folder[] };

interface SidebarProps {
  tree: FolderWithChildren[];
  userEmail?: string | null;
}

function FolderRow({
  folder,
  hasChildren,
  isActive,
  isExpanded,
  onToggle,
  onDelete,
  onRename,
  indent,
}: {
  folder: Folder;
  hasChildren: boolean;
  isActive: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
  onDelete: (id: string, name: string, hasChildren: boolean) => void;
  onRename: (id: string, name: string) => void;
  indent?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const count = Number.isFinite(folder.highlightCount) ? folder.highlightCount : 0;

  useEffect(() => {
    if (!menuOpen) return;

    function onDown(e: MouseEvent) {
      if (!rowRef.current) return;
      if (!rowRef.current.contains(e.target as Node)) setMenuOpen(false);
    }

    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);

    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen]);

  return (
      <div
        ref={rowRef}
        className={cn(
          "group relative flex items-center rounded-md pr-1 transition-colors",
        isActive
          ? "bg-neutral-200/70 dark:bg-neutral-800"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800/70"
      )}
    >
      {hasChildren && onToggle ? (
        <button
          type="button"
          onClick={onToggle}
          className="flex h-7 w-5 shrink-0 items-center justify-center text-neutral-400"
          aria-label={isExpanded ? `Collapse ${folder.name}` : `Expand ${folder.name}`}
        >
          <ChevronRight
            className={cn(
              "h-3 w-3 transition-transform duration-150",
              isExpanded && "rotate-90"
            )}
          />
        </button>
      ) : (
        <div className={indent ? "w-0 shrink-0" : "w-5 shrink-0"} />
      )}

      <Link
        href={`/folder/${folder.id}`}
        className={cn(
          "flex min-w-0 flex-1 items-center gap-1.5 py-[6px] text-[13px]",
          indent && "py-[5px] pl-3"
        )}
      >
        {indent ? (
          <FolderClosed className="h-[14px] w-[14px] shrink-0 text-neutral-400" />
        ) : isActive ? (
          <FolderOpen className="h-[15px] w-[15px] shrink-0 text-neutral-400" />
        ) : (
          <FolderClosed className="h-[15px] w-[15px] shrink-0 text-neutral-400" />
        )}
        <span
          className={cn(
            "truncate",
            isActive
              ? "font-medium text-neutral-900 dark:text-neutral-100"
              : indent
              ? "text-neutral-500 dark:text-neutral-400"
              : "text-neutral-600 dark:text-neutral-400"
          )}
        >
          {folder.name}
        </span>
      </Link>

      <div className="ml-auto flex h-6 w-14 shrink-0 items-center justify-end pr-1">
        <span
          className={cn(
            "pointer-events-none inline-flex min-w-[1.5rem] items-center justify-center rounded-sm border border-neutral-300/80 px-1 text-[10px] font-semibold tabular-nums text-neutral-700 dark:border-neutral-700 dark:text-neutral-300",
            menuOpen && "hidden",
            !menuOpen && "group-hover:hidden"
          )}
        >
          {count}
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className={cn(
            "h-5 w-5 items-center justify-center rounded text-neutral-500 dark:text-neutral-300",
            "hover:bg-neutral-200/80 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200",
            menuOpen ? "flex" : "hidden group-hover:flex",
            menuOpen && "bg-neutral-200/80 text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200"
          )}
          aria-label={`Folder options for ${folder.name}`}
        >
          ...
        </button>
      </div>

      {menuOpen && (
        <div className="absolute right-2 top-7 z-50 w-36 rounded-md border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onRename(folder.id, folder.name);
            }}
            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12.5px] text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            <Pencil className="h-3.5 w-3.5" />
            Rename
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              onDelete(folder.id, folder.name, hasChildren);
            }}
            className="mt-0.5 flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-[12.5px] text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete folder
          </button>
        </div>
      )}
    </div>
  );
}

export function Sidebar({ tree, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(tree.map((f) => f.id))
  );
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    hasChildren: boolean;
  } | null>(null);
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isPending, startTransition] = useTransition();

  function toggleExpand(id: string) {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function isActive(path: string) {
    return pathname === path;
  }

  function requestDelete(id: string, name: string, hasChildren: boolean) {
    setDeleteTarget({ id, name, hasChildren });
  }

  function requestRename(id: string, name: string) {
    setRenameTarget({ id, name });
    setRenameValue(name);
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteTarget(null);

    startTransition(async () => {
      await deleteFolder(id);
      if (pathname.startsWith(`/folder/${id}`) || pathname.startsWith(`/studio/${id}`)) {
        router.push("/dashboard");
      }
    });
  }

  function confirmRename() {
    if (!renameTarget || !renameValue.trim()) return;
    const id = renameTarget.id;
    setRenameTarget(null);

    startTransition(async () => {
      await renameFolder(id, renameValue.trim());
    });
  }

  return (
    <>
      <aside
        className={cn(
          "flex h-screen w-[252px] flex-col border-r border-border/60 bg-[#fafafa] dark:bg-neutral-950",
          isPending && "pointer-events-none opacity-60"
        )}
      >
        <div className="flex h-[52px] items-center px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-[22px] w-[22px] items-center justify-center rounded bg-neutral-900 dark:bg-white">
              <span className="text-[10px] font-bold leading-none text-white dark:text-neutral-900">N</span>
            </div>
            <span className="text-[14px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-neutral-100">
              NoteCrate
            </span>
          </Link>
        </div>

        <Separator className="opacity-50" />

        <div className="px-2.5 pb-1 pt-3">
          <nav className="flex flex-col gap-px">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-[6px] text-[13px] transition-colors",
                isActive("/dashboard")
                  ? "bg-neutral-200/70 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-200"
              )}
            >
              <Home className="h-[15px] w-[15px]" />
              Dashboard
            </Link>
            <Link
              href="/search"
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-[6px] text-[13px] transition-colors",
                isActive("/search")
                  ? "bg-neutral-200/70 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                  : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-200"
              )}
            >
              <Search className="h-[15px] w-[15px]" />
              Search
            </Link>
          </nav>
        </div>

        <div className="mx-2.5 my-1">
          <Separator className="opacity-40" />
        </div>

        <div className="px-4 pb-1 pt-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400 dark:text-neutral-500">
            Folders
          </span>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-3">
          <div className="flex flex-col gap-px">
            {tree.map((folder) => {
              const expanded = expandedFolders.has(folder.id);
              const hasChildren = folder.children.length > 0;
              const folderActive = pathname === `/folder/${folder.id}` || pathname === `/studio/${folder.id}`;

              return (
                <div key={folder.id}>
                  <FolderRow
                    folder={folder}
                    hasChildren={hasChildren}
                    isActive={folderActive}
                    isExpanded={expanded}
                    onToggle={() => toggleExpand(folder.id)}
                    onDelete={requestDelete}
                    onRename={requestRename}
                  />
                  {hasChildren && expanded && (
                    <div className="ml-3 border-l border-neutral-200/80 pl-1 dark:border-neutral-700/60">
                      {folder.children.map((child) => (
                        <FolderRow
                          key={child.id}
                          folder={child}
                          hasChildren={false}
                          isActive={pathname === `/folder/${child.id}`}
                          onDelete={requestDelete}
                          onRename={requestRename}
                          indent
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <Separator className="opacity-40" />

        <div className="flex flex-col gap-px px-2.5 py-2">
          <Link
            href="/tools"
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-[6px] text-[13px] transition-colors",
              isActive("/tools")
                ? "bg-neutral-200/70 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-200"
            )}
          >
            <Wrench className="h-[15px] w-[15px]" />
            Tools
          </Link>
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-[6px] text-[13px] transition-colors",
              isActive("/settings")
                ? "bg-neutral-200/70 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800/70 dark:hover:text-neutral-200"
            )}
          >
            <Settings className="h-[15px] w-[15px]" />
            Settings
          </Link>
          {userEmail && (
            <>
              <Separator className="my-1 opacity-40" />
              <div className="flex items-center gap-2 px-2 py-[5px]">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-[9px] font-bold text-white dark:bg-white dark:text-neutral-900">
                  {userEmail[0].toUpperCase()}
                </div>
                <span className="truncate text-[12px] text-neutral-400 dark:text-neutral-500">{userEmail}</span>
              </div>
            </>
          )}
        </div>
      </aside>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[15px]">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
              Delete &ldquo;{deleteTarget?.name}&rdquo;?
            </DialogTitle>
            <DialogDescription className="pt-0.5 text-[13px] leading-relaxed">
              {deleteTarget?.hasChildren
                ? "This will permanently delete the folder, all its subfolders, and every highlight inside. This cannot be undone."
                : "This will permanently delete the folder and all highlights inside. This cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-1 gap-2 sm:gap-2">
            <Button variant="outline" className="h-8 text-[13px]" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              className="h-8 bg-red-600 text-[13px] text-white hover:bg-red-700"
              onClick={confirmDelete}
              disabled={isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!renameTarget} onOpenChange={(o) => !o && setRenameTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-[15px]">Rename folder</DialogTitle>
          </DialogHeader>
          <input
            className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-[13px] text-neutral-900 outline-none focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-neutral-500 dark:focus:ring-neutral-700"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onFocus={(e) => e.target.select()}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmRename();
              if (e.key === "Escape") setRenameTarget(null);
            }}
            autoFocus
          />
          <DialogFooter className="mt-1 gap-2 sm:gap-2">
            <Button variant="outline" className="h-8 text-[13px]" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button
              className="h-8 text-[13px]"
              onClick={confirmRename}
              disabled={!renameValue.trim() || isPending}
            >
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
