'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DailyDashboardRow } from '@/lib/supabase';

interface Props { data: DailyDashboardRow[]; }

export default function HeartRateChart({ data }: Props) {
  const chartData = data.map(d => ({
    date:   format(parseISO(d.metric_date), 'MMM d'),
    rhr:    d.resting_heart_rate,
    avg7d:  d.avg_rhr_7d,
  }));

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Resting Heart Rate
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} unit=" bpm" />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(v: number, name: string) => [
              `${v} bpm`,
              name === 'rhr' ? 'Resting HR' : '7-day avg',
            ]}
          />
          <Line type="monotone" dataKey="rhr"   stroke="#ef4444" strokeWidth={2} dot={false} connectNulls />
          <Line type="monotone" dataKey="avg7d" stroke="#f97316" strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
