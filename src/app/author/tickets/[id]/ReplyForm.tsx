"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
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
        const msg = data.error || "Failed to send reply";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      e.currentTarget.reset();
      toast.success("Reply sent successfully");
      router.refresh();
    } catch {
      const msg = "Something went wrong. Please try again.";
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  }

  return (
    <Card>
      <h3 className="text-sm font-semibold mb-3" style={{ color: "var(--text)" }}>
        Add Reply
      </h3>
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
          <p
            className="text-sm rounded-lg p-3"
            style={{ color: "#991b1b", backgroundColor: "#fef2f2" }}
          >
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
