import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: (session?.user as any)?.id },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = request.nextUrl;
  const status = url.searchParams.get("status");
  const category = url.searchParams.get("category");
  const priority = url.searchParams.get("priority");

  const where: any = {};

  if (status) where.status = status;
  if (category) where.category = category;
  if (priority) where.priority = priority;

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      authorProfile: { include: { user: { select: { name: true, email: true } } } },
      book: { select: { title: true, bookId: true } },
      assignedTo: { select: { name: true } },
      responses: true,
    },
    orderBy: [
      { priority: "asc" },
      { createdAt: "asc" },
    ],
  });

  return NextResponse.json({ tickets });
}
