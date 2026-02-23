"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";

type ThemeMode = "light" | "dark";

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  localStorage.setItem("theme", mode);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const initial: ThemeMode = stored === "light" ? "light" : "dark";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <SidebarMenuButton
      tooltip={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      size="lg"
      onClick={toggleTheme}
      className="rounded-xl hover:bg-white/5 hover:text-white text-white/60 transition-all duration-300 group-data-[collapsible=icon]:!rounded-full group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!p-2 group-data-[collapsible=icon]:mx-auto"
    >
      <div className="flex items-center gap-4 transition-all duration-300 ease-in-out group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:justify-center w-full">
        {theme === "dark" ? (
          <Sun className="h-5 w-5 shrink-0" />
        ) : (
          <Moon className="h-5 w-5 shrink-0" />
        )}
        <span className="font-medium text-base whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:max-w-0 max-w-[200px]">
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </span>
      </div>
    </SidebarMenuButton>
  );
}
