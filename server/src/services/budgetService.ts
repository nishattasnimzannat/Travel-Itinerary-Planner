import type { Budget, Expense } from "../models/budget";
import type { RatesProvider } from "../currency/provider";
import { convert } from "../currency/provider";

export interface BudgetSummary {
  baseCurrency: string;
  spentByCategory: Record<string, number>;
}

export class BudgetService {
  private budgets = new Map<string, Budget>();

  setBudget(budget: Budget) {
    this.budgets.set(budget.tripId, budget);
  }

  async summarize(tripId: string, expenses: Expense[], provider: RatesProvider): Promise<BudgetSummary> {
    const budget = this.budgets.get(tripId);
    if (!budget) throw new Error("Budget not found");

    const sum: Record<string, number> = {};
    for (const exp of expenses) {
      if (!sum[exp.category]) sum[exp.category] = 0;
      const converted = await convert(exp.money, budget.baseCurrency, provider);
      sum[exp.category] += converted.amount;
    }

    return {
      baseCurrency: budget.baseCurrency,
      spentByCategory: sum,
    };
  }
}
