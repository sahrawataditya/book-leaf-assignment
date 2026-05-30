import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";

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
    { href: "/author", label: "Dashboard" },
    { href: "/author/books", label: "My Books" },
    { href: "/author/tickets", label: "My Tickets" },
    { href: "/author/tickets/new", label: "Submit Query" },
  ];

  const adminLinks = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/tickets", label: "Ticket Queue" },
  ];

  const links = isAdmin ? adminLinks : authorLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <Link href={isAdmin ? "/admin" : "/author"}>
          <h1 className="text-xl font-bold text-indigo-600">BookLeaf</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {isAdmin ? "Admin Portal" : "Author Portal"}
          </p>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-3 truncate">{user?.name || user?.email}</div>
        <form action={handleSignOut}>
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}
