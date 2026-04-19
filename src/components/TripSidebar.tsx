import { NavLink, useParams } from 'react-router-dom';
import { Calendar, Wallet, Building2, Plane, Receipt, ArrowRightLeft } from 'lucide-react';

const tabs = [
  { to: '', label: 'Overview', icon: Calendar },
  { to: 'budget', label: 'Budget', icon: Wallet },
  { to: 'accommodation', label: 'Accommodation', icon: Building2 },
  { to: 'transport', label: 'Transport', icon: Plane },
  { to: 'expenses', label: 'Expenses', icon: Receipt },
  { to: 'currency', label: 'Currency', icon: ArrowRightLeft },
];

export default function TripSidebar() {
  const { id } = useParams<{ id: string }>();

  return (
    <aside className="w-full md:w-56 shrink-0">
      <nav className="flex md:flex-col gap-1">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to === '' ? `/trips/${id}` : `/trips/${id}/${to}`}
            end={to === ''}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors ${
                isActive
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
