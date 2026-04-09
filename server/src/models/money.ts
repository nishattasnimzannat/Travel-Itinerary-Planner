export interface Money {
  amount: number;
  currency: string;
}

export function money(amount: number, currency: string): Money {
  return { amount, currency };
}
