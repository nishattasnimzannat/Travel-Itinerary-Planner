import type { Expense } from "../models/budget";

export class ExpenseService {
  private expenses: Expense[] = [];

  add(expense: Expense) {
    this.expenses.push(expense);
  }

  summarizeByCategory(tripId: string): Record<string, number> {
    const summary: Record<string, number> = {};
    const tripExpenses = this.expenses.filter(e => e.tripId === tripId);
    for (const exp of tripExpenses) {
      if (!summary[exp.category]) summary[exp.category] = 0;
      summary[exp.category] += exp.money.amount;
    }
    return summary;
  }
}
