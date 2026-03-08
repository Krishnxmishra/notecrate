"use client";

import { useState, useEffect } from "react";

export const TOOLS = [
  {
    id: "claude",
    label: "Claude",
    desc: "Export highlights as Markdown, JSON, or plain text for use with Claude",
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    desc: "Export highlights for use with ChatGPT",
  },
  {
    id: "gemini",
    label: "Gemini",
    desc: "Export highlights for use with Gemini",
  },
] as const;

export type ToolId = (typeof TOOLS)[number]["id"];

const STORAGE_KEY = "nc_tools";

function readStorage(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function useTools() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setEnabled(readStorage());
  }, []);

  function toggle(id: string) {
    setEnabled((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const enabledTools = TOOLS.filter((t) => enabled[t.id]);

  return { enabled, toggle, enabledTools };
}
