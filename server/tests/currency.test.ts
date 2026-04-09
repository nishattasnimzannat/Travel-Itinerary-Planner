import { describe, it, expect } from "vitest";
import { StaticRatesProvider, convert } from "../src/currency/provider";
import { money } from "../src/models/money";

describe("Currency conversion (18)", () => {
  it("converts USD to EUR using static rates", async () => {
    const rates = new StaticRatesProvider({ USD_EUR: 0.9 });
    const eur = await convert(money(100, "USD"), "EUR", rates);
    expect(Math.round(eur.amount)).toBe(90);
    expect(eur.currency).toBe("EUR");
  });
});
