import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "@/components/ui/Input";

describe("Input", () => {
  it("renders input element", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders with label", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Email").tagName).toBe("LABEL");
  });

  it("renders error message", () => {
    render(<Input error="Email is required" />);
    expect(screen.getByText("Email is required")).toBeInTheDocument();
    expect(screen.getByText("Email is required").className).toContain("text-red-500");
  });

  it("does not render label when not provided", () => {
    render(<Input />);
    expect(screen.queryByRole("label")).not.toBeInTheDocument();
  });

  it("passes placeholder prop", () => {
    render(<Input placeholder="Enter your email" />);
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
  });

  it("applies className", () => {
    render(<Input className="extra-class" />);
    expect(screen.getByRole("textbox").className).toContain("extra-class");
  });

  it("allows typing", async () => {
    const user = userEvent.setup();
    render(<Input />);
    const input = screen.getByRole("textbox");
    await user.type(input, "hello");
    expect(input).toHaveValue("hello");
  });

  it("shows error border color via style", () => {
    render(<Input error="Error" />);
    expect(screen.getByRole("textbox")).toHaveStyle({ borderColor: "#ef4444" });
  });
});
