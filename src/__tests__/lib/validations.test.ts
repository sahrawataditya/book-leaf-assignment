import { describe, it, expect } from "vitest";
import {
  createTicketSchema,
  updateTicketSchema,
  addResponseSchema,
  loginSchema,
} from "@/lib/validations";

describe("createTicketSchema", () => {
  it("accepts valid ticket data", () => {
    const result = createTicketSchema.safeParse({
      subject: "Royalty payment missing",
      description: "I published my book 4 months ago and haven't received any royalty payment.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts ticket with bookId", () => {
    const result = createTicketSchema.safeParse({
      subject: "ISBN error on Amazon",
      description: "My book shows wrong ISBN on Amazon India listing.",
      bookId: "clx123abc",
    });
    expect(result.success).toBe(true);
  });

  it("accepts ticket with fileUrl", () => {
    const result = createTicketSchema.safeParse({
      subject: "Print quality issue",
      description: "The images in my book are blurry.",
      fileUrl: "https://example.com/photo.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty subject", () => {
    const result = createTicketSchema.safeParse({
      subject: "",
      description: "Some description that is long enough.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short subject (< 3 chars)", () => {
    const result = createTicketSchema.safeParse({
      subject: "Hi",
      description: "Some description that is long enough.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short description (< 10 chars)", () => {
    const result = createTicketSchema.safeParse({
      subject: "Valid subject",
      description: "Short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid fileUrl", () => {
    const result = createTicketSchema.safeParse({
      subject: "Valid subject",
      description: "Valid description that is long enough.",
      fileUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing required fields", () => {
    const result = createTicketSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("updateTicketSchema", () => {
  it("accepts partial updates", () => {
    const result = updateTicketSchema.safeParse({
      status: "IN_PROGRESS",
    });
    expect(result.success).toBe(true);
  });

  it("accepts full update", () => {
    const result = updateTicketSchema.safeParse({
      status: "RESOLVED",
      category: "ROYALTY_PAYMENTS",
      priority: "HIGH",
      assignedToId: "user123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateTicketSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = updateTicketSchema.safeParse({
      status: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid priority", () => {
    const result = updateTicketSchema.safeParse({
      priority: "URGENT",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = updateTicketSchema.safeParse({
      category: "BILLING",
    });
    expect(result.success).toBe(false);
  });

  it("accepts null assignedToId", () => {
    const result = updateTicketSchema.safeParse({
      assignedToId: null,
    });
    expect(result.success).toBe(true);
  });
});

describe("addResponseSchema", () => {
  it("accepts valid response", () => {
    const result = addResponseSchema.safeParse({
      message: "Thank you for your query. We are looking into this.",
    });
    expect(result.success).toBe(true);
  });

  it("accepts response with isInternal", () => {
    const result = addResponseSchema.safeParse({
      message: "Escalate to production team.",
      isInternal: true,
    });
    expect(result.success).toBe(true);
  });

  it("defaults isInternal to false", () => {
    const result = addResponseSchema.parse({
      message: "Hello",
    });
    expect(result.isInternal).toBe(false);
  });

  it("rejects empty message", () => {
    const result = addResponseSchema.safeParse({
      message: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects message exceeding 5000 chars", () => {
    const result = addResponseSchema.safeParse({
      message: "x".repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const result = loginSchema.safeParse({
      email: "author@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "password123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "author@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing email", () => {
    const result = loginSchema.safeParse({
      password: "password123",
    });
    expect(result.success).toBe(false);
  });
});
