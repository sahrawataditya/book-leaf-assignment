"use client";

import { useRouter, usePathname } from "next/navigation";
import { Select } from "@/components/ui/Select";

interface Filters {
  status?: string;
  category?: string;
  priority?: string;
}

export function TicketFilters({
  currentFilters,
}: {
  currentFilters: Filters;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams();
    if (currentFilters.status && key !== "status")
      params.set("status", currentFilters.status);
    if (currentFilters.category && key !== "category")
      params.set("category", currentFilters.category);
    if (currentFilters.priority && key !== "priority")
      params.set("priority", currentFilters.priority);
    if (value) params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      <Select
        options={[
          { value: "", label: "All Statuses" },
          { value: "OPEN", label: "Open" },
          { value: "IN_PROGRESS", label: "In Progress" },
          { value: "RESOLVED", label: "Resolved" },
          { value: "CLOSED", label: "Closed" },
        ]}
        value={currentFilters.status || ""}
        onChange={(e) => updateFilter("status", e.target.value)}
      />
      <Select
        options={[
          { value: "", label: "All Categories" },
          { value: "ROYALTY_PAYMENTS", label: "Royalty & Payments" },
          { value: "ISBN_METADATA", label: "ISBN & Metadata" },
          { value: "PRINTING_QUALITY", label: "Printing & Quality" },
          {
            value: "DISTRIBUTION_AVAILABILITY",
            label: "Distribution & Availability",
          },
          { value: "PRODUCTION_STATUS", label: "Production Updates" },
          { value: "GENERAL_INQUIRY", label: "General Inquiry" },
        ]}
        value={currentFilters.category || ""}
        onChange={(e) => updateFilter("category", e.target.value)}
      />
      <Select
        options={[
          { value: "", label: "All Priorities" },
          { value: "CRITICAL", label: "Critical" },
          { value: "HIGH", label: "High" },
          { value: "MEDIUM", label: "Medium" },
          { value: "LOW", label: "Low" },
        ]}
        value={currentFilters.priority || ""}
        onChange={(e) => updateFilter("priority", e.target.value)}
      />
    </div>
  );
}
