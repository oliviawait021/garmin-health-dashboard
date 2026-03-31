'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DailyDashboardRow } from '@/lib/supabase';

interface Props { data: DailyDashboardRow[]; }

function toHours(seconds: number | null) {
  return seconds ? parseFloat((seconds / 3600).toFixed(2)) : 0;
}

export default function SleepChart({ data }: Props) {
  const chartData = data.map(d => ({
    date:   format(parseISO(d.metric_date), 'MMM d'),
    deep:   toHours(d.deep_sleep_seconds),
    rem:    toHours(d.rem_sleep_seconds),
    light:  toHours(d.light_sleep_seconds),
    awake:  toHours(d.awake_seconds),
  }));

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Sleep Stages
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} unit="h" />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(v: number, name: string) => [`${v}h`, name.charAt(0).toUpperCase() + name.slice(1)]}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
          <Bar dataKey="deep"  stackId="sleep" fill="#6366f1" radius={[0, 0, 0, 0]} maxBarSize={24} />
          <Bar dataKey="rem"   stackId="sleep" fill="#a855f7" maxBarSize={24} />
          <Bar dataKey="light" stackId="sleep" fill="#3b82f6" maxBarSize={24} />
          <Bar dataKey="awake" stackId="sleep" fill="#374151" radius={[3, 3, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
