import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateTicketSchema } from "@/lib/validations";
import { emitTicketUpdate } from "@/lib/sse";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: (session?.user as any)?.id },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      authorProfile: {
        include: { user: { select: { name: true, email: true } } },
      },
      book: true,
      responses: { orderBy: { createdAt: "asc" } },
      assignedTo: { select: { id: true, name: true } },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  return NextResponse.json({ ticket });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

  const parsed = updateTicketSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { authorProfile: true },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const updated = await prisma.ticket.update({
    where: { id },
    data: parsed.data,
  });

  emitTicketUpdate({
    ticketId: ticket.id,
    authorProfileId: ticket.authorProfileId,
    type: "status",
  });

  return NextResponse.json({ ticket: updated });
}
