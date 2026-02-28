"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  FolderClosed,
  FolderOpen,
  Home,
  Search,
  Plus,
} from "lucide-react";
import { getFolderTree } from "@/lib/data";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function Sidebar() {
  const tree = getFolderTree();
  const pathname = usePathname();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(tree.map((f) => f.id))
  );

  const toggleExpand = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="flex h-screen w-[252px] flex-col border-r border-border/60 bg-[#fafafa]">
      {/* Logo */}
      <div className="flex h-[52px] items-center px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-[22px] w-[22px] items-center justify-center rounded bg-neutral-900">
            <span className="text-[10px] font-bold leading-none text-white">N</span>
          </div>
          <span className="text-[14px] font-semibold tracking-[-0.01em] text-neutral-900">
            NoteCrate
          </span>
        </Link>
      </div>

      <Separator className="opacity-50" />

      {/* Main nav */}
      <div className="px-2.5 pt-3 pb-1">
        <nav className="flex flex-col gap-px">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-[6px] text-[13px] transition-colors",
              isActive("/")
                ? "bg-neutral-200/70 font-medium text-neutral-900"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
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
                ? "bg-neutral-200/70 font-medium text-neutral-900"
                : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
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

      {/* Folders */}
      <div className="flex items-center justify-between px-4 pt-2 pb-1">
        <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
          Folders
        </span>
        <Button variant="ghost" size="icon" className="h-5 w-5 text-neutral-400 hover:text-neutral-600">
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2.5 pb-3">
        <div className="flex flex-col gap-px">
          {tree.map((folder) => {
            const isExpanded = expandedFolders.has(folder.id);
            const hasChildren = folder.children.length > 0;
            const folderActive =
              pathname === `/folder/${folder.id}` ||
              pathname === `/studio/${folder.id}`;

            return (
              <div key={folder.id}>
                <div
                  className={cn(
                    "group flex items-center rounded-md transition-colors",
                    folderActive
                      ? "bg-neutral-200/70"
                      : "hover:bg-neutral-100"
                  )}
                >
                  {hasChildren ? (
                    <button
                      onClick={() => toggleExpand(folder.id)}
                      className="flex h-7 w-5 items-center justify-center text-neutral-400"
                    >
                      <ChevronRight
                        className={cn(
                          "h-3 w-3 transition-transform duration-150",
                          isExpanded && "rotate-90"
                        )}
                      />
                    </button>
                  ) : (
                    <div className="w-5" />
                  )}
                  <Link
                    href={`/folder/${folder.id}`}
                    className="flex flex-1 items-center gap-1.5 py-[6px] pr-2 text-[13px]"
                  >
                    {folderActive ? (
                      <FolderOpen className="h-[15px] w-[15px] text-neutral-400" />
                    ) : (
                      <FolderClosed className="h-[15px] w-[15px] text-neutral-400" />
                    )}
                    <span className={cn("truncate", folderActive ? "font-medium text-neutral-900" : "text-neutral-600")}>
                      {folder.name}
                    </span>
                    <span className="ml-auto text-[11px] tabular-nums text-neutral-400">
                      {folder.highlightCount}
                    </span>
                  </Link>
                </div>

                {hasChildren && isExpanded && (
                  <div className="ml-3 border-l border-neutral-200/80 pl-1">
                    {folder.children.map((child) => {
                      const childActive =
                        pathname === `/folder/${child.id}`;
                      return (
                        <Link
                          key={child.id}
                          href={`/folder/${child.id}`}
                          className={cn(
                            "flex items-center gap-1.5 rounded-md py-[5px] pl-3 pr-2 text-[13px] transition-colors",
                            childActive
                              ? "bg-neutral-200/70 font-medium text-neutral-900"
                              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700"
                          )}
                        >
                          <FolderClosed className="h-[14px] w-[14px] text-neutral-400" />
                          <span className="truncate">{child.name}</span>
                          <span className="ml-auto text-[11px] tabular-nums text-neutral-400">
                            {child.highlightCount}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <Separator className="opacity-40" />
      <div className="px-4 py-3">
        <p className="text-[11px] text-neutral-400">
          Organize material. Get clarity.
        </p>
      </div>
    </aside>
  );
}
