import express from "express";
import cors from "cors";
import { TransportService } from "./services/transportService";
import { AccommodationService } from "./services/accommodationService";
import { ExpenseService } from "./services/expenseService";
import { BudgetService } from "./services/budgetService";

const app = express();
app.use(cors());
app.use(express.json());

const transportSvc = new TransportService();
const accommodationSvc = new AccommodationService();
const expenseSvc = new ExpenseService();
const budgetSvc = new BudgetService();

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// --- Transport routes ---
app.post("/api/transports", (req, res) => {
  transportSvc.addOrUpdate(req.body);
  res.json({ success: true });
});

app.get("/api/transports/:id", (req, res) => {
  const t = transportSvc.get(req.params.id);
  t ? res.json(t) : res.status(404).json({ error: "Not found" });
});

app.get("/api/trips/:tripId/transports", (req, res) => {
  res.json(transportSvc.listByTrip(req.params.tripId));
});

// --- Accommodation routes ---
app.post("/api/accommodations", (req, res) => {
  accommodationSvc.addOrUpdate(req.body);
  res.json({ success: true });
});

app.get("/api/accommodations/:id", (req, res) => {
  const a = accommodationSvc.get(req.params.id);
  a ? res.json(a) : res.status(404).json({ error: "Not found" });
});

app.get("/api/trips/:tripId/accommodations", (req, res) => {
  res.json(accommodationSvc.listByTrip(req.params.tripId));
});

// --- Expense routes ---
app.post("/api/expenses", (req, res) => {
  expenseSvc.add(req.body);
  res.json({ success: true });
});

app.get("/api/trips/:tripId/expenses/summary", (req, res) => {
  res.json(expenseSvc.summarizeByCategory(req.params.tripId));
});

// --- Budget routes ---
app.post("/api/budgets", (req, res) => {
  budgetSvc.setBudget(req.body);
  res.json({ success: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✈️  Travel Buddy API running on http://localhost:${PORT}`);
});
