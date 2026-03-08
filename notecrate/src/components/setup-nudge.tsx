"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const DISMISSED_KEY = "nc_setup_dismissed";

export function SetupNudge({ hasName }: { hasName: boolean }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasName) return;
    const dismissed = sessionStorage.getItem(DISMISSED_KEY);
    if (!dismissed) setVisible(true);
  }, [hasName]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 shadow-lg shadow-neutral-900/10">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">Finish setting up</p>
        <p className="text-[12px] text-neutral-400 dark:text-neutral-500">Add your name to complete your profile</p>
      </div>
      <Link
        href="/settings"
        onClick={() => setVisible(false)}
        className="shrink-0 rounded-md bg-neutral-900 dark:bg-neutral-100 px-3 py-1.5 text-[12px] font-medium text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
      >
        Go to Settings
      </Link>
      <button
        onClick={() => {
          sessionStorage.setItem(DISMISSED_KEY, "1");
          setVisible(false);
        }}
        className="shrink-0 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
