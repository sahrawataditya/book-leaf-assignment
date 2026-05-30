import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "var(--primary)",
      color: "white",
    },
    secondary: {
      backgroundColor: "var(--surface)",
      color: "var(--text-secondary)",
      border: "1px solid var(--border)",
    },
    danger: {
      backgroundColor: "#dc2626",
      color: "white",
    },
    ghost: {
      color: "var(--text-secondary)",
      backgroundColor: "transparent",
    },
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${className}`}
      style={variants[variant]}
      onMouseEnter={(e) => {
        if (variant === "primary")
          e.currentTarget.style.backgroundColor = "var(--primary-hover)";
        else if (variant === "secondary")
          e.currentTarget.style.backgroundColor = "var(--surface-hover)";
        else if (variant === "ghost")
          e.currentTarget.style.backgroundColor = "var(--surface-hover)";
        else if (variant === "danger")
          e.currentTarget.style.backgroundColor = "#b91c1c";
      }}
      onMouseLeave={(e) => {
        const style = variants[variant];
        if (style.backgroundColor)
          e.currentTarget.style.backgroundColor = style.backgroundColor;
        else
          e.currentTarget.style.backgroundColor = "";
      }}
      {...props}
    >
      {children}
    </button>
  );
}
