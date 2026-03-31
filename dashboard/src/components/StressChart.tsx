'use client';

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { DailyDashboardRow } from '@/lib/supabase';

interface Props { data: DailyDashboardRow[]; }

export default function StressChart({ data }: Props) {
  const chartData = data.map(d => ({
    date:   format(parseISO(d.metric_date), 'MMM d'),
    avg:    d.avg_stress,
    max:    d.max_stress,
  }));

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
        Daily Stress
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#eab308" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#eab308" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8 }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(v: number, name: string) => [v, name === 'avg' ? 'Avg stress' : 'Max stress']}
          />
          <ReferenceLine y={25} stroke="#22c55e" strokeDasharray="3 3" strokeOpacity={0.4} />
          <ReferenceLine y={50} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} />
          <Area type="monotone" dataKey="avg" stroke="#eab308" strokeWidth={2} fill="url(#stressGrad)" dot={false} connectNulls />
          <Area type="monotone" dataKey="max" stroke="#f97316" strokeWidth={1} fill="none" dot={false} connectNulls strokeDasharray="3 3" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
