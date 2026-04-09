import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { store, type Trip } from '../store';
import { Wallet, Building2, Plane, Receipt, ArrowRight } from 'lucide-react';

export default function TripOverview() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const found = store.getTrips().find(t => t.id === id) ?? null;
    setTrip(found);
  }, [id]);

  if (!trip) return null;

  const expenses = store.getExpenses(id!);
  const accommodations = store.getAccommodations(id!);
  const transports = store.getTransports(id!);
  const budget = store.getBudget(id!);
  const totalBudget = Object.values(budget).reduce((a, b) => a + b, 0);
  const totalSpent = expenses.reduce((a, e) => a + e.amount, 0);

  const quickLinks = [
    { label: 'Budget', to: 'budget', icon: Wallet, color: 'text-purple-400', stat: totalBudget > 0 ? `$${totalSpent}/$${totalBudget}` : 'Not set' },
    { label: 'Accommodation', to: 'accommodation', icon: Building2, color: 'text-blue-400', stat: `${accommodations.length} stay${accommodations.length !== 1 ? 's' : ''}` },
    { label: 'Transport', to: 'transport', icon: Plane, color: 'text-emerald-400', stat: `${transports.length} segment${transports.length !== 1 ? 's' : ''}` },
    { label: 'Expenses', to: 'expenses', icon: Receipt, color: 'text-orange-400', stat: `${expenses.length} item${expenses.length !== 1 ? 's' : ''}` },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Trip Overview</h2>
        <p className="text-sm text-neutral-400">Quick summary of your trip planning progress.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {quickLinks.map(({ label, to, icon: Icon, color, stat }) => (
          <button
            key={label}
            onClick={() => navigate(to)}
            className="group p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-left"
          >
            <Icon className={`w-5 h-5 mb-3 ${color}`} />
            <div className="text-white font-semibold mb-0.5">{label}</div>
            <div className="text-xs text-neutral-500">{stat}</div>
            <div className="mt-3 flex items-center gap-1 text-xs text-neutral-600 group-hover:text-neutral-400 transition-colors">
              View <ArrowRight className="w-3 h-3" />
            </div>
          </button>
        ))}
      </div>

      {/* Quick tips */}
      <div className="p-5 rounded-2xl border border-white/5 bg-gradient-to-br from-purple-500/5 to-indigo-500/5">
        <h3 className="text-sm font-semibold text-white mb-3">💡 Getting Started</h3>
        <ul className="text-sm text-neutral-400 space-y-2">
          <li>→ Set your <span className="text-purple-300 cursor-pointer" onClick={() => navigate('budget')}>budget</span> categories first</li>
          <li>→ Add your <span className="text-blue-300 cursor-pointer" onClick={() => navigate('accommodation')}>accommodation</span> details</li>
          <li>→ Log <span className="text-orange-300 cursor-pointer" onClick={() => navigate('transport')}>transport</span> segments (flights, trains)</li>
          <li>→ Track <span className="text-emerald-300 cursor-pointer" onClick={() => navigate('expenses')}>expenses</span> as you travel</li>
        </ul>
      </div>
    </div>
  );
}
