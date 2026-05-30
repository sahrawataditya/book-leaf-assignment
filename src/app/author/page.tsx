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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-sm text-gray-500">Published Books</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {publishedBooks.length}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Copies Sold</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {totalSales.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Royalty Earned</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            ₹{totalRoyaltyEarned.toLocaleString()}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Pending Payout</p>
          <p className="text-3xl font-bold text-orange-600 mt-1">
            ₹{totalRoyaltyPending.toLocaleString()}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Quick Actions">
          <div className="space-y-3">
            <Link
              href="/author/tickets/new"
              className="block px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors font-medium text-sm"
            >
              Submit a Support Query
            </Link>
            <Link
              href="/author/books"
              className="block px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
            >
              View My Books
            </Link>
            <Link
              href="/author/tickets"
              className="block px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm"
            >
              My Tickets {openTickets.length > 0 && `(${openTickets.length} open)`}
            </Link>
          </div>
        </Card>

        <Card title="Recent Activity">
          {profile.tickets.length === 0 ? (
            <p className="text-gray-500 text-sm">No recent activity.</p>
          ) : (
            <div className="space-y-3">
              {profile.tickets.slice(0, 5).map((ticket) => (
                <Link
                  key={ticket.id}
                  href={`/author/tickets/${ticket.ticketId}`}
                  className="block p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
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
                  <p className="text-xs text-gray-500">
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
                  className="p-3 border border-gray-100 rounded-lg"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {book.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{book.status}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
