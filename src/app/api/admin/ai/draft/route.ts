import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { draftResponse } from "@/lib/ai";

export async function POST(request: NextRequest) {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: (session?.user as any)?.id },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { ticketId } = body;
  if (!ticketId) {
    return NextResponse.json({ error: "ticketId required" }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { responses: { orderBy: { createdAt: "asc" } } },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const conversationHistory = ticket.responses
    .filter((r) => !r.isInternal)
    .map((r) => `[${r.authorType}]: ${r.message}`)
    .join("\n\n");

  const fullQuery = conversationHistory
    ? `Original Query:\n${ticket.subject}\n\n${ticket.description}\n\nPrevious Messages:\n${conversationHistory}`
    : `${ticket.subject}\n\n${ticket.description}`;

  const draft = await draftResponse(
    ticket.subject,
    fullQuery,
    ticket.category
  );

  return NextResponse.json({
    draft: draft || "",
    fallback: !draft,
  });
}
