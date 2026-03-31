'use client';

import { useState } from 'react';
import { format } from 'date-fns';

interface Props { onSaved: () => void; }

export default function WeightEntryForm({ onSaved }: Props) {
  const [date,   setDate]   = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weight, setWeight] = useState('');
  const [notes,  setNotes]  = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weight) return;

    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/weight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weigh_date: date, weight_lbs: weight, notes }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Saved!' });
        setWeight('');
        setNotes('');
        onSaved();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Save failed.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error.' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Log Weight
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-[#0f1117] border border-[#2a2d3a] text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Weight (lbs)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            placeholder="e.g. 165.4"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            className="w-full bg-[#0f1117] border border-[#2a2d3a] text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 font-mono"
            required
          />
        </div>

        <div>
          <label className="block text-xs text-slate-500 mb-1">Notes (optional)</label>
          <input
            type="text"
            placeholder="Morning, post-workout, etc."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full bg-[#0f1117] border border-[#2a2d3a] text-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm rounded-lg px-4 py-2 transition-colors"
        >
          {saving ? 'Saving…' : 'Save Entry'}
        </button>

        {message && (
          <p className={`text-xs ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
            {message.text}
          </p>
        )}
      </form>
    </div>
  );
}
