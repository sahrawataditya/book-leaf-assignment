"use client";

import { useTheme, type Theme } from "./ThemeProvider";

const themes: { value: Theme; label: string; color: string }[] = [
  { value: "indigo", label: "Indigo", color: "bg-indigo-500" },
  { value: "emerald", label: "Emerald", color: "bg-emerald-500" },
  { value: "amber", label: "Amber", color: "bg-amber-500" },
  { value: "rose", label: "Rose", color: "bg-rose-500" },
  { value: "violet", label: "Violet", color: "bg-violet-500" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="px-4 py-3 border-t border-sidebar-border">
      <p className="text-xs font-medium text-text-muted mb-2 uppercase tracking-wider">
        Theme
      </p>
      <div className="flex gap-2">
        {themes.map((t) => (
          <button
            key={t.value}
            onClick={() => setTheme(t.value)}
            className={`w-7 h-7 rounded-full ${t.color} transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-ring focus:ring-offset-1 ${theme === t.value ? "ring-2 ring-offset-1 ring-primary" : ""}`}
            title={t.label}
          />
        ))}
      </div>
    </div>
  );
}
