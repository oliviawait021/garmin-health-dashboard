'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { WeightTrackerRow } from '@/lib/supabase';

interface Props { data: WeightTrackerRow[] }

function Stat({ label, value, unit, sub, color = 'text-slate-200' }: {
  label: string; value: string | null; unit?: string; sub?: string; color?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      {value != null ? (
        <span className={`text-xl font-semibold tabular-nums ${color}`}>
          {value}
          {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
        </span>
      ) : (
        <span className="text-sm text-slate-600">—</span>
      )}
      {sub && <span className="text-xs text-slate-600">{sub}</span>}
    </div>
  );
}

function fatColor(pct: number | null) {
  if (pct == null) return 'text-slate-200';
  if (pct < 21) return 'text-emerald-400';
  if (pct < 25) return 'text-yellow-400';
  return 'text-red-400';
}

function changeColor(n: number | null) {
  if (n == null) return 'text-slate-200';
  if (n < 0) return 'text-emerald-400';
  if (n > 0) return 'text-red-400';
  return 'text-slate-400';
}

export default function BodyCompositionPanel({ data }: Props) {
  const latest        = data[data.length - 1] ?? null;
  const hasBodyComp   = data.some(d => d.body_fat_pct != null);
  const compRows      = data.filter(d => d.body_fat_pct != null);

  const chartData = compRows.map(d => ({
    date:    format(parseISO(d.weigh_date), 'MMM d'),
    fat_pct: d.body_fat_pct,
    lean:    d.lean_body_mass_lbs,
  }));

  const changeSign = latest?.change_vs_7d_ago != null
    ? (latest.change_vs_7d_ago > 0 ? '+' : '')
    : '';

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5 space-y-5">

      {/* ── Weight stats row (always shown) ── */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Weight Stats
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4">
          <Stat
            label="Current"
            value={latest?.weight_lbs != null ? latest.weight_lbs.toFixed(1) : null}
            unit="lbs"
          />
          <Stat
            label="7-Day Avg"
            value={latest?.weight_7d_avg != null ? latest.weight_7d_avg.toFixed(1) : null}
            unit="lbs"
          />
          <Stat
            label="vs 7 Days Ago"
            value={latest?.change_vs_7d_ago != null ? `${changeSign}${latest.change_vs_7d_ago.toFixed(1)}` : null}
            unit="lbs"
            color={changeColor(latest?.change_vs_7d_ago ?? null)}
          />
          <Stat
            label="30-Day Avg"
            value={latest?.weight_30d_avg != null ? latest.weight_30d_avg.toFixed(1) : null}
            unit="lbs"
          />
          <Stat
            label="All-Time Low"
            value={latest?.all_time_low != null ? latest.all_time_low.toFixed(1) : null}
            unit="lbs"
            color="text-emerald-400"
          />
          <Stat
            label="All-Time High"
            value={latest?.all_time_high != null ? latest.all_time_high.toFixed(1) : null}
            unit="lbs"
            color="text-red-400"
          />
        </div>
      </div>

      <div className="border-t border-[#2a2d3a]" />

      {/* ── Body composition (Renpho) ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Body Composition
          </h3>
          {latest?.composition_source && (
            <span className="text-xs text-slate-600">via {latest.composition_source}</span>
          )}
        </div>

        {!hasBodyComp ? (
          <div className="rounded-lg border border-dashed border-[#2a2d3a] p-5 text-center space-y-2">
            <p className="text-sm text-slate-400 font-medium">No Renpho data yet</p>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Export your Apple Health data from the iPhone Health app, then run:
            </p>
            <code className="text-xs text-sky-400 bg-[#0f1117] px-3 py-1.5 rounded block w-fit mx-auto">
              python import_apple_health.py export.zip
            </code>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 mb-5">
              <Stat
                label="Body Fat"
                value={latest?.body_fat_pct != null ? latest.body_fat_pct.toFixed(1) : null}
                unit="%"
                color={fatColor(latest?.body_fat_pct ?? null)}
              />
              <Stat
                label="BMI"
                value={latest?.bmi != null ? latest.bmi.toFixed(1) : null}
              />
              <Stat
                label="Lean Mass"
                value={latest?.lean_body_mass_lbs != null ? latest.lean_body_mass_lbs.toFixed(1) : null}
                unit="lbs"
                color="text-sky-400"
              />
            </div>

            {chartData.length > 1 && (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis yAxisId="fat" orientation="left" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} unit="%" domain={['auto', 'auto']} />
                  <YAxis yAxisId="lean" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} tickLine={false} axisLine={false} unit=" lbs" domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ background: '#1a1d27', border: '1px solid #2a2d3a', borderRadius: 8 }}
                    labelStyle={{ color: '#94a3b8' }}
                    formatter={(v: number, name: string) =>
                      name === 'fat_pct' ? [`${v}%`, 'Body Fat'] : [`${v} lbs`, 'Lean Mass']
                    }
                  />
                  <Line yAxisId="fat" type="monotone" dataKey="fat_pct" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2, fill: '#f59e0b' }} connectNulls />
                  <Line yAxisId="lean" type="monotone" dataKey="lean" stroke="#38bdf8" strokeWidth={2} dot={{ r: 2, fill: '#38bdf8' }} connectNulls />
                </LineChart>
              </ResponsiveContainer>
            )}
          </>
        )}
      </div>
    </div>
  );
}
