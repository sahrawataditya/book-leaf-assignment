import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
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

export default async function MyTickets() {
  const session = await auth();
  const userId = (session?.user as any)?.id;

  const profile = await prisma.authorProfile.findUnique({
    where: { userId },
    include: {
      tickets: {
        include: { responses: true, book: true },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!profile) return <p>Profile not found</p>;

  const tickets = profile.tickets;

  return (
    <div>
      <SSETicketListener authorProfileId={profile.id} />

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Tickets</h1>
          <p className="text-sm text-gray-500 mt-1">
            {tickets.length} total ticket{tickets.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/author/tickets/new">
          <Button>Submit New Query</Button>
        </Link>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              You haven&apos;t submitted any support tickets yet.
            </p>
            <Link href="/author/tickets/new">
              <Button>Submit Your First Query</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/author/tickets/${ticket.ticketId}`}
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
