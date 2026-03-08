"use client";

import { useRealtimeHighlights } from "@/hooks/use-realtime-highlights";
import { HighlightCard } from "@/components/highlight-card";
import { Highlighter } from "lucide-react";
import type { Highlight } from "@/lib/data";

interface RecentHighlightsProps {
    initialHighlights: Highlight[];
}

export function RecentHighlights({ initialHighlights }: RecentHighlightsProps) {
    const highlights = useRealtimeHighlights(initialHighlights);
    const recentHighlights = highlights.slice(0, 6);

    if (recentHighlights.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-12">
                <Highlighter className="mb-3 h-6 w-6 text-neutral-300 dark:text-neutral-600" />
                <p className="text-[13px] font-medium text-neutral-500 dark:text-neutral-400">No highlights yet</p>
                <p className="mt-1 text-[12px] text-neutral-400 dark:text-neutral-500">
                    Install the browser extension and start highlighting.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {recentHighlights.map((h) => (
                <HighlightCard key={h.id} highlight={h} compact />
            ))}
        </div>
    );
}
