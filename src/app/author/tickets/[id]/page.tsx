import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SSETicketListener } from "@/components/tickets/SSETicketListener";
import { ReplyForm } from "./ReplyForm";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@/types";

function getBadgeVariant(status: TicketStatus) {
  switch (status) {
    case "OPEN": return "warning" as const;
    case "IN_PROGRESS": return "info" as const;
    case "RESOLVED": return "success" as const;
    case "CLOSED": return "default" as const;
  }
}

export default async function TicketDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const profile = await prisma.authorProfile.findUnique({ where: { userId } });
  if (!profile) notFound();

  const ticket = await prisma.ticket.findUnique({
    where: { ticketId: id, authorProfileId: profile.id },
    include: {
      responses: { orderBy: { createdAt: "asc" } },
      book: true,
    },
  });

  if (!ticket) notFound();

  return (
    <div className="max-w-3xl">
      <SSETicketListener authorProfileId={profile.id} />

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
            {ticket.ticketId}
          </span>
          <Badge variant={getBadgeVariant(ticket.status as TicketStatus)}>
            {STATUS_LABELS[ticket.status as TicketStatus]}
          </Badge>
          <Badge>
            {PRIORITY_LABELS[ticket.priority as TicketPriority]}
          </Badge>
        </div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          {ticket.subject}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
          {CATEGORY_LABELS[ticket.category as TicketCategory]}
          {ticket.book && ` · ${ticket.book.title} (${ticket.book.bookId})`}
        </p>
      </div>

      <Card className="mb-6">
        <p className="whitespace-pre-wrap" style={{ color: "var(--text)" }}>
          {ticket.description}
        </p>
        <p className="text-xs mt-3" style={{ color: "var(--text-muted)" }}>
          Submitted on {ticket.createdAt.toLocaleDateString()}{" "}
          {ticket.createdAt.toLocaleTimeString()}
        </p>
      </Card>

      <div className="space-y-4 mb-6">
        {ticket.responses.length === 0 ? (
          <p
            className="text-sm text-center py-4"
            style={{ color: "var(--text-muted)" }}
          >
            No responses yet. The BookLeaf team will get back to you soon.
          </p>
        ) : (
          ticket.responses
            .filter((r) => !r.isInternal)
            .map((response) => (
              <Card
                key={response.id}
                className={response.authorType === "ADMIN" ? "border-primary/20" : ""}
                style={
                  response.authorType === "ADMIN"
                    ? { backgroundColor: "var(--primary-light)" }
                    : undefined
                }
              >
                <div className="flex items-start gap-2 mb-2">
                  <Badge variant={response.authorType === "ADMIN" ? "info" : "default"}>
                    {response.authorType === "ADMIN" ? "BookLeaf Team" : "You"}
                  </Badge>
                </div>
                <p className="whitespace-pre-wrap text-sm" style={{ color: "var(--text)" }}>
                  {response.message}
                </p>
                <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
                  {response.createdAt.toLocaleDateString()}{" "}
                  {response.createdAt.toLocaleTimeString()}
                </p>
              </Card>
            ))
        )}
      </div>

      {ticket.status !== "CLOSED" && <ReplyForm ticketId={ticket.id} />}
    </div>
  );
}
