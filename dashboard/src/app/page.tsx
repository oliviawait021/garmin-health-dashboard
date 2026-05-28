'use client';

import { useEffect, useState } from 'react';
import { supabase, DailyDashboardRow } from '@/lib/supabase';
import DailyOverview from '@/components/DailyOverview';
import StepsChart from '@/components/StepsChart';
import HeartRateChart from '@/components/HeartRateChart';
import SleepChart from '@/components/SleepChart';
import StressChart from '@/components/StressChart';
import CalorieCalculator from '@/components/CalorieCalculator';

const DAYS = 30;

export default function DailyPage() {
  const [daily, setDaily]     = useState<DailyDashboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);

    const res = await supabase
      .from('mart_daily_dashboard')
      .select('*')
      .order('metric_date', { ascending: false })
      .limit(DAYS);

    if (res.error) {
      setError(res.error.message);
    } else {
      setDaily(res.data as DailyDashboardRow[]);
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const latest   = daily[0] ?? null;
  const dailyAsc = [...daily].reverse();

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Daily Overview</h1>
          <p className="text-slate-500 text-sm mt-0.5">Powered by Garmin Connect</p>
        </div>
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
        <>
          <section>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4">
              {latest ? latest.metric_date : 'No data yet'}
            </h2>
            <DailyOverview row={latest} onSaved={loadData} />
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <StepsChart     data={dailyAsc} />
            <HeartRateChart data={dailyAsc} />
            <SleepChart     data={dailyAsc} />
            <StressChart    data={dailyAsc} />
          </section>

          <section>
            <CalorieCalculator today={latest} onSaved={loadData} />
          </section>
        </>
      )}
    </main>
  );
}
