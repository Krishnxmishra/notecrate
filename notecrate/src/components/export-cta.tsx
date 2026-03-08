"use client";

import Link from "next/link";
import { Sparkles, Wrench } from "lucide-react";
import { useTools } from "@/hooks/use-tools";

interface ExportCtaProps {
  folderId: string;
  highlightCount: number;
}

export function ExportCta({ folderId, highlightCount }: ExportCtaProps) {
  const { enabledTools } = useTools();

  if (enabledTools.length === 0) {
    return (
      <div className="mb-6 flex items-center justify-between rounded-xl border border-dashed border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800">
            <Wrench className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          </div>
          <p className="text-[13px] text-neutral-400 dark:text-neutral-500">
            No AI tools enabled
          </p>
        </div>
        <Link
          href="/tools"
          className="text-[12px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          Set up tools →
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl border border-neutral-200/80 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-900 dark:bg-neutral-100">
          <Sparkles className="h-4 w-4 text-white dark:text-neutral-900" />
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">Export highlights</p>
          <p className="text-[12px] text-neutral-400 dark:text-neutral-500">{highlightCount} highlights ready to export</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {enabledTools.map((tool) => (
          <Link
            key={tool.id}
            href={`/studio/${folderId}?tool=${tool.id}`}
            className="rounded-md border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-1.5 text-[12px] font-medium text-neutral-700 dark:text-neutral-300 transition-all hover:border-neutral-300 dark:hover:border-neutral-600 hover:bg-white dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100"
          >
            {tool.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
