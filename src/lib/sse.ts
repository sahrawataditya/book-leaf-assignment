import { EventEmitter } from "events";

const ticketEmitter = new EventEmitter();
ticketEmitter.setMaxListeners(100);

export function emitTicketUpdate(data: {
  ticketId: string;
  authorProfileId: string;
  type: "response" | "status" | "new";
}) {
  ticketEmitter.emit(`ticket:${data.authorProfileId}`, data);
  ticketEmitter.emit("ticket:admin", data);
}

export function subscribeToAuthorTickets(
  authorProfileId: string,
  handler: (data: any) => void
) {
  ticketEmitter.on(`ticket:${authorProfileId}`, handler);
  return () => ticketEmitter.off(`ticket:${authorProfileId}`, handler);
}

export function subscribeToAdminTickets(handler: (data: any) => void) {
  ticketEmitter.on("ticket:admin", handler);
  return () => ticketEmitter.off("ticket:admin", handler);
}

export default ticketEmitter;
