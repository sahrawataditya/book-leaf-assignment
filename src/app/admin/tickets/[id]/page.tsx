import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AdminTicketActions } from "./AdminTicketActions";
import { SSETicketListener } from "@/components/tickets/SSETicketListener";
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
    case "OPEN":
      return "warning" as const;
    case "IN_PROGRESS":
      return "info" as const;
    case "RESOLVED":
      return "success" as const;
    case "CLOSED":
      return "default" as const;
  }
}

function getPriorityVariant(priority: TicketPriority) {
  switch (priority) {
    case "CRITICAL":
      return "danger" as const;
    case "HIGH":
      return "warning" as const;
    case "MEDIUM":
      return "info" as const;
    case "LOW":
      return "default" as const;
  }
}

export default async function AdminTicketDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

  if (!ticket) notFound();

  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-4xl">
      <SSETicketListener authorProfileId="admin" />

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-mono text-gray-400">
            {ticket.ticketId}
          </span>
          <Badge variant={getBadgeVariant(ticket.status as TicketStatus)}>
            {STATUS_LABELS[ticket.status as TicketStatus]}
          </Badge>
          <Badge variant={getPriorityVariant(ticket.priority as TicketPriority)}>
            {PRIORITY_LABELS[ticket.priority as TicketPriority]}
          </Badge>
          {ticket.aiPriorityScore && (
            <span className="text-xs text-gray-400 italic">
              AI: {ticket.aiPriorityScore}
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{ticket.subject}</h1>
        <p className="text-sm text-gray-500 mt-1">
          <span className="font-medium">
            {ticket.authorProfile?.user?.name}
          </span>{" "}
          · {ticket.authorProfile?.user?.email}
          {ticket.book && ` · ${ticket.book.title} (${ticket.book.bookId})`}
        </p>
      </div>

      <Card className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Badge>
            {CATEGORY_LABELS[ticket.category as TicketCategory]}
          </Badge>
          {ticket.aiClassifiedCategory && (
            <span className="text-xs text-gray-400">
              AI classified: {ticket.aiClassifiedCategory}
            </span>
          )}
        </div>
        <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        <p className="text-xs text-gray-400 mt-3">
          Submitted on {ticket.createdAt.toLocaleDateString()}{" "}
          {ticket.createdAt.toLocaleTimeString()}
        </p>
      </Card>

      <AdminTicketActions
        ticketId={ticket.id}
        ticketStatus={ticket.status}
        ticketCategory={ticket.category}
        ticketPriority={ticket.priority}
        assignedToId={ticket.assignedTo?.id || null}
        assignedToName={ticket.assignedTo?.name || null}
        admins={admins}
      />

      <div className="space-y-4 mb-6">
        {ticket.responses.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No responses yet.
          </p>
        ) : (
          ticket.responses.map((response) => (
            <Card
              key={response.id}
              className={`${response.isInternal ? "border-yellow-200 bg-yellow-50/20" : response.authorType === "ADMIN" ? "border-indigo-200 bg-indigo-50/30" : ""}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={
                    response.isInternal
                      ? "warning"
                      : response.authorType === "ADMIN"
                      ? "info"
                      : "default"
                  }
                >
                  {response.isInternal
                    ? "Internal Note"
                    : response.authorType === "ADMIN"
                    ? "Admin Response"
                    : "Author"}
                </Badge>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap text-sm">
                {response.message}
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {response.createdAt.toLocaleDateString()}{" "}
                {response.createdAt.toLocaleTimeString()}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
