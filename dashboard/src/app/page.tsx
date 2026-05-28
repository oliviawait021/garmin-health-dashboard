'use client';

import { useEffect, useState } from 'react';
import { supabase, DailyDashboardRow } from '@/lib/supabase';
import DailyOverview from '@/components/DailyOverview';
import StepsChart from '@/components/StepsChart';
import HeartRateChart from '@/components/HeartRateChart';
import SleepChart from '@/components/SleepChart';
import CaloriesChart from '@/components/CaloriesChart';
import CalorieCalculator from '@/components/CalorieCalculator';

const DAYS = 90;

export default function DailyPage() {
  const [daily, setDaily]         = useState<DailyDashboardRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

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
      const rows = res.data as DailyDashboardRow[];
      setDaily(rows);
      // Default to latest date if nothing selected yet
      if (!selectedDate && rows.length > 0) {
        setSelectedDate(rows[0].metric_date);
      }
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  const selected = daily.find(d => d.metric_date === selectedDate) ?? daily[0] ?? null;
  const dailyAsc = [...daily].reverse();
  const availableDates = daily.map(d => d.metric_date);

  function stepDate(dir: 1 | -1) {
    const idx = availableDates.indexOf(selectedDate);
    const next = availableDates[idx + dir];
    if (next) setSelectedDate(next);
  }

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
          <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <StepsChart     data={dailyAsc} />
            <HeartRateChart data={dailyAsc} />
            <SleepChart     data={dailyAsc} />
            <CaloriesChart  data={dailyAsc} />
          </section>

          <section>
            {/* Date picker */}
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => stepDate(1)}
                disabled={availableDates.indexOf(selectedDate) >= availableDates.length - 1}
                className="px-2 py-1 rounded border border-[#2a2d3a] text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors"
              >
                ‹
              </button>
              <input
                type="date"
                value={selectedDate}
                min={availableDates[availableDates.length - 1]}
                max={availableDates[0]}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-[#1a1d27] border border-[#2a2d3a] rounded px-3 py-1 text-sm text-slate-200 [color-scheme:dark]"
              />
              <button
                onClick={() => stepDate(-1)}
                disabled={availableDates.indexOf(selectedDate) <= 0}
                className="px-2 py-1 rounded border border-[#2a2d3a] text-slate-400 hover:text-slate-200 disabled:opacity-30 transition-colors"
              >
                ›
              </button>
              {selectedDate !== availableDates[0] && (
                <button
                  onClick={() => setSelectedDate(availableDates[0])}
                  className="text-xs text-sky-400 hover:text-sky-300 ml-1"
                >
                  Today
                </button>
              )}
            </div>

            <DailyOverview row={selected} onSaved={loadData} />
          </section>

          <section>
            <CalorieCalculator today={selected} onSaved={loadData} />
          </section>
        </>
      )}
    </main>
  );
}
