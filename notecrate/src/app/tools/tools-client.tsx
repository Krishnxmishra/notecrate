"use client";

import { TOOLS, useTools } from "@/hooks/use-tools";
import { cn } from "@/lib/utils";

export function ToolsClient() {
  const { enabled, toggle } = useTools();

  return (
    <div className="flex-1 overflow-y-auto bg-[#fbfbfb] dark:bg-neutral-950 p-6">
      <div className="mx-auto max-w-lg space-y-4">
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400">
          Enable the AI tools you use. Enabled tools appear as quick-export buttons on every folder.
        </p>

        <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 divide-y divide-neutral-100 dark:divide-neutral-800">
          {TOOLS.map((tool) => {
            const isOn = !!enabled[tool.id];
            return (
              <div key={tool.id} className="flex items-center gap-4 px-4 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">{tool.label}</p>
                  <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mt-0.5">{tool.desc}</p>
                </div>
                <button
                  onClick={() => toggle(tool.id)}
                  role="switch"
                  aria-checked={isOn}
                  className={cn(
                    "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
                    isOn ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-200 dark:bg-neutral-700"
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-4 w-4 rounded-full bg-white dark:bg-neutral-900 shadow-sm transition-transform duration-200",
                      isOn ? "translate-x-4" : "translate-x-0"
                    )}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
