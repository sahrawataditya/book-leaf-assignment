import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

async function handleSignOut() {
  "use server";
  await signOut();
  redirect("/login");
}

export async function Sidebar() {
  const session = await auth();
  const user = session?.user as any;
  const isAdmin = user?.role === "ADMIN";

  const authorLinks = [
    { href: "/author", label: "Dashboard", icon: "📊" },
    { href: "/author/books", label: "My Books", icon: "📚" },
    { href: "/author/tickets", label: "My Tickets", icon: "🎫" },
    { href: "/author/tickets/new", label: "Submit Query", icon: "✉️" },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/tickets", label: "Ticket Queue", icon: "🎫" },
  ];

  const links = isAdmin ? adminLinks : authorLinks;

  return (
    <aside className="w-64 bg-sidebar-bg border-r border-sidebar-border min-h-screen flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <Link href={isAdmin ? "/admin" : "/author"}>
          <h1 className="text-xl font-bold" style={{ color: "var(--primary)" }}>
            BookLeaf
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {isAdmin ? "Admin Portal" : "Author Portal"}
          </p>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors hover:bg-[var(--sidebar-hover-bg)] hover:text-[var(--sidebar-hover-text)]"
            style={{
              color: "var(--sidebar-text)",
            }}
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <ThemeToggle />

      <div className="p-4 border-t border-sidebar-border">
        <div
          className="text-sm mb-3 truncate"
          style={{ color: "var(--text-secondary)" }}
        >
          {user?.name || user?.email}
        </div>
        <form action={handleSignOut}>
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer"
            style={{
              color: "var(--text-secondary)",
              backgroundColor: "var(--bg-page)",
            }}
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
