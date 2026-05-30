"use client";

import { useState } from "react";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];
const PDF_EXTENSION = "pdf";

function getFileType(url: string): "image" | "pdf" | "other" {
  const ext = url.split(".").pop()?.toLowerCase() || "";
  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (ext === PDF_EXTENSION) return "pdf";
  return "other";
}

export function TicketFileDisplay({ fileUrl }: { fileUrl: string | null }) {
  const [imgError, setImgError] = useState(false);

  if (!fileUrl) return null;

  if (imgError) {
    return (
      <div
        className="mt-3 p-3 rounded-lg border text-sm"
        style={{
          backgroundColor: "var(--surface-hover)",
          borderColor: "var(--border)",
          color: "var(--text-muted)",
        }}
      >
        Attachment unavailable
      </div>
    );
  }

  const type = getFileType(fileUrl);

  if (type === "image") {
    return (
      <div className="mt-3">
        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={fileUrl}
            alt="Ticket attachment"
            className="max-w-full max-h-64 rounded-lg border object-contain cursor-pointer hover:opacity-90 transition-opacity"
            style={{ borderColor: "var(--border)" }}
            onError={() => setImgError(true)}
          />
        </a>
        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--primary)" }}
            className="hover:underline"
          >
            Open full size
          </a>
        </p>
      </div>
    );
  }

  if (type === "pdf") {
    return (
      <div className="mt-3">
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
          style={{
            backgroundColor: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
          }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Open PDF
        </a>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{
          backgroundColor: "var(--primary-light)",
          color: "var(--primary)",
          border: "1px solid var(--primary)",
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Download Attachment
      </a>
    </div>
  );
}
