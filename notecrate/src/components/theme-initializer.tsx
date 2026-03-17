"use client";

import { useEffect } from "react";

// Runs once on mount to apply stored theme + font size before hydration flash
export function ThemeInitializer() {
  useEffect(() => {
    // Theme
    const stored = localStorage.getItem("nc_theme");
    const resolved =
      stored === "dark"
        ? "dark"
        : stored === "light"
        ? "light"
        : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    document.documentElement.classList.toggle("dark", resolved === "dark");

    // Font size
    const size = localStorage.getItem("nc_font_size") ?? "medium";
    document.documentElement.setAttribute("data-font-size", size);
  }, []);

  return null;
}
