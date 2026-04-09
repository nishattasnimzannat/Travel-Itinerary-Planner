import { describe, it, expect } from "vitest";
import { ExpenseService } from "../src/services/expenseService";
import { money } from "../src/models/money";

describe("Expense tracking (7)", () => {
  it("adds and summarizes by category", () => {
    const svc = new ExpenseService();
    svc.add({
      id: "e1",
      tripId: "t1",
      category: "food",
      money: money(25, "USD"),
    });
    svc.add({
      id: "e2",
      tripId: "t1",
      category: "food",
      money: money(15, "USD"),
    });
    svc.add({
      id: "e3",
      tripId: "t1",
      category: "transport",
      money: money(10, "USD"),
    });
    const summary = svc.summarizeByCategory("t1");
    expect(summary.food).toBe(40);
    expect(summary.transport).toBe(10);
  });
});
