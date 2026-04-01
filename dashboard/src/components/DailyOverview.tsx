'use client';

import { useState } from 'react';
import { DailyDashboardRow } from '@/lib/supabase';

type Status = 'good' | 'moderate' | 'attention' | 'neutral';

const statusColor: Record<Status, string> = {
  good:      'text-emerald-400',
  moderate:  'text-yellow-400',
  attention: 'text-red-400',
  neutral:   'text-slate-200',
};

const statusBarColor: Record<Status, string> = {
  good:      'bg-emerald-500',
  moderate:  'bg-yellow-500',
  attention: 'bg-red-500',
  neutral:   'bg-slate-600',
};

function pct(val: number, max: number) {
  return Math.min(100, Math.round((val / max) * 100));
}

function sleepStatus(score: number | null): Status {
  if (!score) return 'neutral';
  return score >= 80 ? 'good' : score >= 60 ? 'moderate' : 'attention';
}
function hrStatus(hr: number | null): Status {
  if (!hr) return 'neutral';
  return hr <= 65 ? 'good' : hr <= 80 ? 'moderate' : 'attention';
}
function stressStatus(s: number | null): Status {
  if (!s) return 'neutral';
  return s <= 25 ? 'good' : s <= 50 ? 'moderate' : 'attention';
}
function stepsStatus(steps: number | null, goal: number | null): Status {
  if (!steps || !goal) return 'neutral';
  const p = steps / goal;
  return p >= 1 ? 'good' : p >= 0.7 ? 'moderate' : 'attention';
}
function batteryStatus(end: number | null): Status {
  if (end == null) return 'neutral';
  return end >= 60 ? 'good' : end >= 30 ? 'moderate' : 'attention';
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

interface CardProps {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

function Card({ label, children, action }: CardProps) {
  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4 flex flex-col gap-2 min-h-[120px]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
        {action}
      </div>
      {children}
    </div>
  );
}

function ProgressBar({ value, status }: { value: number; status: Status }) {
  return (
    <div className="w-full bg-[#12141e] rounded-full h-1.5 mt-1">
      <div
        className={`h-1.5 rounded-full transition-all ${statusBarColor[status]}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

interface Props {
  row: DailyDashboardRow | null;
  onSaved: () => void;
}

export default function DailyOverview({ row, onSaved }: Props) {
  const [editing,   setEditing]   = useState(false);
  const [inputVal,  setInputVal]  = useState('');
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  async function saveCalories() {
    const cals = parseInt(inputVal, 10);
    if (isNaN(cals) || cals < 0) return;
    setSaving(true);
    setSaveError(null);
    const res = await fetch('/api/calories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_date: todayISO(), active_calories: cals }),
    });
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      setInputVal('');
      onSaved();
    } else {
      const data = await res.json();
      setSaveError(data.error ?? 'Failed to save');
    }
  }

  if (!row) {
    return (
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-4 min-h-[120px] flex items-center justify-center">
            <span className="text-xs text-slate-700">Waiting for Garmin sync</span>
          </div>
        ))}
      </div>
    );
  }

  const sleepHours = row.total_sleep_hours
    ? `${Math.floor(row.total_sleep_hours)}h ${Math.round((row.total_sleep_hours % 1) * 60)}m`
    : null;

  const stepsPct   = row.total_steps && row.step_goal ? pct(row.total_steps, row.step_goal) : 0;
  const stepsStat  = stepsStatus(row.total_steps, row.step_goal);
  const hrStat     = hrStatus(row.resting_heart_rate);
  const sleepStat  = sleepStatus(row.sleep_score);
  const stressStat = stressStatus(row.avg_stress);
  const batStat    = batteryStatus(row.body_battery_end);

  const intensityMins = row.intensity_minutes_weighted != null
    ? Math.round(row.intensity_minutes_weighted)
    : null;

  return (
    <div className="grid grid-cols-3 gap-4">

      {/* 1 — Steps */}
      <Card label="Steps">
        <div>
          <span className={`text-3xl font-bold font-mono ${statusColor[stepsStat]}`}>
            {row.total_steps?.toLocaleString() ?? '—'}
          </span>
        </div>
        {row.step_goal && (
          <>
            <ProgressBar value={stepsPct} status={stepsStat} />
            <span className="text-xs text-slate-600">
              {stepsPct}% of {row.step_goal.toLocaleString()} goal
            </span>
          </>
        )}
      </Card>

      {/* 2 — Sleep */}
      <Card label="Sleep">
        <span className={`text-3xl font-bold font-mono ${statusColor[sleepStat]}`}>
          {sleepHours ?? '—'}
        </span>
        <div className="flex gap-3 text-xs text-slate-500">
          {row.sleep_score && <span>Score {row.sleep_score}</span>}
          {row.sleep_quality && <span className="capitalize">{row.sleep_quality.replace(/_/g, ' ')}</span>}
        </div>
        {row.sleep_score && (
          <ProgressBar value={row.sleep_score} status={sleepStat} />
        )}
      </Card>

      {/* 3 — Resting HR */}
      <Card label="Resting HR">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold font-mono ${statusColor[hrStat]}`}>
            {row.resting_heart_rate ?? '—'}
          </span>
          {row.resting_heart_rate && <span className="text-slate-500 text-sm">bpm</span>}
        </div>
        <div className="flex gap-3 text-xs text-slate-500 mt-auto">
          {row.avg_rhr_7d  && <span>7d avg {row.avg_rhr_7d}</span>}
          {row.min_heart_rate && row.max_heart_rate && (
            <span>{row.min_heart_rate}–{row.max_heart_rate} range</span>
          )}
        </div>
      </Card>

      {/* 4 — Stress */}
      <Card label="Stress">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold font-mono ${statusColor[stressStat]}`}>
            {row.avg_stress ?? '—'}
          </span>
          {row.avg_stress && <span className="text-slate-500 text-sm">avg</span>}
        </div>
        {row.avg_stress && (
          <ProgressBar value={pct(row.avg_stress, 100)} status={stressStat} />
        )}
        {row.max_stress && (
          <span className="text-xs text-slate-600">Max {row.max_stress}</span>
        )}
      </Card>

      {/* 5 — Active Calories (editable) */}
      <Card
        label="Active Calories"
        action={!editing ? (
          <button
            onClick={() => {
              setInputVal(row.active_calories != null ? String(row.active_calories) : '');
              setSaveError(null);
              setEditing(true);
            }}
            className="text-slate-600 hover:text-slate-400 transition-colors"
            title="Edit active calories"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        ) : undefined}
      >
        {editing ? (
          <div className="flex flex-col gap-1.5">
            <input
              type="number"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="e.g. 450"
              className="w-full bg-[#12141e] border border-[#2a2d3a] rounded px-2 py-1 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
              autoFocus
            />
            {saveError && <p className="text-xs text-red-400">{saveError}</p>}
            <div className="flex gap-1.5">
              <button onClick={saveCalories} disabled={saving}
                className="flex-1 px-2 py-1 rounded text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors">
                {saving ? '…' : 'Save'}
              </button>
              <button onClick={() => { setEditing(false); setSaveError(null); }}
                className="flex-1 px-2 py-1 rounded text-xs font-medium bg-[#12141e] border border-[#2a2d3a] text-slate-400 hover:text-slate-200 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold font-mono text-slate-200">
                {row.active_calories?.toLocaleString() ?? '—'}
              </span>
              {row.active_calories != null && <span className="text-slate-500 text-sm">kcal</span>}
            </div>
            {row.total_calories && (
              <span className="text-xs text-slate-600">Total {row.total_calories.toLocaleString()} kcal</span>
            )}
          </>
        )}
      </Card>

      {/* 6 — Weight */}
      <Card label="Weight">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold font-mono text-slate-200">
            {row.weight_lbs ?? '—'}
          </span>
          {row.weight_lbs && <span className="text-slate-500 text-sm">lbs</span>}
        </div>
        {row.weight_notes && (
          <span className="text-xs text-slate-600 truncate">{row.weight_notes}</span>
        )}
      </Card>

      {/* 7 — Body Battery */}
      <Card label="Body Battery">
        <div className="flex items-baseline gap-2">
          {row.body_battery_end != null ? (
            <>
              <span className={`text-3xl font-bold font-mono ${statusColor[batStat]}`}>
                {row.body_battery_end}
              </span>
              <span className="text-slate-500 text-sm">/ 100</span>
            </>
          ) : (
            <span className="text-3xl font-bold font-mono text-slate-200">—</span>
          )}
        </div>
        {row.body_battery_end != null && (
          <ProgressBar value={row.body_battery_end} status={batStat} />
        )}
        {row.body_battery_start != null && row.body_battery_end != null && (
          <span className="text-xs text-slate-600">
            Started at {row.body_battery_start} · {row.body_battery_end > row.body_battery_start ? '↑' : '↓'} {Math.abs(row.body_battery_end - row.body_battery_start)} pts
          </span>
        )}
      </Card>

      {/* 8 — Distance */}
      <Card label="Distance">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold font-mono text-slate-200">
            {row.total_distance_miles?.toFixed(2) ?? '—'}
          </span>
          {row.total_distance_miles && <span className="text-slate-500 text-sm">mi</span>}
        </div>
        {row.floors_climbed != null && (
          <span className="text-xs text-slate-600">{row.floors_climbed} floors climbed</span>
        )}
      </Card>

      {/* 9 — Intensity */}
      <Card label="Intensity Mins">
        <div className="flex items-baseline gap-1">
          <span className={`text-3xl font-bold font-mono ${intensityMins && intensityMins >= 150/7 ? 'text-emerald-400' : 'text-slate-200'}`}>
            {intensityMins ?? '—'}
          </span>
          {intensityMins != null && <span className="text-slate-500 text-sm">min</span>}
        </div>
        {row.avg_spo2 && (
          <span className="text-xs text-slate-600">SpO₂ {row.avg_spo2}%</span>
        )}
      </Card>

    </div>
  );
}
