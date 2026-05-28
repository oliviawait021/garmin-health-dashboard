'use client';

import { useEffect, useState } from 'react';
import { supabase, CycleEntry } from '@/lib/supabase';
import { format, parseISO, differenceInDays } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';

const FLOW_LEVELS = ['light', 'medium', 'heavy'];
const FLOW_COLORS: Record<string, string> = {
  light:  'bg-pink-900 text-pink-300',
  medium: 'bg-pink-700 text-pink-100',
  heavy:  'bg-rose-700 text-rose-100',
};

function StatCard({ label, value, sub }: { label: string; value: string | null; sub?: string }) {
  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4 flex flex-col gap-1">
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      {value ? (
        <span className="text-2xl font-semibold tabular-nums text-slate-200">{value}</span>
      ) : (
        <span className="text-slate-600 text-sm">—</span>
      )}
      {sub && <span className="text-xs text-slate-500">{sub}</span>}
    </div>
  );
}

export default function CyclePage() {
  const [cycles, setCycles]     = useState<CycleEntry[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [startDate,  setStartDate]  = useState('');
  const [endDate,    setEndDate]    = useState('');
  const [flowLevel,  setFlowLevel]  = useState('medium');
  const [symptoms,   setSymptoms]   = useState('');
  const [notes,      setNotes]      = useState('');

  async function loadData() {
    setLoading(true);
    const res = await supabase
      .from('cycle_entries')
      .select('*')
      .order('period_start', { ascending: false })
      .limit(24);
    if (res.error) setError(res.error.message);
    else setCycles(res.data as CycleEntry[]);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/cycle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ period_start: startDate, period_end: endDate || null, flow_level: flowLevel, symptoms, notes }),
    });
    setSaving(false);
    setShowForm(false);
    setStartDate(''); setEndDate(''); setSymptoms(''); setNotes('');
    loadData();
  }

  async function handleDelete(id: number) {
    await fetch('/api/cycle', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    loadData();
  }

  // Derived stats from most recent entry
  const latest   = cycles[0] ?? null;
  const today    = new Date();
  const cycleDay = latest
    ? differenceInDays(today, parseISO(latest.period_start)) + 1
    : null;
  const daysUntilNext = latest?.predicted_next_period
    ? differenceInDays(parseISO(latest.predicted_next_period), today)
    : null;

  // Chart data — cycle lengths over time (oldest first)
  const chartData = [...cycles]
    .filter(c => c.cycle_length_days)
    .reverse()
    .map(c => ({
      label: format(parseISO(c.period_start), 'MMM yy'),
      days:  c.cycle_length_days,
    }));

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Cycle Tracker</h1>
        <div className="flex gap-2">
          <button
            onClick={loadData}
            className="text-xs text-slate-400 hover:text-slate-200 border border-[#2a2d3a] rounded px-3 py-1.5 transition-colors"
          >
            Refresh
          </button>
          <button
            onClick={() => setShowForm(s => !s)}
            className="text-xs bg-pink-900 hover:bg-pink-800 text-pink-200 rounded px-3 py-1.5 transition-colors"
          >
            {showForm ? 'Cancel' : '+ Log Period'}
          </button>
        </div>
      </div>

      {/* Log form */}
      {showForm && (
        <form onSubmit={handleSave} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-300">Log Period</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">Start Date *</label>
              <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)}
                className="bg-[#0f1117] border border-[#2a2d3a] rounded px-3 py-2 text-sm text-slate-200 [color-scheme:dark]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
                className="bg-[#0f1117] border border-[#2a2d3a] rounded px-3 py-2 text-sm text-slate-200 [color-scheme:dark]" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Flow Level</label>
            <div className="flex gap-2">
              {FLOW_LEVELS.map(f => (
                <button key={f} type="button" onClick={() => setFlowLevel(f)}
                  className={`px-3 py-1 rounded text-xs capitalize transition-colors ${
                    flowLevel === f ? FLOW_COLORS[f] : 'bg-[#0f1117] border border-[#2a2d3a] text-slate-400'
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Symptoms</label>
            <input type="text" value={symptoms} onChange={e => setSymptoms(e.target.value)}
              placeholder="cramps, bloating, headache…"
              className="bg-[#0f1117] border border-[#2a2d3a] rounded px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">Notes</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)}
              className="bg-[#0f1117] border border-[#2a2d3a] rounded px-3 py-2 text-sm text-slate-200" />
          </div>
          <button type="submit" disabled={saving}
            className="bg-pink-800 hover:bg-pink-700 disabled:opacity-50 text-pink-100 text-sm px-4 py-2 rounded transition-colors">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </form>
      )}

      {loading && <div className="text-slate-500 text-sm">Loading…</div>}
      {error && (
        <div className="bg-red-950 border border-red-800 text-red-300 rounded-lg p-4 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label="Cycle Day"
              value={cycleDay != null ? `Day ${cycleDay}` : null}
              sub={latest ? `since ${format(parseISO(latest.period_start), 'MMM d')}` : undefined}
            />
            <StatCard
              label="Next Period"
              value={
                daysUntilNext != null
                  ? daysUntilNext === 0 ? 'Today'
                  : daysUntilNext < 0  ? `${Math.abs(daysUntilNext)}d late`
                  : `in ${daysUntilNext}d`
                  : null
              }
              sub={latest?.predicted_next_period
                ? format(parseISO(latest.predicted_next_period), 'MMM d')
                : undefined}
            />
            <StatCard
              label="Avg Cycle"
              value={latest?.avg_cycle_length ? `${latest.avg_cycle_length} days` : null}
              sub={latest ? `${latest.min_cycle_length}–${latest.max_cycle_length} day range` : undefined}
            />
            <StatCard
              label="Avg Period"
              value={latest?.avg_period_length ? `${latest.avg_period_length} days` : null}
            />
          </div>

          {/* Cycle length chart */}
          {chartData.length > 1 && (
            <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                Cycle Length History
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
                  <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[20, 35]} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} unit="d" />
                  <Tooltip
                    contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8 }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(v: number) => [`${v} days`, 'Cycle length']}
                  />
                  {latest?.avg_cycle_length && (
                    <ReferenceLine y={latest.avg_cycle_length} stroke="#f472b6" strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: 'avg', fill: '#f472b6', fontSize: 10 }} />
                  )}
                  <Bar dataKey="days" fill="#be185d" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* History list */}
          <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-[#2a2d3a]">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">History</h3>
            </div>
            {cycles.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500 text-center">
                No periods logged yet — click <strong className="text-pink-400">+ Log Period</strong> to get started.
              </p>
            ) : (
              <div className="divide-y divide-[#2a2d3a]">
                {cycles.map(c => (
                  <div key={c.id} className="px-5 py-3 flex items-start justify-between gap-4">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-slate-200">
                          {format(parseISO(c.period_start), 'MMM d, yyyy')}
                        </span>
                        {c.period_end && (
                          <span className="text-xs text-slate-500">
                            → {format(parseISO(c.period_end), 'MMM d')}
                            {c.period_length_days && ` (${c.period_length_days}d)`}
                          </span>
                        )}
                        {c.flow_level && (
                          <span className={`text-xs px-2 py-0.5 rounded capitalize ${FLOW_COLORS[c.flow_level] ?? 'bg-[#2a2d3a] text-slate-400'}`}>
                            {c.flow_level}
                          </span>
                        )}
                        {c.cycle_length_days && (
                          <span className="text-xs text-slate-500">{c.cycle_length_days}d cycle</span>
                        )}
                      </div>
                      {c.symptoms && (
                        <p className="text-xs text-slate-500">{c.symptoms}</p>
                      )}
                      {c.notes && (
                        <p className="text-xs text-slate-600 italic">{c.notes}</p>
                      )}
                    </div>
                    <button onClick={() => handleDelete(c.id)}
                      className="text-slate-600 hover:text-red-400 text-xs shrink-0 transition-colors">
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}
