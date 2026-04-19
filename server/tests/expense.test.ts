import { describe, it, expect } from "vitest";
import { ExpenseService } from "../src/services/expenseService";
import { money } from "../src/models/money";

describe("Expense tracking (7)", () => {
  it("adds and summarizes by category", () => {
    const svc = new ExpenseService();
    svc.add({ id: "e1", tripId: "t1", category: "food", money: money(25, "USD") });
    svc.add({ id: "e2", tripId: "t1", category: "food", money: money(15, "USD") });
    svc.add({ id: "e3", tripId: "t1", category: "transport", money: money(10, "USD") });
    const summary = svc.summarizeByCategory("t1");
    expect(summary.food).toBe(40);
    expect(summary.transport).toBe(10);
  });

  it("isolates expenses by trip", () => {
    const svc = new ExpenseService();
    svc.add({ id: "e1", tripId: "t1", category: "food", money: money(50, "USD") });
    svc.add({ id: "e2", tripId: "t2", category: "food", money: money(30, "USD") });
    const s1 = svc.summarizeByCategory("t1");
    const s2 = svc.summarizeByCategory("t2");
    expect(s1.food).toBe(50);
    expect(s2.food).toBe(30);
  });

  it("handles multiple categories per trip (FR-28)", () => {
    const svc = new ExpenseService();
    svc.add({ id: "e1", tripId: "t1", category: "food", money: money(50, "USD") });
    svc.add({ id: "e2", tripId: "t1", category: "transport", money: money(30, "USD") });
    svc.add({ id: "e3", tripId: "t1", category: "accommodation", money: money(200, "USD") });
    svc.add({ id: "e4", tripId: "t1", category: "other", money: money(20, "USD") });
    const summary = svc.summarizeByCategory("t1");
    expect(summary.food).toBe(50);
    expect(summary.transport).toBe(30);
    expect(summary.accommodation).toBe(200);
    expect(summary.other).toBe(20);
  });
});
