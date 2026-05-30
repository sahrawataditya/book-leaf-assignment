# BookLeaf Author Support & Communication Portal

A full-stack web application for BookLeaf Publishing to handle author support queries with AI-powered classification, prioritization, and response drafting.

Built for the BookLeaf Technical Assignment (Full-Stack Developer Position).

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL + Prisma 7 ORM |
| **Authentication** | Auth.js v5 (NextAuth) with Credentials provider |
| **AI/LLM** | OpenAI API (gpt-4o-mini) with graceful fallback |
| **Real-time** | Server-Sent Events (SSE) |
| **Styling** | Tailwind CSS |
| **Validation** | Zod |
| **Deployment** | Railway |

## Features

### Author Portal
- **Dashboard** — Overview of published books, total sales, royalties earned/pending
- **My Books** — Detailed view of all books with royalty breakdowns
- **Submit a Support Query** — Create tickets with book association and optional file attachments
- **My Tickets** — View all tickets with real-time updates when admin responds

### Admin Portal
- **Dashboard** — System-wide stats (total tickets, open/critical counts, authors, books)
- **Ticket Queue** — Filterable list of all tickets (by status, category, priority)
- **Ticket Detail** — Full ticket view with conversation thread
- **Ticket Management** — Update status, category, priority; assign to admin; add internal notes
- **AI Classification** — Auto-classify tickets into 6 categories
- **AI Priority Scoring** — Auto-assign priority (Critical/High/Medium/Low) based on content
- **AI-Drafted Responses** — Generate contextual responses using the BookLeaf Knowledge Base

### AI Integration
- **Prompt Engineering** — Structured prompts with the full BookLeaf Knowledge Base as context
- **Graceful Degradation** — All AI features have fallback modes when the API is unavailable
- **Cost Optimization** — Uses gpt-4o-mini (inexpensive); only sends necessary context
- **API Key Security** — Key stored in environment variable, never exposed to frontend
- **Error Handling** — AI failures don't block ticket creation or admin workflows

## Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key (optional — AI features fall back gracefully)

## Getting Started

### 1. Clone and Install

```bash
git clone <repo-url> book-leaf-portal
cd book-leaf-portal
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
```
DATABASE_URL="postgresql://user:password@localhost:5432/bookleaf?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="sk-your-openai-api-key"  # Optional — AI features work without it
```

### 3. Database Setup

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

The seed script creates:
- **Admin user**: `admin@bookleaf.com` / `admin123`
- **10 author users** (from the sample data): each with password `author123`
- **18 books** with realistic data including various states (published, in production, zero royalties, etc.)

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 5. Build for Production

```bash
npm run build
npm start
```

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@bookleaf.com | admin123 |
| Author (Sneha Kulkarni) | sneha.kulkarni@email.com | author123 |
| Author (Rohit Kapoor) | rohit.kapoor@email.com | author123 |
| Any author | (see sample data) | author123 |

## API Documentation

All API endpoints are under `/api/` and require authentication via Auth.js session cookies.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET/POST | `/api/auth/[...nextauth]` | No | Auth.js route handler (login, session, logout) |

### Author Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/books` | Author | List current author's books |
| GET | `/api/tickets` | Author | List current author's tickets |
| POST | `/api/tickets` | Author | Create a new support ticket |
| POST | `/api/tickets/[id]/responses` | Author | Add a reply to a ticket |

### Admin Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/admin/tickets` | Admin | List all tickets (supports `?status=`, `?category=`, `?priority=` filters) |
| GET | `/api/admin/tickets/[id]` | Admin | Get ticket details with all responses |
| PUT | `/api/admin/tickets/[id]` | Admin | Update ticket (status, category, priority, assignee) |

### AI Endpoints (Admin)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/admin/ai/classify` | Admin | AI classify a ticket into a category |
| POST | `/api/admin/ai/priority` | Admin | AI score a ticket's priority |
| POST | `/api/admin/ai/draft` | Admin | AI generate a draft response |

### Real-time Endpoint

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/sse?authorProfileId=` | Any | SSE stream for real-time ticket updates |

### Request/Response Examples

**Create a Ticket**
```http
POST /api/tickets
Content-Type: application/json

