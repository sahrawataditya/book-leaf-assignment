export type TicketCategory =
  | "ROYALTY_PAYMENTS"
  | "ISBN_METADATA"
  | "PRINTING_QUALITY"
  | "DISTRIBUTION_AVAILABILITY"
  | "PRODUCTION_STATUS"
  | "GENERAL_INQUIRY";

export type TicketPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type Role = "AUTHOR" | "ADMIN";

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: Role;
  authorProfileId?: string;
}

export interface BookData {
  bookId: string;
  title: string;
  isbn: string | null;
  genre: string | null;
  publicationDate: string | null;
  status: string | null;
  mrp: number | null;
  authorRoyaltyPerCopy: number | null;
  totalCopiesSold: number;
  totalRoyaltyEarned: number;
  royaltyPaid: number;
  royaltyPending: number;
  lastRoyaltyPayoutDate: string | null;
  printPartner: string | null;
  availableOn: string[];
}

export interface TicketData {
  id: string;
  ticketId: string;
  subject: string;
  description: string;
  fileUrl: string | null;
  category: TicketCategory;
  aiClassifiedCategory: string | null;
  priority: TicketPriority;
  aiPriorityScore: string | null;
  status: TicketStatus;
  assignedToName: string | null;
  bookTitle: string | null;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  responseCount: number;
}

export interface TicketDetail extends TicketData {
  authorEmail: string;
  responses: TicketResponseData[];
}

export interface TicketResponseData {
  id: string;
  message: string;
  authorType: "AUTHOR" | "ADMIN";
  isInternal: boolean;
  createdAt: string;
}

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  ROYALTY_PAYMENTS: "Royalty & Payments",
  ISBN_METADATA: "ISBN & Metadata Issues",
  PRINTING_QUALITY: "Printing & Quality",
  DISTRIBUTION_AVAILABILITY: "Distribution & Availability",
  PRODUCTION_STATUS: "Book Status & Production Updates",
  GENERAL_INQUIRY: "General Inquiry",
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};
