"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";

interface BookOption {
  id: string;
  bookId: string;
  title: string;
}

export function NewTicketForm({
  authorProfileId,
  books,
}: {
  authorProfileId: string;
  books: BookOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: form.get("subject"),
          description: form.get("description"),
          bookId: form.get("bookId") || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create ticket");
        setLoading(false);
        return;
      }

      router.push(`/author/tickets/${data.ticket.ticketId}`);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Related Book"
          name="bookId"
          options={[
            { value: "", label: "General / Account Level" },
            ...books.map((b) => ({
              value: b.id,
              label: `${b.title} (${b.bookId})`,
            })),
          ]}
        />

        <Input
          label="Subject"
          name="subject"
          placeholder="Brief summary of your query"
          required
          minLength={3}
          maxLength={200}
        />

        <Textarea
          label="Description"
          name="description"
          placeholder="Please describe your issue in detail..."
          required
          minLength={10}
          maxLength={2000}
          rows={6}
        />

        <Input
          label="Attachment URL (optional)"
          name="fileUrl"
          type="url"
          placeholder="https://example.com/file.pdf"
        />

        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Query"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
