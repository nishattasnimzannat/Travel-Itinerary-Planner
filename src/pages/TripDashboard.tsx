import { useEffect, useState } from 'react';
import { useParams, Outlet, Navigate } from 'react-router-dom';
import TripSidebar from '../components/TripSidebar';
import { store, type Trip } from '../store';
import { MapPin, Calendar } from 'lucide-react';

export default function TripDashboard() {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null | undefined>(undefined);

  useEffect(() => {
    const trips = store.getTrips();
    const found = trips.find(t => t.id === id) ?? null;
    setTrip(found);
  }, [id]);

  if (trip === undefined) return null; // loading
  if (trip === null) return <Navigate to="/trips" replace />;

  return (
    <div className="min-h-[calc(100vh-65px)] bg-neutral-950 text-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Trip header */}
        <div className="mb-8 p-6 rounded-3xl border border-white/10 bg-white/5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">{trip.name}</h1>
              <div className="flex items-center gap-4 flex-wrap text-sm text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" /> {trip.destination}
                </span>
                {trip.startDate && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {trip.endDate && ` → ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                  </span>
                )}
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded-full">
              Active Trip
            </span>
          </div>
        </div>

        {/* Layout: sidebar + content */}
        <div className="flex flex-col md:flex-row gap-6">
          <TripSidebar />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