{
  "subject": "Royalty payment not received",
  "description": "I published my book 4 months ago and haven't received any royalty payment.",
  "bookId": "clx...abc123"
}
```

Response (201):
```json
{
  "ticket": {
    "ticketId": "TK001",
    "subject": "Royalty payment not received",
    "status": "OPEN",
    "category": "ROYALTY_PAYMENTS",
    "priority": "HIGH",
    ...
  }
}
```

**Update a Ticket (Admin)**
```http
PUT /api/admin/tickets/clx...abc123
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "priority": "CRITICAL",
  "assignedToId": "clx...adminId"
}
```

## Architecture Decisions

### Why Next.js?
A single framework for frontend and backend simplifies development, deployment, and maintains a consistent codebase. App Router provides server components by default, keeping sensitive logic (database queries, AI calls) on the server.

### Why Auth.js (NextAuth) v5?
Industry-standard authentication for Next.js with built-in support for credentials provider, JWT sessions, and middleware integration. The Prisma adapter handles session persistence automatically.

### Why SSE over WebSockets?
SSE provides unidirectional real-time updates (server→client) which is sufficient for ticket notifications. Simpler to implement and deploy — no separate WebSocket server needed.

### Why Prisma 7?
Type-safe database access, auto-generated client, easy migrations, and excellent Next.js integration. The new Prisma 7 configuration with `prisma.config.ts` is cleaner and more flexible than v6.

### AI Strategy
- **Model**: gpt-4o-mini — balances quality and cost ($0.15/M input tokens)
- **Prompts**: System messages include the full Knowledge Base; user messages contain ticket context
- **Structured Output**: JSON mode for reliable parsing of classification and priority results
- **Cost Management**: Only relevant context is sent; Knowledge Base is shared via system prompt
- **Graceful Degradation**: Every AI call is wrapped in try/catch; failures fall back to sensible defaults

## Project Structure

```
book-leaf-portal/
├── prisma/
│   ├── schema.prisma          # Database schema (7 models)
│   ├── seed.ts                # Sample data seeder
│   └── sample-data.json       # 10 authors, 18 books
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Login page
│   │   ├── author/            # Author portal (dashboard, books, tickets)
│   │   ├── admin/             # Admin portal (dashboard, tickets)
│   │   └── api/               # REST API routes
│   ├── components/
│   │   ├── ui/                # Button, Input, Select, Card, Badge, Textarea
│   │   ├── tickets/           # Ticket-related components
│   │   └── layout/            # Sidebar, PortalLayout
│   ├── lib/
│   │   ├── auth.ts            # Auth.js configuration
│   │   ├── prisma.ts          # Prisma client (singleton)
│   │   ├── ai.ts              # AI integration (classification, priority, draft)
│   │   ├── sse.ts             # Server-Sent Events emitter
│   │   └── validations.ts     # Zod schemas
│   ├── types/                 # TypeScript interfaces and constants
│   └── proxy.ts               # Route protection and RBAC
└── prisma.config.ts           # Prisma 7 configuration
```

## Edge Cases Handled

- **Books in production** (null dates, null MRP, 0 sales) — displayed gracefully with "In Production" badges
- **No tickets yet** — empty states with CTAs to submit first query
- **AI API unavailable** — tickets created without AI classification; admin can set manually
- **Zero royalties** — correctly displayed as ₹0, not hidden
- **Authors with no published books** — dashboard adapts to show only relevant stats
- **SSE disconnect** — client auto-refreshes after 10 seconds on connection loss

## Known Limitations & Improvements

1. **File Uploads**: Attachment UI is present but uses URL input instead of actual file upload. Implement AWS S3/Cloudinary upload in production.
2. **Email Notifications**: No email triggers. Would add with Resend/SendGrid when ticket status changes.
3. **Pagination**: Ticket lists don't paginate. Would add cursor-based pagination for large datasets.
4. **Testing**: Unit and integration tests would be added with Vitest and Playwright.
5. **Rate Limiting**: API endpoints lack rate limiting. Would add with Vercel KV or a middleware.
6. **Analytics**: Admin dashboard could include charts for ticket volume trends, response times, and AI accuracy.

## License

Confidential — BookLeaf Technical Assignment
