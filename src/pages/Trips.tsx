import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Trash2, ArrowRight } from 'lucide-react';
import { store, uid, type Trip } from '../store';

export default function Trips() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', destination: '', startDate: '', endDate: '' });
  const navigate = useNavigate();

  useEffect(() => {
    setTrips(store.getTrips());
  }, []);

  const createTrip = () => {
    if (!form.name || !form.destination) return;
    const newTrip: Trip = { ...form, id: uid(), createdAt: new Date().toISOString() };
    const updated = [newTrip, ...trips];
    store.saveTrips(updated);
    setTrips(updated);
    setForm({ name: '', destination: '', startDate: '', endDate: '' });
    setShowForm(false);
    navigate(`/trips/${newTrip.id}`);
  };

  const deleteTrip = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = trips.filter(t => t.id !== id);
    store.saveTrips(updated);
    setTrips(updated);
  };

  const nights = (t: Trip) => {
    if (!t.startDate || !t.endDate) return null;
    const diff = (new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / 86400000;
    return Math.round(diff);
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">My Trips</h1>
            <p className="text-neutral-400 mt-1">{trips.length} trip{trips.length !== 1 ? 's' : ''} planned</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-medium rounded-full hover:bg-neutral-200 transition-colors"
          >
            <Plus className="w-4 h-4" /> New Trip
          </button>
        </div>

        {/* New Trip Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 w-full max-w-md">
              <h2 className="text-xl font-bold mb-6 text-white">Plan a New Trip</h2>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs text-neutral-400 mb-1.5 block font-medium uppercase tracking-wide">Trip Name</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. Europe Summer 2026"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1.5 block font-medium uppercase tracking-wide">Destination</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                    placeholder="e.g. Paris, France"
                    value={form.destination}
                    onChange={e => setForm({ ...form, destination: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-neutral-400 mb-1.5 block font-medium uppercase tracking-wide">Start Date</label>
                    <input
                      type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      value={form.startDate}
                      onChange={e => setForm({ ...form, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-400 mb-1.5 block font-medium uppercase tracking-wide">End Date</label>
                    <input
                      type="date"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                      value={form.endDate}
                      onChange={e => setForm({ ...form, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2.5 border border-white/10 rounded-full text-neutral-400 hover:text-white hover:border-white/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createTrip}
                    className="flex-1 px-4 py-2.5 bg-white text-black font-medium rounded-full hover:bg-neutral-200 transition-colors"
                  >
                    Create Trip
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trip Cards */}
        {trips.length === 0 ? (
          <div className="text-center py-32">
            <div className="text-6xl mb-4">✈️</div>
            <h3 className="text-xl font-semibold text-white mb-2">No trips yet</h3>
            <p className="text-neutral-400 mb-6">Start by creating your first adventure</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-white text-black font-medium rounded-full hover:bg-neutral-200 transition-colors"
            >
              Plan a Trip
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map(trip => (
              <div
                key={trip.id}
                onClick={() => navigate(`/trips/${trip.id}`)}
                className="group relative p-6 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer hover:border-white/20"
              >
                {/* Delete button */}
                <button
                  onClick={e => deleteTrip(trip.id, e)}
                  className="absolute top-4 right-4 p-2 opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-all rounded-lg hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 text-lg">
                    🌍
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                    {trip.name}
                  </h3>
                </div>

                <div className="flex flex-col gap-2 text-sm text-neutral-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    {trip.destination}
                  </div>
                  {trip.startDate && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {nights(trip) !== null && (
                        <span className="ml-auto text-xs bg-white/10 px-2 py-0.5 rounded-full">
                          {nights(trip)}n
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center text-xs text-purple-400 font-medium gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Open trip <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
