'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DailyDashboardRow } from '@/lib/supabase';

interface Props { data: DailyDashboardRow[]; }

const GOAL = 10000;

export default function StepsChart({ data }: Props) {
  const chartData = data.map(d => ({
    date:  format(parseISO(d.metric_date), 'MMM d'),
    steps: d.total_steps ?? 0,
    goal:  d.step_goal ?? GOAL,
  }));

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Daily Steps
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
            itemStyle={{ color: '#22c55e' }}
            formatter={(v: number) => [v.toLocaleString(), 'Steps']}
          />
          <ReferenceLine y={GOAL} stroke="#eab308" strokeDasharray="4 4" label={{ value: 'Goal', fill: '#eab308', fontSize: 11, position: 'insideTopRight' }} />
          <Bar dataKey="steps" fill="#22c55e" radius={[3, 3, 0, 0]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
