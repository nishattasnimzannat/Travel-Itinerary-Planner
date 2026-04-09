import { Plane, Menu, X } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';

const links = [
  { to: '/trips', label: 'My Trips' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className={`border-b border-white/10 sticky top-0 z-50 ${isHome ? 'bg-black/50 backdrop-blur-md' : 'bg-neutral-900'}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <NavLink to="/" className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl">
            <Plane className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight text-white">Travel Buddy</span>
        </NavLink>

        {/* Desktop links */}
        <div className="hidden md:flex gap-6 text-sm text-neutral-400 items-center">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                isActive ? 'text-white font-medium' : 'hover:text-white transition-colors'
              }
            >
              {l.label}
            </NavLink>
          ))}
          <NavLink
            to="/trips"
            className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-neutral-200 transition-colors"
          >
            + New Trip
          </NavLink>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-neutral-900 px-6 py-4 flex flex-col gap-3">
          {links.map(l => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpen(false)}
              className={({ isActive }) => isActive ? 'text-white font-medium' : 'text-neutral-400 hover:text-white'}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}
