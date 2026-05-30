import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function AuthorDashboard() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const profile = await prisma.authorProfile.findUnique({
    where: { userId },
    include: {
      books: true,
      tickets: true,
    },
  });

  if (!profile) return <p>Profile not found</p>;

  const publishedBooks = profile.books.filter(
    (b) => b.status === "Published & Live"
  );
  const totalSales = publishedBooks.reduce((s, b) => s + b.totalCopiesSold, 0);
  const totalRoyaltyEarned = publishedBooks.reduce(
    (s, b) => s + b.totalRoyaltyEarned,
    0
  );
  const totalRoyaltyPending = publishedBooks.reduce(
    (s, b) => s + b.royaltyPending,
    0
  );
  const totalRoyaltyPaid = publishedBooks.reduce(
    (s, b) => s + b.royaltyPaid,
    0
  );
  const openTickets = profile.tickets.filter((t) => t.status === "OPEN");
  const inProduction = profile.books.filter(
    (b) => b.status && b.status !== "Published & Live"
  );

  return (
    <div>
      <h1
        className="text-2xl font-bold mb-6"
        style={{ color: "var(--text)" }}
      >
        Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Published Books
          </p>
          <p
            className="text-3xl font-bold mt-1"
            style={{ color: "var(--text)" }}
          >
            {publishedBooks.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Total Copies Sold
          </p>
          <p
            className="text-3xl font-bold mt-1"
            style={{ color: "var(--text)" }}
          >
            {totalSales.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Total Royalty Earned
          </p>
          <p className="text-3xl font-bold mt-1 text-emerald-600">
            ₹{totalRoyaltyEarned.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Pending Payout
          </p>
          <p className="text-3xl font-bold mt-1 text-amber-600">
            ₹{totalRoyaltyPending.toLocaleString()}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link
              href="/author/tickets/new"
              className="block px-4 py-3 font-medium text-sm rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--primary-light)",
                color: "var(--primary)",
              }}
            >
              Submit a Support Query
            </Link>
            <Link
              href="/author/books"
              className="block px-4 py-3 font-medium text-sm rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--surface-hover)",
                color: "var(--text-secondary)",
              }}
            >
              View My Books
            </Link>
            <Link
              href="/author/tickets"
              className="block px-4 py-3 font-medium text-sm rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--surface-hover)",
                color: "var(--text-secondary)",
              }}
            >
              My Tickets{" "}
              {openTickets.length > 0 && `(${openTickets.length} open)`}
            </Link>
          </div>
        </Card>

        <Card title="Recent Activity">
          {profile.tickets.length === 0 ? (
            <p style={{ color: "var(--text-muted)" }} className="text-sm">
              No recent activity.
            </p>
          ) : (
            <div className="space-y-3">
              {profile.tickets.slice(0, 5).map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/author/tickets/${ticket.ticketId}`}
                  className="block p-3 border rounded-lg transition-colors hover:bg-surface-hover"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ color: "var(--text)" }}
                    >
                      {ticket.subject}
                    </span>
                    <Badge
                      variant={
                        ticket.status === "OPEN"
                          ? "warning"
                          : ticket.status === "IN_PROGRESS"
                          ? "info"
                          : ticket.status === "RESOLVED"
                          ? "success"
                          : "default"
                      }
                    >
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {ticket.createdAt.toLocaleDateString()}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {inProduction.length > 0 && (
          <Card title="Books In Production">
            <div className="space-y-3">
              {inProduction.map((book) => (
                <div
                  key={book.id}
                  className="p-3 border rounded-lg"
                  style={{ borderColor: "var(--border)" }}
                >
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {book.title}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {book.status}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
