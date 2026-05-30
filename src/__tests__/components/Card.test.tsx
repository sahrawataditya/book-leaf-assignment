import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "@/components/ui/Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card><p>Content</p></Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<Card title="My Card">Body</Card>);
    expect(screen.getByText("My Card")).toBeInTheDocument();
    expect(screen.getByText("My Card").tagName).toBe("H3");
  });

  it("does not render title when not provided", () => {
    render(<Card>Body</Card>);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  it("applies rounded-xl class", () => {
    render(<Card>Body</Card>);
    const card = screen.getByText("Body").parentElement;
    expect(card?.className).toContain("rounded-xl");
  });

  it("applies additional className", () => {
    render(<Card className="extra-class">Body</Card>);
    const card = screen.getByText("Body").parentElement;
    expect(card?.className).toContain("extra-class");
  });

  it("renders title section with border-b", () => {
    render(<Card title="Title">Body</Card>);
    const header = screen.getByText("Title").closest("div");
    expect(header?.className).toContain("border-b");
  });

  it("renders body in p-6 div", () => {
    render(<Card>Body text</Card>);
    const bodyDiv = screen.getByText("Body text").closest("div");
    expect(bodyDiv?.className).toContain("p-6");
  });

  it("spreads additional props", () => {
    render(<Card data-testid="card-test">Body</Card>);
    const card = screen.getByTestId("card-test");
    expect(card).toBeInTheDocument();
  });
});
