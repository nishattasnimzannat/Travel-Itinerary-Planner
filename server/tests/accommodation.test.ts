import { describe, it, expect } from "vitest";
import { AccommodationService } from "../src/services/accommodationService";
import type { Accommodation } from "../src/models/accommodation";

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

  it("stores confirmation number (FR-33)", () => {
    const svc = new AccommodationService();
    const a: Accommodation = {
      id: "a2",
      tripId: "t1",
      name: "Beach Resort",
      address: "123 Beach Rd",
      checkIn: "2026-06-01",
      checkOut: "2026-06-05",
      confirmationNumber: "CONF-98765",
    };
    svc.addOrUpdate(a);
    expect(svc.get("a2")?.confirmationNumber).toBe("CONF-98765");
  });

  it("supports multiple accommodations per trip (FR-34)", () => {
    const svc = new AccommodationService();
    svc.addOrUpdate({ id: "a1", tripId: "t1", name: "Hotel A", checkIn: "2026-05-01", checkOut: "2026-05-03" });
    svc.addOrUpdate({ id: "a2", tripId: "t1", name: "Hotel B", checkIn: "2026-05-03", checkOut: "2026-05-05" });
    svc.addOrUpdate({ id: "a3", tripId: "t2", name: "Hotel C", checkIn: "2026-05-01", checkOut: "2026-05-05" });
    expect(svc.listByTrip("t1").length).toBe(2);
    expect(svc.listByTrip("t2").length).toBe(1);
  });
});
