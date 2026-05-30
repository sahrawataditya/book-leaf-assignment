interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}

const variants: Record<string, React.CSSProperties> = {
  default: { backgroundColor: "#f3f4f6", color: "#374151" },
  success: { backgroundColor: "#ecfdf5", color: "#065f46" },
  warning: { backgroundColor: "#fef3c7", color: "#92400e" },
  danger: { backgroundColor: "#fef2f2", color: "#991b1b" },
  info: { backgroundColor: "#eef2ff", color: "#4338ca" },
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={variants[variant]}
    >
      {children}
    </span>
  );
}
