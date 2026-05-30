import { NextRequest } from "next/server";
import ticketEmitter from "@/lib/sse";

export async function GET(request: NextRequest) {
  const authorProfileId = request.nextUrl.searchParams.get("authorProfileId");

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("data: connected\n\n"));

      const handler = (data: any) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      if (authorProfileId) {
        ticketEmitter.on(`ticket:${authorProfileId}`, handler);
      }
      ticketEmitter.on("ticket:admin", handler);

      request.signal.addEventListener("abort", () => {
        if (authorProfileId) {
          ticketEmitter.off(`ticket:${authorProfileId}`, handler);
        }
        ticketEmitter.off("ticket:admin", handler);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
