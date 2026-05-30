import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <p className="text-sm text-gray-500">Total Tickets</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {totalTickets}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Open Tickets</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">
            {openTickets}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">In Progress</p>
          <p className="text-3xl font-bold text-blue-600 mt-1">
            {inProgressTickets}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Critical Priority</p>
          <p className="text-3xl font-bold text-red-600 mt-1">
            {criticalTickets}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Authors</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {totalAuthors}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Total Books</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {totalBooks}
          </p>
        </Card>
      </div>

      <Card title="Quick Actions">
        <div className="space-y-3">
          <Link href="/admin/tickets">
            <Button className="w-full justify-start">
              View All Tickets ({totalTickets})
            </Button>
          </Link>
          <Link href="/admin/tickets?status=OPEN">
            <Button variant="secondary" className="w-full justify-start">
              View Open Tickets ({openTickets})
            </Button>
          </Link>
          <Link href="/admin/tickets?priority=CRITICAL">
            <Button variant="danger" className="w-full justify-start">
              View Critical Tickets ({criticalTickets})
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
