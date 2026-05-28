'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { format, parseISO, subMonths, subYears } from 'date-fns';
import { WeightTrackerRow, RawWeightEntry } from '@/lib/supabase';

interface Props {
  data: WeightTrackerRow[];
  rawEntries: RawWeightEntry[];
}

type Period = '1M' | '3M' | '6M' | '1Y' | 'All';
const PERIODS: Period[] = ['1M', '3M', '6M', '1Y', 'All'];

function filterByPeriod(entries: RawWeightEntry[], period: Period): RawWeightEntry[] {
  if (period === 'All') return entries;
  const now = new Date();
  const cutoff =
    period === '1M' ? subMonths(now, 1) :
    period === '3M' ? subMonths(now, 3) :
    period === '6M' ? subMonths(now, 6) :
    subYears(now, 1);
  return entries.filter(e => parseISO(e.weigh_date) >= cutoff);
}

function compute7dAvg(entries: RawWeightEntry[]): { date: string; weight: number; avg7d: number | null }[] {
  // Compute rolling avg over all entries so window start isn't skewed
  return entries.map((e, i) => {
    const window = entries.slice(Math.max(0, i - 6), i + 1);
    const avg = window.reduce((sum, w) => sum + w.weight_lbs, 0) / window.length;
    return {
      date:   format(parseISO(e.weigh_date), 'MMM d'),
      weight: e.weight_lbs,
      avg7d:  Math.round(avg * 10) / 10,
    };
  });
}

export default function WeightChart({ data, rawEntries }: Props) {
  const [goalWeight, setGoalWeight] = useState('');
  const [period,     setPeriod]     = useState<Period>('All');

  useEffect(() => {
    const saved = localStorage.getItem('goal_weight');
    if (saved) setGoalWeight(saved);
  }, []);

  function handleGoalChange(val: string) {
    setGoalWeight(val);
    if (val) localStorage.setItem('goal_weight', val);
    else localStorage.removeItem('goal_weight');
  }

  const sourceEntries = rawEntries.length > 0 ? rawEntries : [];
  const filtered      = filterByPeriod(sourceEntries, period);

  const chartData = filtered.length > 0
    ? compute7dAvg(filtered)
    : data.map(d => ({
        date:   format(parseISO(d.weigh_date), 'MMM d'),
        weight: d.weight_lbs,
        avg7d:  d.weight_7d_avg,
      }));

  const noData = chartData.length === 0;

  const goalNum       = parseFloat(goalWeight);
  const startWeight   = chartData[0]?.weight;
  const currentWeight = chartData[chartData.length - 1]?.weight;
  const lostSoFar     = !noData && startWeight && currentWeight ? +(startWeight - currentWeight).toFixed(1) : null;
  const toGoal        = goalNum && currentWeight ? +(currentWeight - goalNum).toFixed(1) : null;

  const allValues = noData ? [0] : (goalNum ? [...chartData.map(d => d.weight), goalNum] : chartData.map(d => d.weight));
  const minW = Math.floor(Math.min(...allValues)) - 2;
  const maxW = Math.ceil(Math.max(...allValues)) + 2;

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Weight Progress
          </h3>
          <div className="flex gap-4 mt-1">
            {lostSoFar !== null && (
              <span className={`text-xs ${lostSoFar > 0 ? 'text-emerald-400' : lostSoFar < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                {lostSoFar > 0 ? `↓ ${lostSoFar} lbs lost` : lostSoFar < 0 ? `↑ ${Math.abs(lostSoFar)} lbs gained` : 'No change'}
                {period !== 'All' && ` (${period})`}
              </span>
            )}
            {toGoal !== null && goalNum && (
              <span className={`text-xs ${toGoal <= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {toGoal <= 0 ? 'Goal reached!' : `${toGoal} lbs to goal (${goalNum} lbs)`}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeline selector */}
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                  period === p
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Goal weight */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-500 whitespace-nowrap">Goal</label>
            <input
              type="number"
              value={goalWeight}
              onChange={e => handleGoalChange(e.target.value)}
              placeholder="143"
              className="w-20 bg-[#12141e] border border-[#2a2d3a] rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <span className="text-xs text-slate-500">lbs</span>
          </div>
        </div>
      </div>

      {noData && (
        <p className="text-slate-600 text-sm py-8 text-center">No entries in this time range.</p>
      )}

      {!noData && <ResponsiveContainer width="100%" height={240}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[minW, maxW]} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} unit=" lbs" />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(v: number, name: string) => [`${v} lbs`, name === 'weight' ? 'Weight' : '7-day avg']}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          {goalNum > 0 && (
            <ReferenceLine
              y={goalNum}
              stroke="#10b981"
              strokeDasharray="5 5"
              label={{ value: `Goal: ${goalNum}`, fill: '#10b981', fontSize: 11, position: 'insideTopRight' }}
            />
          )}
          <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} connectNulls />
          <Line type="monotone" dataKey="avg7d"  stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>}
    </div>
  );
}
