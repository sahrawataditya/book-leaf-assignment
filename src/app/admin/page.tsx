import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { SSETicketListener } from "@/components/tickets/SSETicketListener";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function AdminDashboard() {
  const totalTickets = await prisma.ticket.count();
  const openTickets = await prisma.ticket.count({
    where: { status: "OPEN" },
  });
  const inProgressTickets = await prisma.ticket.count({
    where: { status: "IN_PROGRESS" },
  });
  const criticalTickets = await prisma.ticket.count({
    where: { priority: "CRITICAL", status: { not: "CLOSED" } },
  });
  const totalAuthors = await prisma.authorProfile.count();
  const totalBooks = await prisma.book.count();

  return (
    <div>
      <SSETicketListener authorProfileId="admin" />
      <h1 className="text-2xl font-bold mb-6" style={{ color: "var(--text)" }}>
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Total Tickets
          </p>
          <p className="text-3xl font-bold mt-1" style={{ color: "var(--text)" }}>
            {totalTickets}
          </p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Open Tickets
          </p>
          <p className="text-3xl font-bold mt-1 text-amber-600">
            {openTickets}
          </p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            In Progress
          </p>
          <p className="text-3xl font-bold mt-1" style={{ color: "var(--primary)" }}>
            {inProgressTickets}
          </p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Critical Priority
          </p>
          <p className="text-3xl font-bold mt-1 text-red-600">
            {criticalTickets}
          </p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Total Authors
          </p>
          <p className="text-3xl font-bold mt-1" style={{ color: "var(--text)" }}>
            {totalAuthors}
          </p>
        </Card>
        <Card>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Total Books
          </p>
          <p className="text-3xl font-bold mt-1" style={{ color: "var(--text)" }}>
            {totalBooks}
          </p>
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/tickets">
            <Button>View All Tickets ({totalTickets})</Button>
          </Link>
          <Link href="/admin/tickets?status=OPEN">
            <Button variant="secondary">View Open Tickets ({openTickets})</Button>
          </Link>
          <Link href="/admin/tickets?priority=CRITICAL">
            <Button variant="danger">View Critical ({criticalTickets})</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
