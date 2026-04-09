import { describe, it, expect } from "vitest";
import { AccommodationService } from "./src/services/accommodationService";
import type { Accommodation } from "./src/models/accommodation";

describe("Accommodation management (8)", () => {
  it("adds, updates and lists by trip", () => {
    const svc = new AccommodationService();
    const a: Accommodation = {
      id: "a1",
      tripId: "t1",
      name: "Grand Hotel",
      checkIn: "2026-05-01",
      checkOut: "2026-05-05",
    };
    svc.addOrUpdate(a);
    expect(svc.get("a1")?.name).toBe("Grand Hotel");
    a.name = "Grand Hotel Deluxe";
    svc.addOrUpdate(a);
    expect(svc.get("a1")?.name).toBe("Grand Hotel Deluxe");
    expect(svc.listByTrip("t1").length).toBe(1);
  });
});
