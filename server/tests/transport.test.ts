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
});
