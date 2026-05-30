import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { NewTicketForm } from "./NewTicketForm";

export default async function NewTicket() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const profile = await prisma.authorProfile.findUnique({
    where: { userId },
    include: { books: { where: { status: "Published & Live" } } },
  });

  if (!profile) return <p>Profile not found</p>;

  const books = profile.books.map((b) => ({
    id: b.id,
    bookId: b.bookId,
    title: b.title,
  }));

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Submit a Support Query
      </h1>
      <NewTicketForm
        authorProfileId={profile.id}
        books={books}
      />
    </div>
  );
}
