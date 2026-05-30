import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  default: {
    authorProfile: { findUnique: vi.fn() },
    ticket: { count: vi.fn(), create: vi.fn(), findMany: vi.fn() },
    ticketResponse: { create: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/ai", () => ({
  classifyTicket: vi.fn(),
  getPriorityScore: vi.fn(),
}));

vi.mock("@/lib/sse", () => ({
  emitTicketUpdate: vi.fn(),
}));

import { GET, POST } from "@/app/api/tickets/route";
import * as auth from "@/lib/auth";
import prisma from "@/lib/prisma";
import * as ai from "@/lib/ai";

function mockRequest(body?: unknown): NextRequest {
  return {
    json: vi.fn().mockResolvedValue(body),
  } as unknown as NextRequest;
}

const mockSession = {
  user: { id: "user1", email: "author@test.com", name: "Author", role: "AUTHOR" },
};

const mockProfile = { id: "profile1", userId: "user1" };

describe("GET /api/tickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth.auth).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe("Unauthorized");
  });

  it("returns 401 when no author profile", async () => {
    vi.mocked(auth.auth).mockResolvedValue(mockSession as any);
    vi.mocked(prisma.authorProfile.findUnique).mockResolvedValue(null);
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns tickets for authenticated author", async () => {
    vi.mocked(auth.auth).mockResolvedValue(mockSession as any);
    vi.mocked(prisma.authorProfile.findUnique).mockResolvedValue(mockProfile as any);
    const mockTickets = [
      { id: "1", ticketId: "TK001", responses: [], book: { title: "Test Book" } },
    ];
    vi.mocked(prisma.ticket.findMany).mockResolvedValue(mockTickets as any);

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.tickets).toHaveLength(1);
    expect(json.tickets[0].ticketId).toBe("TK001");
  });
});

describe("POST /api/tickets", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth.auth).mockResolvedValue(null);
    const res = await POST(mockRequest({}));
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid JSON", async () => {
    vi.mocked(auth.auth).mockResolvedValue(mockSession as any);
    vi.mocked(prisma.authorProfile.findUnique).mockResolvedValue(mockProfile as any);
    const req = { json: vi.fn().mockRejectedValue(new Error("Bad JSON")) } as unknown as NextRequest;
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Invalid JSON");
  });

  it("returns 400 for validation failure", async () => {
    vi.mocked(auth.auth).mockResolvedValue(mockSession as any);
    vi.mocked(prisma.authorProfile.findUnique).mockResolvedValue(mockProfile as any);
    const res = await POST(mockRequest({ subject: "AB", description: "short" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe("Validation failed");
    expect(json.details).toBeDefined();
  });

  it("creates ticket with AI classification", async () => {
    vi.mocked(auth.auth).mockResolvedValue(mockSession as any);
    vi.mocked(prisma.authorProfile.findUnique).mockResolvedValue(mockProfile as any);
    vi.mocked(prisma.ticket.count).mockResolvedValue(0);
    vi.mocked(ai.classifyTicket).mockResolvedValue({ category: "ROYALTY_PAYMENTS" });
    vi.mocked(ai.getPriorityScore).mockResolvedValue({ priority: "HIGH", reason: "Keywords related to payment", score: 75 });
    vi.mocked(prisma.ticket.create).mockResolvedValue({
      id: "ticket1",
      ticketId: "TK001",
      subject: "Royalty payment issue",
      description: "I haven't received payment for 3 months.",
      category: "ROYALTY_PAYMENTS",
      priority: "HIGH",
      book: null,
    } as any);

    const res = await POST(
      mockRequest({
        subject: "Royalty payment issue",
        description: "I haven't received payment for 3 months.",
      })
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.ticket.ticketId).toBe("TK001");
    expect(json.ticket.category).toBe("ROYALTY_PAYMENTS");
    expect(json.ticket.priority).toBe("HIGH");
  });

  it("creates ticket without AI (graceful fallback)", async () => {
    vi.mocked(auth.auth).mockResolvedValue(mockSession as any);
    vi.mocked(prisma.authorProfile.findUnique).mockResolvedValue(mockProfile as any);
    vi.mocked(prisma.ticket.count).mockResolvedValue(5);
    vi.mocked(ai.classifyTicket).mockResolvedValue(null);
    vi.mocked(ai.getPriorityScore).mockResolvedValue(null);
    vi.mocked(prisma.ticket.create).mockResolvedValue({
      id: "ticket6",
      ticketId: "TK006",
      subject: "General question",
      description: "How do I update my book metadata?",
      category: "GENERAL_INQUIRY",
      priority: "MEDIUM",
      book: null,
    } as any);

    const res = await POST(
      mockRequest({
        subject: "General question",
        description: "How do I update my book metadata?",
      })
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.ticket.ticketId).toBe("TK006");
    expect(json.ticket.category).toBe("GENERAL_INQUIRY");
    expect(json.ticket.priority).toBe("MEDIUM");
  });

  it("creates ticket with bookId and fileUrl", async () => {
    vi.mocked(auth.auth).mockResolvedValue(mockSession as any);
    vi.mocked(prisma.authorProfile.findUnique).mockResolvedValue(mockProfile as any);
    vi.mocked(prisma.ticket.count).mockResolvedValue(0);
    vi.mocked(ai.classifyTicket).mockResolvedValue(null);
    vi.mocked(ai.getPriorityScore).mockResolvedValue(null);
    vi.mocked(prisma.ticket.create).mockResolvedValue({
      id: "ticket2",
      ticketId: "TK001",
      bookId: "book1",
      fileUrl: "https://example.com/file.pdf",
    } as any);

    const res = await POST(
      mockRequest({
        subject: "Print quality issue",
        description: "The cover has a misprint on page 10.",
        bookId: "book1",
        fileUrl: "https://example.com/file.pdf",
      })
    );

    expect(res.status).toBe(201);
    expect(prisma.ticket.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bookId: "book1",
          fileUrl: "https://example.com/file.pdf",
        }),
      })
    );
  });
});
