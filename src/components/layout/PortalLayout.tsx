import { cookies } from "next/headers";
import { Sidebar } from "./Sidebar";
import { ThemeProvider, type Theme } from "./ThemeProvider";

export async function PortalLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value || "indigo") as Theme;

  return (
    <ThemeProvider initialTheme={theme}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-8 overflow-auto">{children}</main>
      </div>
    </ThemeProvider>
  );
}
