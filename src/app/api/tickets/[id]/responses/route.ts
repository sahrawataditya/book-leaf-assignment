import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { addResponseSchema } from "@/lib/validations";
import { emitTicketUpdate } from "@/lib/sse";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { authorProfile: true },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const isAuthor = ticket.authorProfile.userId === userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const isAdmin = user?.role === "ADMIN";

  if (!isAuthor && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = addResponseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const response = await prisma.ticketResponse.create({
    data: {
      ticketId: ticket.id,
      message: parsed.data.message,
      authorType: isAdmin ? "ADMIN" : "AUTHOR",
      isInternal: parsed.data.isInternal || false,
    },
  });

  if (ticket.status === "OPEN" && isAdmin) {
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: "IN_PROGRESS" },
    });
  }

  emitTicketUpdate({
    ticketId: ticket.id,
    authorProfileId: ticket.authorProfileId,
    type: "response",
  });

  return NextResponse.json({ response }, { status: 201 });
}
