import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { store, uid, type LocalExpense, type BudgetCategory } from '../store';
import { Plus, Receipt, Trash2 } from 'lucide-react';

const CATEGORIES: (keyof BudgetCategory)[] = ['food', 'transport', 'accommodation', 'activities', 'other'];
const CAT_EMOJI: Record<string, string> = {
  food: '🍽️', transport: '🚌', accommodation: '🏨', activities: '🎭', other: '💼',
};
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'BDT', 'CAD', 'AUD'];

const BLANK = { category: 'food' as keyof BudgetCategory, amount: 0, currency: 'USD', description: '', date: '' };

export default function Expenses() {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<LocalExpense[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);

  useEffect(() => { setItems(store.getExpenses(id!)); }, [id]);

  const add = () => {
    if (!form.amount) return;
    const newE: LocalExpense = { ...form, id: uid(), tripId: id!, date: form.date || new Date().toISOString().slice(0, 10) };
    const updated = [newE, ...items];
    store.saveExpenses(id!, updated);
    setItems(updated);
    setForm(BLANK);
    setShowForm(false);
  };

  const remove = (eId: string) => {
    const updated = items.filter(e => e.id !== eId);
    store.saveExpenses(id!, updated);
    setItems(updated);
  };

  // Summary by category (same currency only – simplified)
  const summary: Record<string, number> = {};
  items.forEach(e => {
    summary[e.category] = (summary[e.category] || 0) + e.amount;
  });
  const total = Object.values(summary).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      {/* Total */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Expenses</h2>
          <p className="text-sm text-neutral-400 mt-0.5">Total: <span className="text-white font-semibold">${total.toFixed(2)}</span></p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-neutral-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {/* Category summary pills */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter(c => summary[c] > 0).map(c => (
            <div key={c} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 flex items-center gap-1.5">
              <span>{CAT_EMOJI[c]}</span>
              <span className="capitalize">{c}</span>
              <span className="text-white font-semibold ml-1">${summary[c].toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Expense list */}
      {items.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
          <Receipt className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-500">No expenses logged yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map(e => (
            <div key={e.id} className="group flex items-center justify-between px-5 py-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-xl">{CAT_EMOJI[e.category]}</span>
                <div>
                  <div className="text-white text-sm font-medium">{e.description || <span className="capitalize text-neutral-400">{e.category}</span>}</div>
                  <div className="text-xs text-neutral-500 mt-0.5 capitalize">{e.category} · {e.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold">{e.amount} {e.currency}</span>
                <button
                  onClick={() => remove(e.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-500 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6 text-white">Add Expense</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-neutral-400 mb-2 block uppercase tracking-wide">Category</label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c}
                      onClick={() => setForm({ ...form, category: c })}
                      className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-xs capitalize transition-colors ${
                        form.category === c ? 'border-purple-500 bg-purple-500/10 text-purple-300' : 'border-white/10 text-neutral-400 hover:border-white/20'
                      }`}
                    >
                      <span className="text-base">{CAT_EMOJI[c]}</span>
                      <span className="text-[10px]">{c}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Description (optional)</label>
                <input
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  placeholder="e.g. Dinner at Le Jules Verne"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Amount</label>
                  <input type="number" min="0" step="0.01"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Currency</label>
                  <select className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                    {CURRENCIES.map(c => <option key={c} value={c} className="bg-neutral-900">{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Date</label>
                <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="flex gap-3 mt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-white/10 rounded-full text-neutral-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={add} className="flex-1 px-4 py-2.5 bg-white text-black font-medium rounded-full hover:bg-neutral-200 transition-colors">Add</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
