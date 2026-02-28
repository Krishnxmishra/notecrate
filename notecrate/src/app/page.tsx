"use client";

import Link from "next/link";
import {
  FileText,
  FolderClosed,
  Highlighter,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { TopNav } from "@/components/topnav";
import { HighlightCard } from "@/components/highlight-card";
import { getRecentHighlights, folders, stats } from "@/lib/data";

export default function Dashboard() {
  const recentHighlights = getRecentHighlights(6);
  const rootFolders = folders.filter((f) => f.parentId === null);

  return (
    <AppShell>
      <TopNav title="Dashboard" />
      <div className="flex-1 overflow-y-auto bg-[#fbfbfb]">
        <div className="mx-auto max-w-[960px] px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-neutral-900">
              Good morning
            </h2>
            <p className="mt-0.5 text-[13px] text-neutral-400">
              You have {stats.thisWeek} new highlights this week.
            </p>
          </div>

          {/* Stats row */}
          <div className="mb-8 grid grid-cols-4 gap-3">
            {[
              { icon: Highlighter, label: "Highlights", value: stats.totalHighlights },
              { icon: FolderClosed, label: "Folders", value: stats.totalFolders },
              { icon: FileText, label: "Documents", value: stats.totalDocuments },
              { icon: TrendingUp, label: "This week", value: stats.thisWeek },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-neutral-200/80 bg-white p-4">
                <div className="mb-2.5 text-neutral-400">
                  <stat.icon className="h-4 w-4" />
                </div>
                <p className="text-[20px] font-semibold tabular-nums tracking-tight text-neutral-900">
                  {stat.value}
                </p>
                <p className="text-[12px] text-neutral-400">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Folders */}
          <div className="mb-8">
            <h3 className="mb-3 text-[13px] font-medium text-neutral-900">
              Your folders
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {rootFolders.map((folder) => (
                <Link
                  key={folder.id}
                  href={`/folder/${folder.id}`}
                  className="group flex items-center justify-between rounded-lg border border-neutral-200/80 bg-white p-3.5 transition-all hover:border-neutral-300 hover:shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-100">
                      <FolderClosed className="h-4 w-4 text-neutral-400" />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-neutral-900">
                        {folder.name}
                      </p>
                      <p className="text-[11px] text-neutral-400">
                        {folder.highlightCount} highlights
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-neutral-300 transition-colors group-hover:text-neutral-500" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent highlights */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[13px] font-medium text-neutral-900">
                Recent highlights
              </h3>
              <Link
                href="/search"
                className="text-[12px] text-neutral-400 transition-colors hover:text-neutral-600"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {recentHighlights.map((h) => (
                <HighlightCard key={h.id} highlight={h} compact />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
