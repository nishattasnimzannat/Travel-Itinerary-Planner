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

  it("converts EUR to USD using inverse rate (FR-75)", async () => {
    const rates = new StaticRatesProvider({ USD_EUR: 0.9 });
    const usd = await convert(money(90, "EUR"), "USD", rates);
    expect(Math.round(usd.amount)).toBe(100);
    expect(usd.currency).toBe("USD");
  });

  it("returns same amount for same currency", async () => {
    const rates = new StaticRatesProvider({});
    const result = await convert(money(100, "USD"), "USD", rates);
    expect(result.amount).toBe(100);
    expect(result.currency).toBe("USD");
  });

  it("throws error for unknown currency pair", async () => {
    const rates = new StaticRatesProvider({});
    await expect(convert(money(100, "USD"), "XYZ", rates)).rejects.toThrow("No rate found");
  });

  it("supports multiple currency pairs (FR-74)", async () => {
    const rates = new StaticRatesProvider({
      USD_EUR: 0.92,
      USD_GBP: 0.79,
      USD_JPY: 154.5,
      USD_BDT: 110.5,
    });
    const eur = await convert(money(100, "USD"), "EUR", rates);
    expect(Math.round(eur.amount)).toBe(92);
    const gbp = await convert(money(100, "USD"), "GBP", rates);
    expect(Math.round(gbp.amount)).toBe(79);
    const jpy = await convert(money(100, "USD"), "JPY", rates);
    expect(Math.round(jpy.amount)).toBe(15450);
    const bdt = await convert(money(100, "USD"), "BDT", rates);
    expect(Math.round(bdt.amount)).toBe(11050);
  });
});
