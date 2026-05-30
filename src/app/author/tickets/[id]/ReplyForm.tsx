"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Card } from "@/components/ui/Card";

export function ReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/tickets/${ticketId}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: form.get("message") }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to send reply");
        setLoading(false);
        return;
      }

      e.currentTarget.reset();
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Reply</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          name="message"
          placeholder="Type your reply here..."
          required
          minLength={1}
          maxLength={5000}
          rows={4}
        />
        {error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg p-3">
            {error}
          </p>
        )}
        <Button type="submit" disabled={loading} size="sm">
          {loading ? "Sending..." : "Send Reply"}
        </Button>
      </form>
    </Card>
  );
}
