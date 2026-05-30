import { z } from "zod";

export const createTicketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000),
  bookId: z.string().optional().nullable(),
  fileUrl: z.string().url().optional().nullable(),
});

export const updateTicketSchema = z.object({
  status: z
    .enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
    .optional(),
  category: z
    .enum([
      "ROYALTY_PAYMENTS",
      "ISBN_METADATA",
      "PRINTING_QUALITY",
      "DISTRIBUTION_AVAILABILITY",
      "PRODUCTION_STATUS",
      "GENERAL_INQUIRY",
    ])
    .optional(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]).optional(),
  assignedToId: z.string().optional().nullable(),
});

export const addResponseSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(5000, "Message too long"),
  isInternal: z.boolean().optional().default(false),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
export type AddResponseInput = z.infer<typeof addResponseSchema>;
