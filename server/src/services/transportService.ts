import type { Transport } from "../models/transport";

export class TransportService {
  private transports = new Map<string, Transport>();

  addOrUpdate(t: Transport) {
    this.transports.set(t.id, t);
  }

  get(id: string): Transport | undefined {
    return this.transports.get(id);
  }

  listByTrip(tripId: string): Transport[] {
    return Array.from(this.transports.values()).filter(t => t.tripId === tripId);
  }
}
