import type { Accommodation } from "../models/accommodation";

export class AccommodationService {
  private accommodations = new Map<string, Accommodation>();

  addOrUpdate(a: Accommodation) {
    this.accommodations.set(a.id, a);
  }

  get(id: string): Accommodation | undefined {
    return this.accommodations.get(id);
  }

  listByTrip(tripId: string): Accommodation[] {
    return Array.from(this.accommodations.values()).filter(a => a.tripId === tripId);
  }
}
