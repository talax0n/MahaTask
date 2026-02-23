"use client";

import { useEffect } from "react";

type ThemeMode = "light" | "dark";

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeInitializer() {
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const theme: ThemeMode = stored === "light" ? "light" : "dark";
    applyTheme(theme);
  }, []);

  return null;
}
