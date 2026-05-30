"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function SSETicketListener({ authorProfileId }: { authorProfileId: string }) {
  const router = useRouter();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!authorProfileId) return;

    const eventSource = new EventSource(`/api/sse?authorProfileId=${authorProfileId}`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = () => {
      router.refresh();
    };

    eventSource.onerror = () => {
      eventSource.close();
      setTimeout(() => {
        router.refresh();
      }, 10000);
    };

    return () => {
      eventSource.close();
    };
  }, [authorProfileId, router]);

  return null;
}
