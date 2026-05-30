import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { createTicketSchema } from "@/lib/validations";
import { classifyTicket, getPriorityScore } from "@/lib/ai";
import { emitTicketUpdate } from "@/lib/sse";

async function getAuthorProfile(session: any) {
  const userId = session?.user?.id;
  if (!userId) return null;
  return prisma.authorProfile.findUnique({ where: { userId } });
}

export async function GET() {
  const session = await auth();
  const profile = await getAuthorProfile(session);

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tickets = await prisma.ticket.findMany({
    where: { authorProfileId: profile.id },
    include: {
      responses: true,
      book: { select: { title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({ tickets });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const profile = await getAuthorProfile(session);

  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { subject, description, bookId, fileUrl } = parsed.data;

  const count = await prisma.ticket.count();
  const ticketId = `TK${String(count + 1).padStart(3, "0")}`;

  const [aiCategory, aiPriority] = await Promise.all([
    classifyTicket(subject, description),
    getPriorityScore(subject, description),
  ]);

  const ticket = await prisma.ticket.create({
    data: {
      ticketId,
      authorProfileId: profile.id,
      bookId: bookId || null,
      subject,
      description,
      fileUrl: fileUrl || null,
      category: (aiCategory?.category as any) || "GENERAL_INQUIRY",
      aiClassifiedCategory: aiCategory?.category || null,
      priority: (aiPriority?.priority as any) || "MEDIUM",
      aiPriorityScore: aiPriority?.reason || null,
    },
    include: { book: true },
  });

  emitTicketUpdate({
    ticketId: ticket.id,
    authorProfileId: profile.id,
    type: "new",
  });

  return NextResponse.json({ ticket }, { status: 201 });
}
