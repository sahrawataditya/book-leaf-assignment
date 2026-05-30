import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { classifyTicket } from "@/lib/ai";

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

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const result = await classifyTicket(ticket.subject, ticket.description);

  if (result) {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        category: result.category as any,
        aiClassifiedCategory: result.category,
      },
    });
  }

  return NextResponse.json({
    result: result || { category: "GENERAL_INQUIRY", confidence: "low" },
    fallback: !result,
  });
}
