import { cookies } from "next/headers";
import { LoginForm } from "./LoginForm";
import { ThemeProvider, type Theme } from "@/components/layout/ThemeProvider";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const theme = (cookieStore.get("theme")?.value || "indigo") as Theme;

  return (
    <ThemeProvider initialTheme={theme}>
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--bg-page)" }}>
        <div className="max-w-md w-full px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold" style={{ color: "var(--primary)" }}>
              BookLeaf
            </h1>
            <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
              Author Support Portal
            </p>
          </div>
          <div
            className="rounded-xl shadow-sm border p-8"
            style={{
              backgroundColor: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <h2
              className="text-xl font-semibold mb-6"
              style={{ color: "var(--text)" }}
            >
              Sign In
            </h2>
            <LoginForm />
          </div>
          <p className="text-center mt-6 text-xs" style={{ color: "var(--text-muted)" }}>
            BookLeaf Publishing — Author Support & Communication Portal
          </p>
        </div>
      </div>
    </ThemeProvider>
  );
}
