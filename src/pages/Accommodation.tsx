import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { store, uid, type LocalAccommodation } from '../store';
import { Plus, Building2, Calendar, Trash2, DollarSign } from 'lucide-react';

const BLANK: Omit<LocalAccommodation, 'id' | 'tripId'> = {
  name: '', address: '', checkIn: '', checkOut: '', pricePerNight: 0, currency: 'USD',
};

export default function Accommodation() {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<LocalAccommodation[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(BLANK);

  useEffect(() => { setItems(store.getAccommodations(id!)); }, [id]);

  const add = () => {
    if (!form.name) return;
    const updated = [...items, { ...form, id: uid(), tripId: id! }];
    store.saveAccommodations(id!, updated);
    setItems(updated);
    setForm(BLANK);
    setShowForm(false);
  };

  const remove = (accId: string) => {
    const updated = items.filter(a => a.id !== accId);
    store.saveAccommodations(id!, updated);
    setItems(updated);
  };

  const nights = (a: LocalAccommodation) => {
    if (!a.checkIn || !a.checkOut) return 0;
    return Math.round((new Date(a.checkOut).getTime() - new Date(a.checkIn).getTime()) / 86400000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Accommodation</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-neutral-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
          <Building2 className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-500">No accommodation added yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(a => (
            <div key={a.id} className="group p-5 rounded-2xl border border-white/10 bg-white/5 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-white mb-1">{a.name}</h3>
                {a.address && <p className="text-sm text-neutral-400 mb-2">{a.address}</p>}
                <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
                  {a.checkIn && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(a.checkIn).toLocaleDateString()} → {new Date(a.checkOut).toLocaleDateString()}
                      <span className="ml-1 bg-white/10 px-1.5 py-0.5 rounded-full">{nights(a)}n</span>
                    </span>
                  )}
                  {a.pricePerNight > 0 && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {a.pricePerNight} {a.currency}/night
                      {nights(a) > 0 && ` · Total: ${(a.pricePerNight * nights(a)).toLocaleString()} ${a.currency}`}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => remove(a.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-500 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-6 text-white">Add Accommodation</h2>
            <div className="space-y-4">
              {[
                { key: 'name', label: 'Hotel / Property Name', placeholder: 'e.g. Le Grand Hôtel', type: 'text' },
                { key: 'address', label: 'Address', placeholder: 'e.g. 1 Rue de Rivoli, Paris', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500 transition-colors"
                    value={(form as Record<string, string | number>)[f.key] as string}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Check-in</label>
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    value={form.checkIn} onChange={e => setForm({ ...form, checkIn: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Check-out</label>
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    value={form.checkOut} onChange={e => setForm({ ...form, checkOut: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Price/Night</label>
                  <input type="number" min="0" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    value={form.pricePerNight} onChange={e => setForm({ ...form, pricePerNight: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Currency</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })}>
                    {['USD', 'EUR', 'GBP', 'JPY', 'BDT', 'CAD', 'AUD'].map(c => (
                      <option key={c} value={c} className="bg-neutral-900">{c}</option>
                    ))}
                  </select>
                </div>
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
