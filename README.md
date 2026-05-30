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
| **AI/LLM** | Groq API (llama-3.3-70b-versatile) with graceful fallback |
| **File Uploads** | Cloudinary (images, PDFs, docs) |
| **Real-time** | Server-Sent Events (SSE) |
| **Styling** | Tailwind CSS with CSS custom properties theming |
| **Validation** | Zod |
| **Testing** | Vitest + Testing Library (93 tests) |
| **Deployment** | Vercel |

## Features

### Author Portal
- **Dashboard** — Overview of published books, total sales, royalties earned/pending
- **My Books** — Detailed view of all books with royalty breakdowns
- **Submit a Support Query** — Create tickets with book association and file uploads (images, PDFs, documents)
- **My Tickets** — View all tickets with real-time updates when admin responds

### Admin Portal
- **Dashboard** — System-wide stats (total tickets, open/critical counts, authors, books)
- **Ticket Queue** — Filterable list of all tickets (by status, category, priority)
- **Ticket Detail** — Full ticket view with conversation thread
- **Ticket Management** — Update status, category, priority; assign to admin; add internal notes
- **AI Classification** — Auto-classify tickets into 6 categories using Groq
- **AI Priority Scoring** — Auto-assign priority (Critical/High/Medium/Low) based on content
- **AI-Drafted Responses** — Generate contextual responses using the BookLeaf Knowledge Base

### AI Integration
- **Model**: llama-3.3-70b-versatile via Groq API — fast inference with JSON mode
- **Prompt Engineering** — Structured prompts with the full BookLeaf Knowledge Base as context
- **Graceful Degradation** — All AI features fall back gracefully when the API is unavailable
- **Cost Optimization** — Groq offers free tier; only necessary context is sent per request
- **API Key Security** — Key stored in environment variable, never exposed to frontend
- **Error Handling** — AI failures don't block ticket creation or admin workflows

### Theme System
- **5 Accent Colors**: Indigo (default), Emerald, Amber, Rose, Violet
- **Persistent**: Theme choice stored in cookie (1 year expiry)
- **Server-aware**: Theme read from cookie by server components for SSR consistency
- **CSS Variables**: All components use `var(--primary)`, `var(--text)`, `var(--surface)` etc.

## Prerequisites

- Node.js 18+
- PostgreSQL database
- Groq API key (optional — AI features fall back gracefully)
- Cloudinary account (optional — file uploads fall back to disabled)

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

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | Secret for session encryption |
| `NEXTAUTH_URL` | Yes | Deployment URL (e.g. http://localhost:3000) |
| `GROQ_API_KEY` | No | Groq API key for AI features |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name for file uploads |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |

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

### 5. Run Tests

```bash
npm test         # Run once
npm run test:watch  # Watch mode
```

### 6. Build for Production

```bash
npm run build
npm start
```

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Steps

1. Push your repo to GitHub
2. Import the project in [Vercel](https://vercel.com/new)
3. Add the following environment variables in the Vercel dashboard:

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (use [Neon](https://neon.tech) or [Supabase](https://supabase.com) for serverless Postgres) |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Yes | Your Vercel deployment URL (e.g. `https://book-leaf.vercel.app`) |
| `GROQ_API_KEY` | No | Groq API key for AI features |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |

4. Deploy — Vercel automatically detects Next.js, runs `postinstall` (generates Prisma client) then `build`
5. Run database migrations and seed (one-time):

```bash
# From your local machine, after setting DATABASE_URL to the production DB:
npx prisma migrate deploy
npx prisma db seed
```

> **Note**: Use a serverless-compatible PostgreSQL provider like [Neon](https://neon.tech) or [Supabase](https://supabase.com). The Prisma `pg` adapter works well with their connection poolers.

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

### File Upload

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | Any | Upload a file to Cloudinary (multipart/form-data with `file` field) |

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

**Upload a File**
```http
POST /api/upload
Content-Type: multipart/form-data

file: <binary file data>
```

Response (201):
```json
{
  "url": "https://res.cloudinary.com/.../image.jpg",
  "publicId": "bookleaf-tickets/abc123",
  "originalName": "screenshot.jpg",
  "size": 245760,
  "format": "jpg"
}
```

**Create a Ticket**
```http
POST /api/tickets
Content-Type: application/json

{
  "subject": "Royalty payment not received",
  "description": "I published my book 4 months ago and haven't received any royalty payment.",
  "bookId": "clx...abc123",
  "fileUrl": "https://res.cloudinary.com/.../image.jpg"
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

### Why Groq over OpenAI?
Groq offers significantly faster inference speeds with their LPU hardware, a generous free tier, and full OpenAI-compatible API. The llama-3.3-70b-versatile model provides excellent classification and response quality at no cost.

### AI Strategy
- **Model**: llama-3.3-70b-versatile via Groq — fast, free tier available
- **Prompts**: System messages include the full Knowledge Base; user messages contain ticket context
- **Structured Output**: JSON mode for reliable parsing of classification and priority results
- **Cost Management**: Only relevant context is sent; Knowledge Base is shared via system prompt
- **Graceful Degradation**: Every AI call is wrapped in try/catch; failures fall back to sensible defaults

### Theming
CSS custom properties (variables) are used for all theme colors. The `ThemeProvider` client component sets a `data-theme` attribute on `<html>` and a cookie for SSR persistence. Five accent color palettes are available.

## Project Structure

```
book-leaf-portal/
├── prisma/
│   ├── schema.prisma          # Database schema (7 models)
│   ├── seed.ts                # Sample data seeder
│   └── sample-data.json       # 10 authors, 18 books
├── src/
│   ├── app/
│   │   ├── login/             # Login page
│   │   ├── author/            # Author portal (dashboard, books, tickets)
│   │   ├── admin/             # Admin portal (dashboard, tickets)
│   │   └── api/               # REST API routes (12 endpoints)
│   ├── __tests__/             # Test suite (9 files, 93 tests)
│   │   ├── lib/               # Unit tests for validations & SSE
│   │   ├── types/             # Type constants tests
│   │   ├── components/        # Component tests (Button, Input, Badge, Card)
│   │   └── api/               # Integration tests for API routes
│   │   ├── ui/                # Button, Input, Select, Card, Badge, Textarea
│   │   ├── tickets/           # Ticket-related components (SSE listener)
│   │   └── layout/            # Sidebar, PortalLayout, ThemeProvider, ThemeToggle
│   ├── lib/
│   │   ├── auth.ts            # Auth.js configuration
│   │   ├── prisma.ts          # Prisma client (singleton)
│   │   ├── ai.ts              # Groq AI integration (classification, priority, draft)
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
- **Cloudinary not configured** — upload endpoint returns 501, form shows file input without upload
- **Zero royalties** — correctly displayed as ₹0, not hidden
- **Authors with no published books** — dashboard adapts to show only relevant stats
- **SSE disconnect** — client auto-refreshes after 10 seconds on connection loss

## Known Limitations & Improvements

1. **Email Notifications**: No email triggers. Would add with Resend/SendGrid when ticket status changes.
2. **Pagination**: Ticket lists don't paginate. Would add cursor-based pagination for large datasets.
3. **Rate Limiting**: API endpoints lack rate limiting. Would add with Vercel KV or a middleware.
4. **Analytics**: Admin dashboard could include charts for ticket volume trends, response times, and AI accuracy.
5. **E2E Testing**: Browser-level tests with Playwright would add coverage for full user flows (login → create ticket → admin respond).

## License

Confidential — BookLeaf Technical Assignment
