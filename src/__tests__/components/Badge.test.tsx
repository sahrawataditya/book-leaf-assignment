import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "@/components/ui/Badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Open</Badge>);
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("renders with default variant", () => {
    render(<Badge>Default</Badge>);
    const badge = screen.getByText("Default");
    expect(badge).toHaveStyle({ backgroundColor: "#f3f4f6", color: "#374151" });
  });

  it("renders with success variant", () => {
    render(<Badge variant="success">Resolved</Badge>);
    const badge = screen.getByText("Resolved");
    expect(badge).toHaveStyle({ backgroundColor: "#ecfdf5", color: "#065f46" });
  });

  it("renders with warning variant", () => {
    render(<Badge variant="warning">In Progress</Badge>);
    const badge = screen.getByText("In Progress");
    expect(badge).toHaveStyle({ backgroundColor: "#fef3c7", color: "#92400e" });
  });

  it("renders with danger variant", () => {
    render(<Badge variant="danger">Critical</Badge>);
    const badge = screen.getByText("Critical");
    expect(badge).toHaveStyle({ backgroundColor: "#fef2f2", color: "#991b1b" });
  });

  it("renders with info variant", () => {
    render(<Badge variant="info">Info</Badge>);
    const badge = screen.getByText("Info");
    expect(badge).toHaveStyle({ backgroundColor: "#eef2ff", color: "#4338ca" });
  });

  it("has rounded-full class", () => {
    render(<Badge>Round</Badge>);
    expect(screen.getByText("Round").className).toContain("rounded-full");
  });

  it("renders complex children", () => {
    render(
      <Badge>
        <span data-testid="child">Child</span>
      </Badge>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
