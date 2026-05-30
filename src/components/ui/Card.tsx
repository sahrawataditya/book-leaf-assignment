import { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function Card({ title, children, className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl border shadow-sm ${className}`}
      style={{
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
      {...props}
    >
      {title && (
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--border)" }}>
          <h3 className="text-lg font-semibold" style={{ color: "var(--text)" }}>
            {title}
          </h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}
