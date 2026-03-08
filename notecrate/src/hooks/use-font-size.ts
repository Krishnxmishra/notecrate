"use client";

import { useEffect, useState } from "react";

export type FontSize = "small" | "medium" | "large";

const STORAGE_KEY = "nc_font_size";
const DEFAULT: FontSize = "medium";

function applyFontSize(size: FontSize) {
  document.documentElement.setAttribute("data-font-size", size);
}

export function useFontSize() {
  const [fontSize, setFontSizeState] = useState<FontSize>(DEFAULT);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as FontSize | null;
    const initial = stored ?? DEFAULT;
    setFontSizeState(initial);
    applyFontSize(initial);
  }, []);

  function setFontSize(size: FontSize) {
    setFontSizeState(size);
    localStorage.setItem(STORAGE_KEY, size);
    applyFontSize(size);
  }

  return { fontSize, setFontSize };
}
