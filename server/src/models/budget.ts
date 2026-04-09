import type { Money } from "./money";

export interface Budget {
  tripId: string;
  baseCurrency: string;
  categories: Record<string, number>;
}

export interface Expense {
  id: string;
  tripId: string;
  category: string;
  money: Money;
}
