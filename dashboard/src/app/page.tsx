'use client';

import { useEffect, useState } from 'react';
import { supabase, DailyDashboardRow, ActivityRow, WeightTrackerRow, RawWeightEntry } from '@/lib/supabase';
import DailyOverview from '@/components/DailyOverview';
import StepsChart from '@/components/StepsChart';
import HeartRateChart from '@/components/HeartRateChart';
import SleepChart from '@/components/SleepChart';
import StressChart from '@/components/StressChart';
import WeightChart from '@/components/WeightChart';
import ActivityLog from '@/components/ActivityLog';
import WeightEntryForm from '@/components/WeightEntryForm';
import CalorieCalculator from '@/components/CalorieCalculator';

const DAYS = 30;

export default function Dashboard() {
  const [daily, setDaily]           = useState<DailyDashboardRow[]>([]);
  const [weight, setWeight]         = useState<WeightTrackerRow[]>([]);
  const [rawWeight, setRawWeight]   = useState<RawWeightEntry[]>([]);
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    const [dailyRes, weightRes, actRes, rawWeightRes] = await Promise.all([
      supabase
        .from('mart_daily_dashboard')
        .select('*')
        .order('metric_date', { ascending: false })
        .limit(DAYS),
      supabase
        .from('mart_weight_tracker')
        .select('*')
        .order('weigh_date', { ascending: false })
        .limit(90),
      supabase
        .from('mart_activity_summary')
        .select('*')
        .order('activity_date', { ascending: false })
        .limit(50),
      supabase
        .from('weight_entries')
        .select('weigh_date, weight_lbs')
        .order('weigh_date', { ascending: true })
        .limit(365),
    ]);

    if (dailyRes.error || weightRes.error || actRes.error) {
      const msg = dailyRes.error?.message || weightRes.error?.message || actRes.error?.message || 'Unknown error';
      setError(msg);
    } else {
      setDaily(dailyRes.data as DailyDashboardRow[]);
      setWeight(weightRes.data as WeightTrackerRow[]);
      setActivities(actRes.data as ActivityRow[]);
    }
    // Raw weight is best-effort — update regardless of other errors
    if (!rawWeightRes.error && rawWeightRes.data) {
      setRawWeight(rawWeightRes.data as RawWeightEntry[]);
    }

    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const latest = daily[0] ?? null;
  // Chart data needs oldest-first
  const dailyAsc = [...daily].reverse();
  const weightAsc = [...weight].reverse();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Olivia's Snazzy Health Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Powered by Garmin Connect</p>
        </div>
        <button
          onClick={loadData}
          className="text-xs text-slate-400 hover:text-slate-200 border border-surface-border rounded px-3 py-1.5 transition-colors"
        >
          Refresh
        </button>
      </div>

      {loading && (
        <div className="text-slate-500 text-sm">Loading…</div>
      )}

      {error && (
        <div className="bg-red-950 border border-red-800 text-red-300 rounded-lg p-4 text-sm">
          Failed to load data: {error}
        </div>
      )}

      {/* Always visible — don't depend on dbt marts */}
      <section>
        <CalorieCalculator today={latest} onSaved={loadData} />
      </section>

      {!loading && (
        <section>
          <WeightChart data={weightAsc} rawEntries={rawWeight} />
        </section>
      )}

      {!loading && !error && (
        <>
          {/* Today's overview cards */}
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">
              {latest ? latest.metric_date : 'No data yet'}
            </h2>
            <DailyOverview row={latest} onSaved={loadData} />
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <StepsChart     data={dailyAsc} />
            <HeartRateChart data={dailyAsc} />
            <SleepChart     data={dailyAsc} />
            <StressChart    data={dailyAsc} />
          </section>

          {/* Activity log + weight entry side by side */}
          <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <ActivityLog activities={activities} />
            </div>
            <div>
              <WeightEntryForm onSaved={loadData} />
            </div>
          </section>
        </>
      )}
    </main>
  );
}
