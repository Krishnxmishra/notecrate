"use client";

import { useState, useMemo } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import { HighlightCard } from "@/components/highlight-card";
import { HIGHLIGHT_COLORS, type Highlight, type HighlightColor } from "@/lib/data";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const COLORS: HighlightColor[] = ["yellow", "blue", "pink", "green", "orange"];

interface SearchViewProps {
  highlights: Highlight[];
}

export function SearchView({ highlights }: SearchViewProps) {
  const [query, setQuery] = useState("");
  const [activeColors, setActiveColors] = useState<Set<HighlightColor>>(new Set());

  const filteredResults = useMemo(() => {
    const q = query.toLowerCase();
    let results = query.length > 0
      ? highlights.filter(
          (h) =>
            h.text.toLowerCase().includes(q) ||
            h.sourceTitle.toLowerCase().includes(q)
        )
      : highlights;

    if (activeColors.size > 0) {
      results = results.filter((h) => activeColors.has(h.color));
    }

    return results;
  }, [highlights, query, activeColors]);

  const toggleColor = (color: HighlightColor) => {
    setActiveColors((prev) => {
      const next = new Set(prev);
      if (next.has(color)) next.delete(color);
      else next.add(color);
      return next;
    });
  };

  return (
    <>
      {/* Search */}
      <div className="relative mb-5">
        <SearchIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <Input
          placeholder="Search highlights, sources, or content..."
          className="h-10 rounded-lg border-neutral-200 bg-white pl-10 text-[13px] placeholder:text-neutral-400 focus-visible:border-neutral-300 focus-visible:ring-0"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Color filters */}
      <div className="mb-5 flex items-center gap-1.5">
        <span className="mr-1 text-[11px] text-neutral-400">Color:</span>
        {COLORS.map((color) => {
          const colors = HIGHLIGHT_COLORS[color];
          return (
            <button
              key={color}
              onClick={() => toggleColor(color)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] capitalize transition-all",
                activeColors.has(color)
                  ? "border-neutral-300 bg-white font-medium text-neutral-700"
                  : "border-neutral-200/80 text-neutral-400 hover:border-neutral-300"
              )}
            >
              <div className={cn("h-2 w-2 rounded-full", colors.dot)} />
              {color}
            </button>
          );
        })}
        {activeColors.size > 0 && (
          <button
            onClick={() => setActiveColors(new Set())}
            className="ml-1 text-[11px] text-neutral-400 hover:text-neutral-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="mb-3 text-[12px] text-neutral-400">
        {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""}
        {query && (
          <> for &ldquo;<span className="text-neutral-600">{query}</span>&rdquo;</>
        )}
      </p>

      {/* Results */}
      {filteredResults.length > 0 ? (
        <div className="flex flex-col gap-2.5">
          {filteredResults.map((h) => (
            <HighlightCard key={h.id} highlight={h} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-200 bg-white py-16">
          <SearchIcon className="mb-3 h-5 w-5 text-neutral-300" />
          <p className="text-[13px] font-medium text-neutral-500">
            No results found
          </p>
          <p className="mt-1 text-[12px] text-neutral-400">
            Try a different search term or adjust your filters.
          </p>
        </div>
      )}
    </>
  );
}
