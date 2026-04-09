import { describe, it, expect } from "vitest";
import { BudgetService } from "./src/services/budgetService";
import type { Budget, Expense } from "./src/models/budget";
import { StaticRatesProvider } from "./src/currency/provider";
import { money } from "./src/models/money";

describe("Budget planning (6) with cross-currency expenses", () => {
  it("summarizes planned, spent and remaining", async () => {
    const tripId = "trip-1";
    const budgetSvc = new BudgetService();
    const budget: Budget = {
      tripId,
      baseCurrency: "USD",
      categories: {
        food: 300,
        transport: 500,
        accommodation: 800,
        activities: 200,
      },
    };
    budgetSvc.setBudget(budget);

    const expenses: Expense[] = [
      { id: "e1", tripId, category: "food", money: money(50, "USD") },
      { id: "e2", tripId, category: "transport", money: money(40, "USD") },
      { id: "e3", tripId, category: "accommodation", money: money(100, "EUR") },
    ];

    const rates = new StaticRatesProvider({ USD_EUR: 0.9 });
    const summary = await budgetSvc.summarize(tripId, expenses, rates);
    expect(summary.baseCurrency).toBe("USD");
    expect(Math.round(summary.spentByCategory.accommodation)).toBe(111);
    expect(summary.spentByCategory.food).toBe(50);
    expect(summary.spentByCategory.transport).toBe(40);
  });
});
