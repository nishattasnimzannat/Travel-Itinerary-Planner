import { Plane, Calendar, Wallet, Map as MapIcon, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-65px)] bg-neutral-950 text-white selection:bg-purple-500/30">
      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-medium mb-6">
            <Plane className="w-3 h-3" /> Your travel companion
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-gradient-to-br from-white to-neutral-500 bg-clip-text text-transparent">
            Plan your next adventure.
          </h1>
          <p className="text-xl text-neutral-400 mb-10 leading-relaxed">
            Organize trips, build itineraries, track budgets, and capture travel memories seamlessly in one elegant workspace.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => navigate('/trips')}
              className="px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-neutral-200 transition-colors flex items-center gap-2"
            >
              Start Planning <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/trips')}
              className="px-6 py-3 border border-white/20 font-medium rounded-full hover:bg-white/5 transition-colors text-white"
            >
              View My Trips
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-16 mb-24 flex-wrap">
          {[
            { value: 'Unlimited', label: 'Trips' },
            { value: '5+', label: 'Features' },
            { value: '∞', label: 'Memories' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-3xl font-bold text-white">{s.value}</div>
              <div className="text-neutral-500 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              onClick={() => navigate('/trips')}
              className="p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group cursor-pointer"
            >
              <div className="p-3 bg-black/50 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-neutral-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const features = [
  {
    title: 'Itineraries',
    desc: 'Build day-by-day plans with activities, places, and notes.',
    icon: <Calendar className="w-6 h-6 text-purple-400" />,
  },
  {
    title: 'Budget Tracking',
    desc: 'Cross-currency support to track planned vs spent costs.',
    icon: <Wallet className="w-6 h-6 text-emerald-400" />,
  },
  {
    title: 'Locations',
    desc: 'Pin accommodations, flights, and must-see attractions.',
    icon: <MapIcon className="w-6 h-6 text-blue-400" />,
  },
];
