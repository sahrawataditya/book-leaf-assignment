import Groq from "groq-sdk";

const CATEGORIES = [
  "ROYALTY_PAYMENTS",
  "ISBN_METADATA",
  "PRINTING_QUALITY",
  "DISTRIBUTION_AVAILABILITY",
  "PRODUCTION_STATUS",
  "GENERAL_INQUIRY",
] as const;

const PRIORITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

const KNOWLEDGE_BASE = `BookLeaf Publishing Knowledge Base:

Company Overview:
- BookLeaf Publishing is a self-publishing company operating in India and the US.
- We offer publishing packages: Standard Free (no upfront cost) and Bestseller Breakthrough (premium, paid package with marketing and distribution add-ons).
- We handle cover design, typesetting, ISBN assignment, printing, distribution, and royalty management for our authors.
- Our in-house printing facility and warehouse are located in Delhi. We also work with print partners including Repro India and Epitome Books.

Royalty Policy:
- BookLeaf follows an 80/20 royalty split: 80% of the net profit per book goes to the author, 20% to BookLeaf.
- Net profit = MRP minus printing cost, platform commission (Amazon/Flipkart), and shipping charges.
- Royalties are calculated quarterly and paid within 45 days of the quarter ending.
- Minimum payout threshold: ₹1,000. If accumulated royalties are below this, they roll over to the next quarter.
- Payouts are made via bank transfer to the account linked in the author's dashboard.
- Authors can view a detailed royalty breakdown in their dashboard, showing sales figures per platform.

ISBN Policy:
- Every book published through BookLeaf receives a unique ISBN assigned by BookLeaf.
- ISBNs are registered under BookLeaf's publisher imprint. If an author wants an ISBN under their own imprint, they need to obtain it independently.
- If an author reports an ISBN error (duplicate, wrong book linked), it is treated as a high-priority issue and escalated to the production team.

Printing & Quality:
- In-house printing handles most orders. Overflow or specific format requirements go to Repro India or Epitome Books.
- Standard print turnaround: 5-7 business days from order confirmation.
- If an author reports a quality issue (misprints, binding defects, color inconsistency), BookLeaf arranges a free reprint after verification. The author may need to share photos of the defective copy.

Distribution & Availability:
- Books are listed on Amazon India, Flipkart, Amazon US, Amazon UK, and the BookLeaf Store.
- New listings typically go live within 7-10 business days after publication is complete.
- If a book is showing as unavailable on a platform, it usually indicates a stock sync issue—BookLeaf's team can trigger a re-sync within 24-48 hours.

Production Stages:
- A book goes through the following stages: Manuscript Received → Editing (if opted) → Cover Design → Typesetting → Proofreading → ISBN Assignment → Printing → Distribution Setup → Published & Live.
- Authors are updated at each stage via email. Delays typically happen at Cover Design (waiting for author approval) and Proofreading (revision rounds).

Communication Tone Guidelines:
- Always empathetic and professional. Authors are our partners, not customers to be managed.
- Acknowledge the author's concern before jumping to solutions.
- Be specific: include actual numbers, dates, and statuses wherever possible rather than vague reassurances.
- If something is BookLeaf's fault (delayed royalties, ISBN error), own it directly. No corporate deflection.
- If the issue requires escalation or investigation, give a clear timeline ("Our team will look into this and get back to you within 48 hours") rather than open-ended promises.
- Always end with a clear next step for the author and/or the BookLeaf team.`;

let groq: Groq | null = null;

function getClient(): Groq | null {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === "" || apiKey.startsWith("gsk_") === false) {
    return null;
  }
  if (!groq) {
    groq = new Groq({ apiKey });
  }
  return groq;
}

export async function classifyTicket(
  subject: string,
  description: string
): Promise<{ category: string; confidence: string } | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a ticket classification system for BookLeaf Publishing. Classify the following support query into exactly one category.

Categories:
- ROYALTY_PAYMENTS: Questions about royalty calculations, payments, payouts, bank details, payment delays, royalty statements.
- ISBN_METADATA: Issues with ISBN numbers, book metadata (title, description, author name), wrong ISBN on platforms.
- PRINTING_QUALITY: Print quality issues, misprints, binding defects, paper quality, color issues, reprint requests.
- DISTRIBUTION_AVAILABILITY: Book not showing on Amazon/Flipkart, stock sync issues, listing problems, availability concerns.
- PRODUCTION_STATUS: Questions about book production timeline, current stage, delays in editing/typesetting/cover design.
- GENERAL_INQUIRY: Anything else not covered above, account changes, author bio updates, general questions.

Respond with JSON: { "category": "CATEGORY_NAME", "confidence": "high|medium|low" }`,
        },
        {
          role: "user",
          content: `Subject: ${subject}\n\nDescription: ${description}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    if (CATEGORIES.includes(parsed.category)) {
      return { category: parsed.category, confidence: parsed.confidence || "medium" };
    }
    return null;
  } catch {
    return null;
  }
}

export async function getPriorityScore(
  subject: string,
  description: string
): Promise<{ priority: string; reason: string } | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a priority scoring system for BookLeaf Publishing support tickets. Analyze the query and assign a priority level.

Priority Levels:
- CRITICAL: Payment not received for 6+ months, ISBN errors on live listings, major printing defects blocking sales, legal concerns.
- HIGH: Payment delays (1-6 months), metadata errors, quality issues, distribution problems affecting sales, production delays with no update.
- MEDIUM: General inquiries about status, standard requests for updates, non-urgent policy questions.
- LOW: Cosmetic changes, general information requests, feature requests, account updates.

Respond with JSON: { "priority": "CRITICAL|HIGH|MEDIUM|LOW", "reason": "Brief explanation of why" }`,
        },
        {
          role: "user",
          content: `Subject: ${subject}\n\nDescription: ${description}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    if (PRIORITIES.includes(parsed.priority)) {
      return { priority: parsed.priority, reason: parsed.reason || "" };
    }
    return null;
  } catch {
    return null;
  }
}

export async function draftResponse(
  subject: string,
  description: string,
  category: string
): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a helpful and professional support representative for BookLeaf Publishing. Your job is to draft empathetic, specific responses to author queries.

${KNOWLEDGE_BASE}

IMPORTANT RULES:
1. Always acknowledge the author's concern first before jumping to solutions.
2. Be specific: include actual numbers, dates, and statuses where possible.
3. If something is BookLeaf's fault, own it directly. No corporate deflection.
4. If escalation is needed, give a clear timeline (e.g., "Our team will look into this within 48 hours").
5. Always end with a clear next step for the author.
6. Keep responses concise but thorough. Do not be generic.
7. The response should sound like a real person wrote it, not generic AI fluff.

Respond with a single JSON object: { "draft": "your draft response here" }`,
        },
        {
          role: "user",
          content: `Category: ${category}\nSubject: ${subject}\n\nAuthor Query:\n${description}\n\nPlease draft a response from BookLeaf support.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return parsed.draft || null;
  } catch {
    return null;
  }
}
