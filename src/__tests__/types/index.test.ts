import { describe, it, expect } from "vitest";
import {
  CATEGORY_LABELS,
  PRIORITY_LABELS,
  STATUS_LABELS,
} from "@/types";

describe("CATEGORY_LABELS", () => {
  it("has all 6 categories", () => {
    expect(Object.keys(CATEGORY_LABELS)).toHaveLength(6);
  });

  it("maps ROYALTY_PAYMENTS correctly", () => {
    expect(CATEGORY_LABELS.ROYALTY_PAYMENTS).toBe("Royalty & Payments");
  });

  it("maps GENERAL_INQUIRY correctly", () => {
    expect(CATEGORY_LABELS.GENERAL_INQUIRY).toBe("General Inquiry");
  });

  it("contains all category keys", () => {
    const keys: (keyof typeof CATEGORY_LABELS)[] = [
      "ROYALTY_PAYMENTS",
      "ISBN_METADATA",
      "PRINTING_QUALITY",
      "DISTRIBUTION_AVAILABILITY",
      "PRODUCTION_STATUS",
      "GENERAL_INQUIRY",
    ];
    for (const key of keys) {
      expect(CATEGORY_LABELS[key]).toBeDefined();
    }
  });

  it("has readable labels (no underscores)", () => {
    for (const label of Object.values(CATEGORY_LABELS)) {
      expect(label).not.toContain("_");
    }
  });
});

describe("PRIORITY_LABELS", () => {
  it("has all 4 priorities", () => {
    expect(Object.keys(PRIORITY_LABELS)).toHaveLength(4);
  });

  it("maps CRITICAL correctly", () => {
    expect(PRIORITY_LABELS.CRITICAL).toBe("Critical");
  });

  it("maps LOW correctly", () => {
    expect(PRIORITY_LABELS.LOW).toBe("Low");
  });
});

describe("STATUS_LABELS", () => {
  it("has all 4 statuses", () => {
    expect(Object.keys(STATUS_LABELS)).toHaveLength(4);
  });

  it("maps IN_PROGRESS correctly", () => {
    expect(STATUS_LABELS.IN_PROGRESS).toBe("In Progress");
  });

  it("maps RESOLVED correctly", () => {
    expect(STATUS_LABELS.RESOLVED).toBe("Resolved");
  });

  it("contains OPEN, IN_PROGRESS, RESOLVED, CLOSED", () => {
    expect(STATUS_LABELS.OPEN).toBe("Open");
    expect(STATUS_LABELS.IN_PROGRESS).toBe("In Progress");
    expect(STATUS_LABELS.RESOLVED).toBe("Resolved");
    expect(STATUS_LABELS.CLOSED).toBe("Closed");
  });
});
