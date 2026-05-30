import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    ticket: { findUnique: vi.fn(), update: vi.fn() },
    ticketResponse: { create: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/sse", () => ({
  emitTicketUpdate: vi.fn(),
}));

import { POST } from "@/app/api/tickets/[id]/responses/route";
import * as auth from "@/lib/auth";
import prisma from "@/lib/prisma";

function mockRequest(body?: unknown): any {
  return {
    json: vi.fn().mockResolvedValue(body),
  };
}

function mockParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("POST /api/tickets/[id]/responses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockTicket = {
    id: "ticket1",
    ticketId: "TK001",
    status: "OPEN",
    authorProfileId: "profile1",
    authorProfile: { userId: "user1" },
  };

  it("returns 404 for non-existent ticket", async () => {
    vi.mocked(auth.auth).mockResolvedValue({ user: { id: "user1" } } as any);
    vi.mocked(prisma.ticket.findUnique).mockResolvedValue(null);

    const res = await POST(mockRequest({ message: "Hello" }), mockParams("nonexistent"));
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error).toBe("Ticket not found");
  });

  it("returns 403 for unauthorized user", async () => {
    vi.mocked(auth.auth).mockResolvedValue({ user: { id: "user2" } } as any);
    vi.mocked(prisma.ticket.findUnique).mockResolvedValue(mockTicket as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "AUTHOR" } as any);

    const res = await POST(mockRequest({ message: "Hello" }), mockParams("ticket1"));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toBe("Forbidden");
  });

  it("allows ticket author to respond", async () => {
    vi.mocked(auth.auth).mockResolvedValue({ user: { id: "user1" } } as any);
    vi.mocked(prisma.ticket.findUnique).mockResolvedValue(mockTicket as any);
    vi.mocked(prisma.ticketResponse.create).mockResolvedValue({
      id: "resp1",
      message: "Thank you!",
      authorType: "AUTHOR",
      isInternal: false,
    } as any);

    const res = await POST(mockRequest({ message: "Thank you!" }), mockParams("ticket1"));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.response.message).toBe("Thank you!");
    expect(json.response.authorType).toBe("AUTHOR");
  });

  it("allows admin to respond", async () => {
    vi.mocked(auth.auth).mockResolvedValue({ user: { id: "admin1" } } as any);
    vi.mocked(prisma.ticket.findUnique).mockResolvedValue(mockTicket as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "ADMIN" } as any);
    vi.mocked(prisma.ticketResponse.create).mockResolvedValue({
      id: "resp2",
      message: "We are working on it.",
      authorType: "ADMIN",
      isInternal: false,
    } as any);
    vi.mocked(prisma.ticket.update).mockResolvedValue(mockTicket as any);

    const res = await POST(
      mockRequest({ message: "We are working on it." }),
      mockParams("ticket1")
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.response.authorType).toBe("ADMIN");
  });

  it("sets ticket to IN_PROGRESS when admin responds to OPEN ticket", async () => {
    vi.mocked(auth.auth).mockResolvedValue({ user: { id: "admin1" } } as any);
    vi.mocked(prisma.ticket.findUnique).mockResolvedValue(mockTicket as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "ADMIN" } as any);
    vi.mocked(prisma.ticketResponse.create).mockResolvedValue({ id: "resp3" } as any);
    const updateSpy = vi.mocked(prisma.ticket.update).mockResolvedValue(mockTicket as any);

    await POST(mockRequest({ message: "Checking on this." }), mockParams("ticket1"));

    expect(updateSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "ticket1" },
        data: { status: "IN_PROGRESS" },
      })
    );
  });

  it("returns 400 for empty message", async () => {
    vi.mocked(auth.auth).mockResolvedValue({ user: { id: "user1" } } as any);
    vi.mocked(prisma.ticket.findUnique).mockResolvedValue(mockTicket as any);

    const res = await POST(mockRequest({ message: "" }), mockParams("ticket1"));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
  });

  it("creates internal note when isInternal is true", async () => {
    vi.mocked(auth.auth).mockResolvedValue({ user: { id: "admin1" } } as any);
    vi.mocked(prisma.ticket.findUnique).mockResolvedValue(mockTicket as any);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ role: "ADMIN" } as any);
    const createSpy = vi.mocked(prisma.ticketResponse.create).mockResolvedValue({
      id: "resp4",
      isInternal: true,
    } as any);
    vi.mocked(prisma.ticket.update).mockResolvedValue(mockTicket as any);

    await POST(
      mockRequest({ message: "Internal note", isInternal: true }),
      mockParams("ticket1")
    );

    expect(createSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isInternal: true }),
      })
    );
  });
});
