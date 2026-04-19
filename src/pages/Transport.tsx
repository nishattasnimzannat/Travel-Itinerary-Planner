import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { store, uid, type LocalTransport, type TransportSegment } from '../store';
import { Plus, Plane, Train, Bus, Car, ArrowRight, Clock, Trash2, Pencil, Tag, PlusCircle, X } from 'lucide-react';

const TYPE_ICONS = {
  flight: Plane,
  train: Train,
  bus: Bus,
  car: Car,
};

const TYPE_COLORS: Record<string, string> = {
  flight: 'text-blue-400 bg-blue-400/10',
  train: 'text-emerald-400 bg-emerald-400/10',
  bus: 'text-orange-400 bg-orange-400/10',
  car: 'text-purple-400 bg-purple-400/10',
};

const BLANK_SEG: TransportSegment = { from: '', to: '', departure: '', arrival: '', carrier: '', number: '' };

export default function Transport() {
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<LocalTransport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<LocalTransport['type']>('flight');
  const [segments, setSegments] = useState<TransportSegment[]>([{ ...BLANK_SEG }]);
  const [bookingRef, setBookingRef] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => { setItems(store.getTransports(id!)); }, [id]);

  const save = () => {
    if (!segments[0].from || !segments[0].to) return;
    let updated: LocalTransport[];
    if (editingId) {
      updated = items.map(t =>
        t.id === editingId
          ? { ...t, type, segments: segments.filter(s => s.from && s.to), bookingReference: bookingRef || undefined }
          : t
      );
    } else {
      const newT: LocalTransport = {
        id: uid(), tripId: id!, type,
        segments: segments.filter(s => s.from && s.to),
        bookingReference: bookingRef || undefined,
      };
      updated = [...items, newT];
    }
    // Sort chronologically by first segment departure (FR-39)
    updated.sort((a, b) => {
      const da = a.segments[0]?.departure || '';
      const db = b.segments[0]?.departure || '';
      return da.localeCompare(db);
    });
    store.saveTransports(id!, updated);
    setItems(updated);
    resetForm();
  };

  const resetForm = () => {
    setSegments([{ ...BLANK_SEG }]);
    setBookingRef('');
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (t: LocalTransport) => {
    setType(t.type);
    setSegments(t.segments.map(s => ({ ...s })));
    setBookingRef(t.bookingReference || '');
    setEditingId(t.id);
    setShowForm(true);
  };

  const addSegment = () => {
    const last = segments[segments.length - 1];
    setSegments([...segments, { ...BLANK_SEG, from: last.to }]);
  };

  const removeSegment = (idx: number) => {
    if (segments.length <= 1) return;
    setSegments(segments.filter((_, i) => i !== idx));
  };

  const updateSegment = (idx: number, field: keyof TransportSegment, value: string) => {
    const updated = segments.map((s, i) => i === idx ? { ...s, [field]: value } : s);
    setSegments(updated);
  };

  const remove = (tId: string) => {
    const updated = items.filter(t => t.id !== tId);
    store.saveTransports(id!, updated);
    setItems(updated);
  };

  const formatTime = (dt: string) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Transport</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-neutral-200 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-dashed border-white/10">
          <Plane className="w-8 h-8 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-500">No transport segments added yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(t => {
            const Icon = TYPE_ICONS[t.type];
            const s = t.segments[0];
            return (
              <div key={t.id} className="group p-5 rounded-2xl border border-white/10 bg-white/5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`p-2.5 rounded-xl ${TYPE_COLORS[t.type]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 font-semibold text-white text-lg">
                        <span>{s.from}</span>
                        <ArrowRight className="w-4 h-4 text-neutral-500 shrink-0" />
                        <span>{s.to}</span>
                        {t.segments.length > 1 && (
                          <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full text-neutral-400">{t.segments.length} legs</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 text-xs text-neutral-500 mt-1">
                        {s.carrier && <span>{s.carrier} {s.number}</span>}
                        {s.departure && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(s.departure)} → {formatTime(s.arrival)}
                          </span>
                        )}
                        {t.bookingReference && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Ref: {t.bookingReference}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => startEdit(t)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-500 hover:text-purple-400 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => remove(t.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-neutral-500 hover:text-red-400 transition-all shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Multi-leg details */}
                {t.segments.length > 1 && (
                  <div className="mt-3 ml-14 space-y-1.5">
                    {t.segments.slice(1).map((seg, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-neutral-500">
                        <ArrowRight className="w-3 h-3" />
                        <span className="text-neutral-300">{seg.from} → {seg.to}</span>
                        {seg.carrier && <span>· {seg.carrier} {seg.number}</span>}
                        {seg.departure && <span>· {formatTime(seg.departure)}</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6 text-white">{editingId ? 'Edit Transport' : 'Add Transport'}</h2>
            <div className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="text-xs text-neutral-400 mb-2 block uppercase tracking-wide">Type</label>
                <div className="flex gap-2">
                  {(['flight', 'train', 'bus', 'car'] as const).map(t => {
                    const Icon = TYPE_ICONS[t];
                    return (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-colors text-xs capitalize ${
                          type === t ? 'border-purple-500 bg-purple-500/10 text-purple-300' : 'border-white/10 text-neutral-400 hover:border-white/20'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Segments (FR-38 multi-leg) */}
              {segments.map((seg, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-400 uppercase tracking-wide">Segment {idx + 1}</span>
                    {segments.length > 1 && (
                      <button onClick={() => removeSegment(idx)} className="text-neutral-500 hover:text-red-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'from' as const, label: 'From', placeholder: 'JFK' },
                      { key: 'to' as const, label: 'To', placeholder: 'LHR' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">{f.label}</label>
                        <input
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                          placeholder={f.placeholder}
                          value={seg[f.key]}
                          onChange={e => updateSegment(idx, f.key, e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Departure</label>
                      <input type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                        value={seg.departure} onChange={e => updateSegment(idx, 'departure', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Arrival</label>
                      <input type="datetime-local" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                        value={seg.arrival} onChange={e => updateSegment(idx, 'arrival', e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Carrier</label>
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                        placeholder="e.g. British Airways" value={seg.carrier} onChange={e => updateSegment(idx, 'carrier', e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Number</label>
                      <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                        placeholder="BA178" value={seg.number} onChange={e => updateSegment(idx, 'number', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}

              {/* Add segment button (FR-38) */}
              <button
                onClick={addSegment}
                className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                <PlusCircle className="w-4 h-4" /> Add another segment (multi-leg)
              </button>

              {/* Booking reference (FR-37) */}
              <div>
                <label className="text-xs text-neutral-400 mb-1.5 block uppercase tracking-wide">Booking Reference</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-neutral-500 focus:outline-none focus:border-purple-500"
                  placeholder="e.g. ABC123" value={bookingRef} onChange={e => setBookingRef(e.target.value)} />
              </div>

              <div className="flex gap-3 mt-2">
                <button onClick={resetForm} className="flex-1 px-4 py-2.5 border border-white/10 rounded-full text-neutral-400 hover:text-white transition-colors">Cancel</button>
                <button onClick={save} className="flex-1 px-4 py-2.5 bg-white text-black font-medium rounded-full hover:bg-neutral-200 transition-colors">{editingId ? 'Save' : 'Add'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
