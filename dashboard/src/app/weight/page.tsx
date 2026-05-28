'use client';

import { useEffect, useState } from 'react';
import { supabase, WeightTrackerRow, RawWeightEntry } from '@/lib/supabase';
import WeightChart from '@/components/WeightChart';
import BodyCompositionPanel from '@/components/BodyCompositionPanel';
import WeightEntryForm from '@/components/WeightEntryForm';

export default function WeightPage() {
  const [weight, setWeight]       = useState<WeightTrackerRow[]>([]);
  const [rawWeight, setRawWeight] = useState<RawWeightEntry[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    const [weightRes, rawWeightRes] = await Promise.all([
      supabase
        .from('mart_weight_tracker')
        .select('*')
        .order('weigh_date', { ascending: false })
        .limit(90),
      supabase
        .from('weight_entries')
        .select('weigh_date, weight_lbs')
        .lte('weight_lbs', 155)
        .order('weigh_date', { ascending: true })
        .limit(365),
    ]);

    if (weightRes.error) {
      setError(weightRes.error.message);
    } else {
      setWeight(weightRes.data as WeightTrackerRow[]);
    }
    if (!rawWeightRes.error && rawWeightRes.data) {
      setRawWeight(rawWeightRes.data as RawWeightEntry[]);
    }

    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const weightAsc = [...weight].reverse();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Weight & Body Composition</h1>
        <button
          onClick={loadData}
          className="text-xs text-slate-400 hover:text-slate-200 border border-[#2a2d3a] rounded px-3 py-1.5 transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading && <div className="text-slate-500 text-sm">Loading…</div>}

      {error && (
        <div className="bg-red-950 border border-red-800 text-red-300 rounded-lg p-4 text-sm">
          Failed to load data: {error}
        </div>
      )}

      {!loading && (
        <>
          <section className="space-y-4">
            <WeightChart data={weightAsc} rawEntries={rawWeight} />
            <BodyCompositionPanel data={weightAsc} />
          </section>

          <section>
            <WeightEntryForm onSaved={loadData} />
          </section>
        </>
      )}
    </main>
  );
}
