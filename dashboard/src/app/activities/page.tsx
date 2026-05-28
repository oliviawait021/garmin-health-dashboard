'use client';

import { useEffect, useState } from 'react';
import { supabase, ActivityRow } from '@/lib/supabase';
import ActivityLog from '@/components/ActivityLog';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    const res = await supabase
      .from('mart_activity_summary')
      .select('*')
      .order('activity_date', { ascending: false })
      .limit(100);

    if (res.error) {
      setError(res.error.message);
    } else {
      setActivities(res.data as ActivityRow[]);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Activities</h1>
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

      {!loading && !error && (
        <ActivityLog activities={activities} />
      )}
    </main>
  );
}
