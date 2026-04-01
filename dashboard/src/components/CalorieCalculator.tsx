'use client';

import { useState, useEffect } from 'react';
import { differenceInDays, parseISO } from 'date-fns';
import { DailyDashboardRow } from '@/lib/supabase';

interface Props {
  today: DailyDashboardRow | null;
  onSaved: () => void;
}

// Profile constants
const HEIGHT_CM = (5 * 12 + 6) * 2.54; // 5'6"
const AGE = 24;

function calcBMR(weightLbs: number): number {
  const weightKg = weightLbs * 0.453592;
  // Mifflin-St Jeor, female
  return 10 * weightKg + 6.25 * HEIGHT_CM - 5 * AGE - 161;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function CalorieCalculator({ today, onSaved }: Props) {
  const [weight,       setWeight]       = useState('');
  const [logDate,      setLogDate]      = useState(todayISO());
  const [goalWeight,   setGoalWeight]   = useState('');
  const [goalDate,     setGoalDate]     = useState('');
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const [manualCals,   setManualCals]   = useState('');
  const [calSaving,    setCalSaving]    = useState(false);
  const [calSaved,     setCalSaved]     = useState(false);
  const [calError,     setCalError]     = useState<string | null>(null);

  // Load persisted goal settings
  useEffect(() => {
    const stored = localStorage.getItem('calorie_profile');
    if (stored) {
      try {
        const p = JSON.parse(stored);
        if (p.goalWeight) setGoalWeight(p.goalWeight);
        if (p.goalDate)   setGoalDate(p.goalDate);
      } catch {}
    }
  }, []);

  function saveGoal(gw: string, gd: string) {
    localStorage.setItem('calorie_profile', JSON.stringify({ goalWeight: gw, goalDate: gd }));
  }

  async function logWeight() {
    if (!wLbs || wLbs <= 0) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch('/api/weight', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weigh_date: logDate, weight_lbs: wLbs }),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      onSaved();
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error ?? 'Failed to save');
    }
  }

  const wLbs       = parseFloat(weight);
  const goalLbs    = parseFloat(goalWeight);
  const daysLeft   = goalDate ? differenceInDays(parseISO(goalDate), new Date()) : 0;
  const lbsToLose  = wLbs > 0 && goalLbs > 0 ? wLbs - goalLbs : 0;

  // 3,500 cal ≈ 1 lb of fat; cap deficit at 1,000/day (2 lbs/week)
  const rawDeficit    = lbsToLose > 0 && daysLeft > 0 ? Math.round((lbsToLose * 3500) / daysLeft) : 0;
  const deficit       = Math.min(rawDeficit, 1000);
  const deficitCapped = rawDeficit > 1000;

  const ready = wLbs > 0;

  // Industry standard: eat back 50% of tracked active calories to account for
  // wearable overestimation and avoid negating your deficit.
  const ACTIVE_CAL_FACTOR = 0.5;

  let bmr        = 0;
  let activeCals = 0;
  let toEat      = 0;

  async function logCalories() {
    const cals = parseInt(manualCals, 10);
    if (isNaN(cals) || cals < 0) return;
    setCalSaving(true);
    setCalError(null);
    setCalSaved(false);
    const res = await fetch('/api/calories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_date: todayISO(), active_calories: cals }),
    });
    setCalSaving(false);
    if (res.ok) {
      setCalSaved(true);
      onSaved();
      setTimeout(() => setCalSaved(false), 3000);
    } else {
      const data = await res.json();
      setCalError(data.error ?? 'Failed to save');
    }
  }

  if (ready) {
    bmr        = Math.round(calcBMR(wLbs));
    // manual entry overrides Garmin sync
    activeCals = manualCals !== '' ? parseInt(manualCals, 10) || 0 : today?.active_calories ?? 0;
    toEat      = Math.max(bmr + Math.round(activeCals * ACTIVE_CAL_FACTOR) - deficit, 1200);
  }

  const toEatColor = toEat > 0
    ? toEat < 1400 ? 'text-yellow-400' : 'text-emerald-400'
    : 'text-slate-500';

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5 space-y-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Daily Calorie Goal
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {/* Weight + date log */}
        <div className="col-span-2">
          <label className="block text-xs text-slate-500 mb-1">Log weight</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={weight}
              onChange={e => { setWeight(e.target.value); setSaved(false); }}
              placeholder="150 lbs"
              className="w-full bg-[#12141e] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <input
              type="date"
              value={logDate}
              onChange={e => { setLogDate(e.target.value); setSaved(false); }}
              className="bg-[#12141e] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={logWeight}
              disabled={!ready || saving}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors whitespace-nowrap"
            >
              {saving ? '…' : 'Log'}
            </button>
          </div>
          {saved && <p className="text-xs text-emerald-400 mt-1">Saved!</p>}
          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>

        {/* Goal weight */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Goal weight (lbs)</label>
          <input
            type="number"
            value={goalWeight}
            onChange={e => { setGoalWeight(e.target.value); saveGoal(e.target.value, goalDate); }}
            placeholder="143"
            className="w-full bg-[#12141e] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Goal date */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">By date</label>
          <input
            type="date"
            value={goalDate}
            onChange={e => { setGoalDate(e.target.value); saveGoal(goalWeight, e.target.value); }}
            className="w-full bg-[#12141e] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Manual active calories */}
        <div className="col-span-2">
          <label className="block text-xs text-slate-500 mb-1">
            Active calories burned today
            {today?.active_calories != null && (
              <span className="ml-1 text-slate-600">(Garmin: {today.active_calories.toLocaleString()})</span>
            )}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={manualCals}
              onChange={e => setManualCals(e.target.value)}
              placeholder={today?.active_calories != null ? String(today.active_calories) : 'e.g. 450'}
              className="w-full bg-[#12141e] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={logCalories}
              disabled={manualCals === '' || calSaving}
              className="px-3 py-2 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors whitespace-nowrap"
            >
              {calSaving ? '…' : 'Save'}
            </button>
          </div>
          {calSaved && <p className="text-xs text-emerald-400 mt-1">Saved!</p>}
          {calError && <p className="text-xs text-red-400 mt-1">{calError}</p>}
        </div>
      </div>

      {/* Result */}
      {ready ? (
        <div className="bg-[#12141e] rounded-xl p-4 space-y-2">
          {goalLbs > 0 && daysLeft > 0 && (
            <div className="flex justify-between text-sm text-slate-400 pb-2 border-b border-[#2a2d3a]">
              <span>
                {lbsToLose > 0
                  ? `${lbsToLose.toFixed(1)} lbs to lose`
                  : 'At or below goal'}
              </span>
              <span>{daysLeft} days left</span>
            </div>
          )}
          <div className="flex justify-between text-sm text-slate-400">
            <span>BMR (resting)</span>
            <span>{bmr.toLocaleString()} cal</span>
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>Active burn <span className="text-slate-600 text-xs">(50% of {activeCals > 0 ? activeCals.toLocaleString() : '0'})</span></span>
            <span>
              {activeCals > 0
                ? `+ ${Math.round(activeCals * ACTIVE_CAL_FACTOR).toLocaleString()} cal`
                : <span className="text-slate-600">+ 0 (enter above or syncing…)</span>
              }
            </span>
          </div>
          {deficit > 0 && (
            <div className="flex justify-between text-sm text-slate-400">
              <span>Daily deficit needed</span>
              <span>− {deficit.toLocaleString()} cal</span>
            </div>
          )}
          <div className="border-t border-[#2a2d3a] pt-2 mt-2 flex justify-between items-baseline">
            <span className="text-sm font-semibold text-slate-200">Eat today</span>
            <span className={`text-2xl font-bold ${toEatColor}`}>
              {toEat.toLocaleString()}
              <span className="text-sm font-normal text-slate-500 ml-1">cal</span>
            </span>
          </div>
          {deficitCapped && (
            <p className="text-xs text-yellow-500 mt-1">
              Required deficit ({rawDeficit.toLocaleString()} cal) exceeds safe limit — capped at 1,000 cal/day. Consider extending your goal date.
            </p>
          )}
          {toEat === 1200 && deficit > 0 && !deficitCapped && (
            <p className="text-xs text-yellow-500 mt-1">
              Floored at 1,200 cal minimum — consider extending your goal date.
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-600">Enter today's weight to see your calorie goal.</p>
      )}
    </div>
  );
}
