'use client';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DailyDashboardRow } from '@/lib/supabase';

interface Props { data: DailyDashboardRow[]; }

export default function CaloriesChart({ data }: Props) {
  const chartData = data.map(d => ({
    date:    format(parseISO(d.metric_date), 'MMM d'),
    active:  d.active_calories,
    total:   d.total_calories,
  }));

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Daily Calories
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(v: number, name: string) => [
              `${v?.toLocaleString()} kcal`,
              name === 'active' ? 'Active' : 'Total',
            ]}
          />
          <Legend
            formatter={(value) => value === 'active' ? 'Active' : 'Total'}
            wrapperStyle={{ fontSize: 11, color: '#64748b' }}
          />
          <Bar dataKey="total"  fill="#334155" radius={[3, 3, 0, 0]} />
          <Bar dataKey="active" fill="#f97316" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
