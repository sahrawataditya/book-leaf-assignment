import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { TicketFilters } from "./TicketFilters";
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

export default async function AdminTickets({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; category?: string; priority?: string }>;
}) {
  const filters = await searchParams;

  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.category) where.category = filters.category;
  if (filters.priority) where.priority = filters.priority;

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      authorProfile: {
        include: { user: { select: { name: true, email: true } } },
      },
      book: { select: { title: true } },
      assignedTo: { select: { name: true } },
      responses: true,
    },
    orderBy: [
      { priority: "asc" },
      { createdAt: "asc" },
    ],
  });

  const totalCount = await prisma.ticket.count();

  return (
    <div>
      <SSETicketListener authorProfileId="admin" />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ticket Queue</h1>
          <p className="text-sm text-gray-500 mt-1">
            {totalCount} total tickets · Showing {tickets.length}
          </p>
        </div>
      </div>

      <TicketFilters currentFilters={filters} />

      {tickets.length === 0 ? (
        <Card>
          <p className="text-gray-500 text-center py-8">
            No tickets match the current filters.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/admin/tickets/${ticket.id}`}
              className="block"
            >
              <Card className="hover:border-indigo-200 transition-colors cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-gray-400">
                        {ticket.ticketId}
                      </span>
                      <Badge variant={getBadgeVariant(ticket.status as TicketStatus)}>
                        {STATUS_LABELS[ticket.status as TicketStatus]}
                      </Badge>
                      <Badge variant={getPriorityVariant(ticket.priority as TicketPriority)}>
                        {PRIORITY_LABELS[ticket.priority as TicketPriority]}
                      </Badge>
                    </div>
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {ticket.subject}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {ticket.authorProfile?.user?.name || "Unknown"} ·{" "}
                      {CATEGORY_LABELS[ticket.category as TicketCategory]}
                      {ticket.book && ` · ${ticket.book.title}`}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-400 ml-4 flex-shrink-0">
                    <p>{ticket.createdAt.toLocaleDateString()}</p>
                    <p className="mt-0.5">
                      {ticket.responses.length} response
                      {ticket.responses.length !== 1 ? "s" : ""}
                    </p>
                    {ticket.assignedTo && (
                      <p className="mt-0.5 text-indigo-500">
                        {ticket.assignedTo.name}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
