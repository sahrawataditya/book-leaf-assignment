import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
}

function parseFloat(val: number | null): number | null {
  return val ?? null;
}

async function main() {
  const dataPath = path.join(__dirname, "sample-data.json");
  const raw = fs.readFileSync(dataPath, "utf-8");
  const data = JSON.parse(raw);

  const adminExists = await prisma.user.findUnique({
    where: { email: "admin@bookleaf.com" },
  });

  if (!adminExists) {
    const adminHash = await bcrypt.hash("admin123", 12);
    await prisma.user.create({
      data: {
        name: "BookLeaf Admin",
        email: "admin@bookleaf.com",
        passwordHash: adminHash,
        role: "ADMIN",
      },
    });
    console.log("Created admin user: admin@bookleaf.com / admin123");
  }

  const authorPasswordHash = await bcrypt.hash("author123", 12);

  for (const authorData of data.authors) {
    const existingUser = await prisma.user.findUnique({
      where: { email: authorData.email },
    });

    if (existingUser) {
      console.log(`Skipping existing user: ${authorData.email}`);
      continue;
    }

    const user = await prisma.user.create({
      data: {
        name: authorData.name,
        email: authorData.email,
        passwordHash: authorPasswordHash,
        role: "AUTHOR",
      },
    });

    const profile = await prisma.authorProfile.create({
      data: {
        userId: user.id,
        authorId: authorData.author_id,
        phone: authorData.phone || null,
        city: authorData.city || null,
        joinedDate: parseDate(authorData.joined_date),
      },
    });

    for (const bookData of authorData.books) {
      await prisma.book.create({
        data: {
          bookId: bookData.book_id,
          authorProfileId: profile.id,
          title: bookData.title,
          isbn: bookData.isbn || null,
          genre: bookData.genre || null,
          publicationDate: parseDate(bookData.publication_date),
          status: bookData.status || null,
          mrp: parseFloat(bookData.mrp),
          authorRoyaltyPerCopy: parseFloat(bookData.author_royalty_per_copy),
          totalCopiesSold: bookData.total_copies_sold ?? 0,
          totalRoyaltyEarned: bookData.total_royalty_earned ?? 0,
          royaltyPaid: bookData.royalty_paid ?? 0,
          royaltyPending: bookData.royalty_pending ?? 0,
          lastRoyaltyPayoutDate: parseDate(bookData.last_royalty_payout_date),
          printPartner: bookData.print_partner || null,
          availableOn: bookData.available_on || [],
        },
      });
    }

    console.log(`Seeded author: ${authorData.name} (${authorData.author_id})`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
