'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { WeightTrackerRow } from '@/lib/supabase';

interface Props { data: WeightTrackerRow[]; }

export default function WeightChart({ data }: Props) {
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

  const weights = chartData.map(d => d.weight).filter(Boolean) as number[];
  const minW = Math.floor(Math.min(...weights)) - 2;
  const maxW = Math.ceil(Math.max(...weights)) + 2;

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Weight Trend
      </h3>
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
          <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} connectNulls />
          <Line type="monotone" dataKey="avg7d"  stroke="#06b6d4" strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
