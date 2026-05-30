import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("renders with primary variant by default", () => {
    render(<Button>Submit</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-[var(--primary)]");
  });

  it("renders with secondary variant", () => {
    render(<Button variant="secondary">Cancel</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-[var(--surface)]");
  });

  it("renders with danger variant", () => {
    render(<Button variant="danger">Delete</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-red-600");
  });

  it("renders with ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("bg-transparent");
  });

  it("renders with sm size", () => {
    render(<Button size="sm">Small</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("px-3 py-1.5");
  });

  it("renders with lg size", () => {
    render(<Button size="lg">Large</Button>);
    const btn = screen.getByRole("button");
    expect(btn.className).toContain("px-6 py-3");
  });

  it("applies additional className", () => {
    render(<Button className="extra-class">Styled</Button>);
    expect(screen.getByRole("button").className).toContain("extra-class");
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("fires onClick handler", async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button onClick={() => { clicked = true; }}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(clicked).toBe(true);
  });

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button disabled onClick={() => { clicked = true; }}>Click</Button>);
    await user.click(screen.getByRole("button"));
    expect(clicked).toBe(false);
  });
});
