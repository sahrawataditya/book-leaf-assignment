"use client";

import { useState, useRef } from "react";
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
  books,
}: {
  authorProfileId: string;
  books: BookOption[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    url: string;
    name: string;
  } | null>(null);

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
          fileUrl: uploadedFile?.url || null,
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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File too large. Maximum size is 10MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Upload failed");
        setUploading(false);
        return;
      }

      setUploadedFile({ url: data.url, name: data.originalName });
      setUploading(false);
    } catch {
      setError("Upload failed. Please try again.");
      setUploading(false);
    }
  }

  function removeFile() {
    setUploadedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
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

        <div>
          <label
            className="block text-sm font-medium mb-1.5"
            style={{ color: "var(--text-secondary)" }}
          >
            Attachment (optional)
          </label>

          {uploadedFile ? (
            <div
              className="flex items-center gap-3 p-3 rounded-lg border"
              style={{
                backgroundColor: "var(--primary-light)",
                borderColor: "var(--primary)",
              }}
            >
              <span className="text-sm flex-1 truncate" style={{ color: "var(--primary)" }}>
                {uploadedFile.name}
              </span>
              <button
                type="button"
                onClick={removeFile}
                className="text-sm font-medium text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-light file:text-primary hover:file:bg-primary/20 transition-colors"
                style={{
                  color: "var(--text-secondary)",
                }}
              />
              {uploading && (
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Uploading...
                </span>
              )}
            </div>
          )}
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            Max 10MB. Allowed: JPG, PNG, WebP, PDF, DOC, DOCX, TXT
          </p>
        </div>

        {error && (
          <p
            className="text-sm text-red-600 rounded-lg p-3"
            style={{ backgroundColor: "#fef2f2" }}
          >
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading || uploading}>
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
