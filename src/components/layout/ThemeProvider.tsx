"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "indigo" | "emerald" | "amber" | "rose" | "violet";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
}>({ theme: "indigo", setTheme: () => {} });

export function ThemeProvider({
  children,
  initialTheme = "indigo",
}: {
  children: React.ReactNode;
  initialTheme?: Theme;
}) {
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.cookie = `theme=${theme};path=/;max-age=31536000`;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
