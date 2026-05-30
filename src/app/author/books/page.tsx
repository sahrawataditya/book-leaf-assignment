import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { redirect } from "next/navigation";

export default async function MyBooks() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const profile = await prisma.authorProfile.findUnique({
    where: { userId },
    include: { books: true },
  });

  if (!profile) redirect("/login");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Books</h1>

      {profile.books.length === 0 ? (
        <Card>
          <p className="text-gray-500">No books found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {profile.books.map((book) => (
            <Card key={book.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {book.genre} · {book.isbn || "No ISBN"}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Book ID: {book.bookId}
                  </p>
                </div>
                <Badge
                  variant={
                    book.status === "Published & Live"
                      ? "success"
                      : book.status
                      ? "warning"
                      : "default"
                  }
                >
                  {book.status || "Unknown"}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">MRP</p>
                  <p className="text-sm font-medium text-gray-900">
                    {book.mrp ? `₹${book.mrp}` : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Copies Sold</p>
                  <p className="text-sm font-medium text-gray-900">
                    {book.totalCopiesSold.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Royalty Earned</p>
                  <p className="text-sm font-medium text-green-600">
                    ₹{book.totalRoyaltyEarned.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Royalty Pending</p>
                  <p className="text-sm font-medium text-orange-600">
                    ₹{book.royaltyPending.toLocaleString()}
                  </p>
                </div>
              </div>

              {book.publicationDate && (
                <p className="text-xs text-gray-400 mt-3">
                  Published: {book.publicationDate.toLocaleDateString()}
                  {book.printPartner && ` · Print: ${book.printPartner}`}
                </p>
              )}

              {book.availableOn.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {book.availableOn.map((platform) => (
                    <span
                      key={platform}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-700"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
