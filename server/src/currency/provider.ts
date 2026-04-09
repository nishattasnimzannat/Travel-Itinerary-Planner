import type { Money } from "../models/money";
import { money } from "../models/money";

export interface RatesProvider {
  getRate(from: string, to: string): Promise<number>;
}

export class StaticRatesProvider implements RatesProvider {
  constructor(private rates: Record<string, number>) {}

  async getRate(from: string, to: string): Promise<number> {
    if (from === to) return 1;
    const rate = this.rates[`${from}_${to}`];
    if (rate !== undefined) return rate;
    const invRate = this.rates[`${to}_${from}`];
    if (invRate !== undefined) return 1 / invRate;
    throw new Error(`No rate found for ${from} to ${to}`);
  }
}

export async function convert(m: Money, targetCurrency: string, provider: RatesProvider): Promise<Money> {
  const rate = await provider.getRate(m.currency, targetCurrency);
  return money(m.amount * rate, targetCurrency);
}
