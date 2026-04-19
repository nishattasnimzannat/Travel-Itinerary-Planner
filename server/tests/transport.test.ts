import { describe, it, expect } from "vitest";
import { TransportService } from "../src/services/transportService";
import type { Transport } from "../src/models/transport";

describe("Transportation planning (9)", () => {
  it("adds and retrieves transports", () => {
    const svc = new TransportService();
    const t: Transport = {
      id: "tr1",
      tripId: "t1",
      type: "flight",
      segments: [
        {
          from: "JFK",
          to: "LHR",
          departure: "2026-05-01T10:00:00Z",
          arrival: "2026-05-01T20:00:00Z",
          carrier: "BA",
          number: "BA178",
        },
      ],
    };
    svc.addOrUpdate(t);
    const got = svc.get("tr1");
    expect(got?.type).toBe("flight");
    expect(got?.segments[0].from).toBe("JFK");
    expect(svc.listByTrip("t1").length).toBe(1);
  });

  it("stores booking reference (FR-37)", () => {
    const svc = new TransportService();
    const t: Transport = {
      id: "tr2",
      tripId: "t1",
      type: "train",
      segments: [
        { from: "London", to: "Paris", departure: "2026-05-02T08:00:00Z", arrival: "2026-05-02T11:00:00Z", carrier: "Eurostar", number: "ES9012" },
      ],
      bookingReference: "EUR-ABC123",
    };
    svc.addOrUpdate(t);
    expect(svc.get("tr2")?.bookingReference).toBe("EUR-ABC123");
  });

  it("supports multi-leg journeys (FR-38)", () => {
    const svc = new TransportService();
    const t: Transport = {
      id: "tr3",
      tripId: "t1",
      type: "flight",
      segments: [
        { from: "JFK", to: "ORD", departure: "2026-05-01T08:00:00Z", arrival: "2026-05-01T10:00:00Z", carrier: "UA", number: "UA100" },
        { from: "ORD", to: "LAX", departure: "2026-05-01T12:00:00Z", arrival: "2026-05-01T14:00:00Z", carrier: "UA", number: "UA200" },
      ],
    };
    svc.addOrUpdate(t);
    const got = svc.get("tr3");
    expect(got?.segments.length).toBe(2);
    expect(got?.segments[0].to).toBe("ORD");
    expect(got?.segments[1].from).toBe("ORD");
  });
});
