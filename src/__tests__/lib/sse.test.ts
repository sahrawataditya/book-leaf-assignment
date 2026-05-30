import { describe, it, expect, vi } from "vitest";
import {
  emitTicketUpdate,
  subscribeToAuthorTickets,
  subscribeToAdminTickets,
} from "@/lib/sse";

describe("SSE Event Emitter", () => {
  it("emits to author-specific channel", () => {
    const handler = vi.fn();
    const cleanup = subscribeToAuthorTickets("profile123", handler);

    emitTicketUpdate({
      ticketId: "ticket1",
      authorProfileId: "profile123",
      type: "response",
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      ticketId: "ticket1",
      authorProfileId: "profile123",
      type: "response",
    });

    cleanup();
  });

  it("emits to admin channel", () => {
    const handler = vi.fn();
    const cleanup = subscribeToAdminTickets(handler);

    emitTicketUpdate({
      ticketId: "ticket1",
      authorProfileId: "profile123",
      type: "new",
    });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith({
      ticketId: "ticket1",
      authorProfileId: "profile123",
      type: "new",
    });

    cleanup();
  });

  it("does not emit to wrong author channel", () => {
    const handler = vi.fn();
    const cleanup = subscribeToAuthorTickets("profile456", handler);

    emitTicketUpdate({
      ticketId: "ticket1",
      authorProfileId: "profile123",
      type: "status",
    });

    expect(handler).not.toHaveBeenCalled();
    cleanup();
  });

  it("emits both author and admin channels", () => {
    const authorHandler = vi.fn();
    const adminHandler = vi.fn();
    const cleanup1 = subscribeToAuthorTickets("profile123", authorHandler);
    const cleanup2 = subscribeToAdminTickets(adminHandler);

    emitTicketUpdate({
      ticketId: "ticket1",
      authorProfileId: "profile123",
      type: "response",
    });

    expect(authorHandler).toHaveBeenCalledTimes(1);
    expect(adminHandler).toHaveBeenCalledTimes(1);

    cleanup1();
    cleanup2();
  });

  it("stops emitting after cleanup", () => {
    const handler = vi.fn();
    const cleanup = subscribeToAuthorTickets("profile123", handler);
    cleanup();

    emitTicketUpdate({
      ticketId: "ticket1",
      authorProfileId: "profile123",
      type: "response",
    });

    expect(handler).not.toHaveBeenCalled();
  });

  it("handles all event types", () => {
    const types = ["response", "status", "new"] as const;
    const handler = vi.fn();
    const cleanup = subscribeToAdminTickets(handler);

    for (const type of types) {
      emitTicketUpdate({
        ticketId: "ticket1",
        authorProfileId: "profile123",
        type,
      });
    }

    expect(handler).toHaveBeenCalledTimes(3);
    cleanup();
  });
});
