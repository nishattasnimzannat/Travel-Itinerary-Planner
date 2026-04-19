import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { store, type BudgetCategory } from '../store';
import { Wallet, TrendingDown, TrendingUp, RotateCcw } from 'lucide-react';

const CATEGORIES: (keyof BudgetCategory)[] = ['food', 'transport', 'accommodation', 'activities', 'other'];
const COLORS: Record<keyof BudgetCategory, string> = {
  food: 'bg-orange-400',
  transport: 'bg-blue-400',
  accommodation: 'bg-purple-400',
  activities: 'bg-emerald-400',
  other: 'bg-neutral-400',
};
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'BDT', 'CAD', 'AUD', 'INR', 'SGD', 'CHF'];

export default function Budget() {
  const { id } = useParams<{ id: string }>();
  const [budget, setBudget] = useState<BudgetCategory>(store.getBudget(id!));
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<BudgetCategory>(budget);
  const [currency, setCurrency] = useState(() => localStorage.getItem(`budget_currency_${id}`) || 'USD');

  const expenses = store.getExpenses(id!);

  const spent: BudgetCategory = {
    food: 0, transport: 0, accommodation: 0, activities: 0, other: 0,
  };
  expenses.forEach(e => {
    // Simplified: count all expenses regardless of currency
    spent[e.category] = (spent[e.category] || 0) + e.amount;
  });

  const totalBudget = CATEGORIES.reduce((s, c) => s + (budget[c] || 0), 0);
  const totalSpent = CATEGORIES.reduce((s, c) => s + (spent[c] || 0), 0);
  const remaining = totalBudget - totalSpent;

  const saveBudget = () => {
    store.saveBudget(id!, draft);
    localStorage.setItem(`budget_currency_${id}`, currency);
    setBudget(draft);
    setEditing(false);
  };

  const resetBudget = () => {
    const empty: BudgetCategory = { food: 0, transport: 0, accommodation: 0, activities: 0, other: 0 };
    store.saveBudget(id!, empty);
    setBudget(empty);
    setDraft(empty);
  };

  useEffect(() => {
    setBudget(store.getBudget(id!));
    setDraft(store.getBudget(id!));
    setCurrency(localStorage.getItem(`budget_currency_${id}`) || 'USD');
  }, [id]);

  const currencySymbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'JPY' ? '¥' : currency + ' ';

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Budget', value: totalBudget, icon: Wallet, color: 'text-purple-400' },
          { label: 'Total Spent', value: totalSpent, icon: TrendingDown, color: 'text-orange-400' },
          { label: 'Remaining', value: remaining, icon: TrendingUp, color: remaining >= 0 ? 'text-emerald-400' : 'text-red-400' },
        ].map(c => (
          <div key={c.label} className="p-5 rounded-2xl bg-white/5 border border-white/10">
            <c.icon className={`w-5 h-5 mb-3 ${c.color}`} />
            <div className={`text-2xl font-bold ${c.color}`}>{currencySymbol}{c.value.toLocaleString()}</div>
            <div className="text-xs text-neutral-500 mt-1">{c.label}</div>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Category Breakdown</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={resetBudget}
              className="flex items-center gap-1 text-sm text-neutral-500 hover:text-red-400 transition-colors"
              title="Reset budget to zero"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={() => { setDraft(budget); setEditing(true); }}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              Edit budget
            </button>
          </div>
        </div>

        <div className="space-y-5">
          {CATEGORIES.map(cat => {
            const b = budget[cat] || 0;
            const s = spent[cat] || 0;
            const pct = b > 0 ? Math.min((s / b) * 100, 100) : 0;
            const over = s > b && b > 0;
            return (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="capitalize text-neutral-300">{cat}</span>
                  <span className={over ? 'text-red-400' : 'text-neutral-400'}>
                    {currencySymbol}{s.toFixed(0)} / {currencySymbol}{b.toFixed(0)}
                  </span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${over ? 'bg-red-500' : COLORS[cat]}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6 text-white">Set Budget</h2>
            <div className="space-y-4">
              {/* Currency selector (FR-23) */}
              <div>
                <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Budget Currency</label>
                <select
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                >
                  {CURRENCIES.map(c => (
                    <option key={c} value={c} className="bg-neutral-900">{c}</option>
                  ))}
                </select>
              </div>
              {CATEGORIES.map(cat => (
                <div key={cat}>
                  <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide capitalize">{cat}</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                    value={draft[cat] || 0}
                    onChange={e => setDraft({ ...draft, [cat]: Number(e.target.value) })}
                  />
                </div>
              ))}
              <div className="flex gap-3 mt-2">
                <button onClick={() => setEditing(false)} className="flex-1 px-4 py-2.5 border border-white/10 rounded-full text-neutral-400 hover:text-white transition-colors">
                  Cancel
                </button>
                <button onClick={saveBudget} className="flex-1 px-4 py-2.5 bg-white text-black font-medium rounded-full hover:bg-neutral-200 transition-colors">
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
