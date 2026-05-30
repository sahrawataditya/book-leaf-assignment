"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";

interface Admin {
  id: string;
  name: string | null;
}

export function AdminTicketActions({
  ticketId,
  ticketStatus,
  ticketCategory,
  ticketPriority,
  assignedToId,
  assignedToName,
  admins,
}: {
  ticketId: string;
  ticketStatus: string;
  ticketCategory: string;
  ticketPriority: string;
  assignedToId: string | null;
  assignedToName: string | null;
  admins: Admin[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(ticketStatus);
  const [category, setCategory] = useState(ticketCategory);
  const [priority, setPriority] = useState(ticketPriority);
  const [assignee, setAssignee] = useState(assignedToId || "");
  const [message, setMessage] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateTicket() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          category,
          priority,
          assignedToId: assignee || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Update failed");
      }
      router.refresh();
    } catch {
      setError("Failed to update ticket");
    }
    setLoading(false);
  }

  async function sendReply(isInternal = false) {
    const text = message.trim() || draft.trim();
    if (!text) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/tickets/${ticketId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, isInternal }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send");
      } else {
        setMessage("");
        setDraft("");
        router.refresh();
      }
    } catch {
      setError("Failed to send message");
    }
    setLoading(false);
  }

  async function runAI(action: string) {
    setAiLoading(action);
    setError("");

    try {
      const res = await fetch(`/api/admin/ai/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId }),
      });

      const data = await res.json();

      if (action === "draft" && data.draft) {
        setDraft(data.draft);
      }

      if (data.fallback) {
        setError(`${action} AI unavailable, using fallback`);
      }

      router.refresh();
    } catch {
      setError(`AI ${action} failed`);
    }
    setAiLoading(null);
  }

  return (
    <div className="space-y-4 mb-6">
      <Card title="Ticket Management">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={[
              { value: "OPEN", label: "Open" },
              { value: "IN_PROGRESS", label: "In Progress" },
              { value: "RESOLVED", label: "Resolved" },
              { value: "CLOSED", label: "Closed" },
            ]}
          />
          <Select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            options={[
              { value: "ROYALTY_PAYMENTS", label: "Royalty & Payments" },
              { value: "ISBN_METADATA", label: "ISBN & Metadata" },
              { value: "PRINTING_QUALITY", label: "Printing & Quality" },
              {
                value: "DISTRIBUTION_AVAILABILITY",
                label: "Distribution & Availability",
              },
              { value: "PRODUCTION_STATUS", label: "Production Updates" },
              { value: "GENERAL_INQUIRY", label: "General Inquiry" },
            ]}
          />
          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            options={[
              { value: "CRITICAL", label: "Critical" },
              { value: "HIGH", label: "High" },
              { value: "MEDIUM", label: "Medium" },
              { value: "LOW", label: "Low" },
            ]}
          />
          <Select
            label="Assigned To"
            value={assignee}
            onChange={(e) => setAssignee(e.target.value)}
            options={[
              { value: "", label: "Unassigned" },
              ...admins.map((a) => ({
                value: a.id,
                label: a.name || a.id,
              })),
            ]}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={updateTicket} disabled={loading} size="sm">
            {loading ? "Saving..." : "Save Changes"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => runAI("classify")}
            disabled={aiLoading === "classify"}
          >
            {aiLoading === "classify" ? "AI Classifying..." : "AI Classify"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => runAI("priority")}
            disabled={aiLoading === "priority"}
          >
            {aiLoading === "priority" ? "AI Scoring..." : "AI Priority"}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mt-3">
            {error}
          </p>
        )}
      </Card>

      <Card title="AI-Drafted Response">
        <div className="mb-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => runAI("draft")}
            disabled={aiLoading === "draft"}
          >
            {aiLoading === "draft"
              ? "Generating Draft..."
              : "Generate AI Draft"}
          </Button>
        </div>
        {draft && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{draft}</p>
          </div>
        )}
      </Card>

      <Card title="Send Response">
        <div className="space-y-3">
          <Textarea
            value={draft || message}
            onChange={(e) => {
              setMessage(e.target.value);
              if (draft) setDraft("");
            }}
            placeholder="Type your response or generate AI draft above..."
            rows={4}
          />
          <div className="flex gap-2">
            <Button
              onClick={() => sendReply(false)}
              disabled={loading || !(message.trim() || draft.trim())}
              size="sm"
            >
              {loading ? "Sending..." : "Send to Author"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => sendReply(true)}
              disabled={loading || !(message.trim() || draft.trim())}
            >
              {loading ? "Saving..." : "Add Internal Note"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
