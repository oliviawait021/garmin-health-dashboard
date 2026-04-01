'use client';

import { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { WeightTrackerRow } from '@/lib/supabase';

interface Props { data: WeightTrackerRow[]; }

export default function WeightChart({ data }: Props) {
  const [goalWeight, setGoalWeight] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('goal_weight');
    if (saved) setGoalWeight(saved);
  }, []);

  function handleGoalChange(val: string) {
    setGoalWeight(val);
    if (val) localStorage.setItem('goal_weight', val);
    else localStorage.removeItem('goal_weight');
  }

  const chartData = data.map(d => ({
    date:   format(parseISO(d.weigh_date), 'MMM d'),
    weight: d.weight_lbs,
    avg7d:  d.weight_7d_avg,
  }));

  if (chartData.length === 0) {
    return (
      <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Weight</h3>
        <p className="text-slate-600 text-sm">No weight entries yet. Add one below.</p>
      </div>
    );
  }

  const weights    = chartData.map(d => d.weight).filter(Boolean) as number[];
  const goalNum    = parseFloat(goalWeight);
  const startWeight = weights[0];
  const currentWeight = weights[weights.length - 1];
  const lostSoFar  = startWeight && currentWeight ? +(startWeight - currentWeight).toFixed(1) : null;
  const toGoal     = goalNum && currentWeight ? +(currentWeight - goalNum).toFixed(1) : null;

  const allValues  = goalNum ? [...weights, goalNum] : weights;
  const minW = Math.floor(Math.min(...allValues)) - 2;
  const maxW = Math.ceil(Math.max(...allValues)) + 2;

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Weight Progress
          </h3>
          {/* Progress stats */}
          {(lostSoFar !== null || toGoal !== null) && (
            <div className="flex gap-4 mt-1">
              {lostSoFar !== null && (
                <span className={`text-xs ${lostSoFar > 0 ? 'text-emerald-400' : lostSoFar < 0 ? 'text-red-400' : 'text-slate-500'}`}>
                  {lostSoFar > 0 ? `↓ ${lostSoFar} lbs lost` : lostSoFar < 0 ? `↑ ${Math.abs(lostSoFar)} lbs gained` : 'No change'}
                </span>
              )}
              {toGoal !== null && goalNum && (
                <span className={`text-xs ${toGoal <= 0 ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {toGoal <= 0
                    ? `Goal reached!`
                    : `${toGoal} lbs to goal (${goalNum} lbs)`}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Goal weight input */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 whitespace-nowrap">Goal weight</label>
          <input
            type="number"
            value={goalWeight}
            onChange={e => handleGoalChange(e.target.value)}
            placeholder="e.g. 140"
            className="w-24 bg-[#12141e] border border-[#2a2d3a] rounded-lg px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
          <span className="text-xs text-slate-500">lbs</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[minW, maxW]} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} unit=" lbs" />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(v: number, name: string) => [
              `${v} lbs`,
              name === 'weight' ? 'Weight' : '7-day avg',
            ]}
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
      </ResponsiveContainer>
    </div>
  );
}
