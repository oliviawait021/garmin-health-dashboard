'use client';

import { useState, useEffect } from 'react';
import { DailyDashboardRow } from '@/lib/supabase';

interface Props {
  today: DailyDashboardRow | null;
}

type Sex = 'female' | 'male';
type GoalRate = '2' | '1' | '0.5' | '0';

const GOAL_LABELS: Record<GoalRate, string> = {
  '2':   'Lose 2 lbs / week',
  '1':   'Lose 1 lb / week',
  '0.5': 'Lose 0.5 lbs / week',
  '0':   'Maintain weight',
};

const DEFICIT: Record<GoalRate, number> = {
  '2':   1000,
  '1':   500,
  '0.5': 250,
  '0':   0,
};

function calcBMR(weightLbs: number, heightFt: number, heightIn: number, age: number, sex: Sex): number {
  const weightKg = weightLbs * 0.453592;
  const heightCm = (heightFt * 12 + heightIn) * 2.54;
  // Mifflin-St Jeor
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export default function CalorieCalculator({ today }: Props) {
  const [sex,       setSex]       = useState<Sex>('female');
  const [age,       setAge]       = useState('');
  const [heightFt,  setHeightFt]  = useState('');
  const [heightIn,  setHeightIn]  = useState('');
  const [weight,    setWeight]    = useState('');
  const [goalRate,  setGoalRate]  = useState<GoalRate>('1');

  // Load persisted profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('calorie_profile');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.sex)      setSex(p.sex);
        if (p.age)      setAge(p.age);
        if (p.heightFt) setHeightFt(p.heightFt);
        if (p.heightIn) setHeightIn(p.heightIn);
        if (p.goalRate) setGoalRate(p.goalRate);
      } catch {}
    }
  }, []);

  // Pre-fill weight from latest Garmin data
  useEffect(() => {
    if (today?.weight_lbs) setWeight(String(today.weight_lbs));
  }, [today?.weight_lbs]);

  function saveProfile() {
    localStorage.setItem('calorie_profile', JSON.stringify({ sex, age, heightFt, heightIn, goalRate }));
  }

  const wLbs    = parseFloat(weight);
  const ageNum  = parseInt(age);
  const ftNum   = parseInt(heightFt);
  const inNum   = parseInt(heightIn) || 0;
  const ready   = wLbs > 0 && ageNum > 0 && ftNum > 0;

  let bmr         = 0;
  let activeCals  = 0;
  let tdee        = 0;
  let deficit     = 0;
  let toEat       = 0;

  if (ready) {
    bmr        = Math.round(calcBMR(wLbs, ftNum, inNum, ageNum, sex));
    activeCals = today?.active_calories ?? 0;
    tdee       = bmr + activeCals;
    deficit    = DEFICIT[goalRate];
    toEat      = Math.max(tdee - deficit, 1200); // floor at 1200 for safety
  }

  const toEatStatus = toEat > 0
    ? toEat < 1400 ? 'text-yellow-400' : 'text-emerald-400'
    : 'text-slate-500';

  return (
    <div className="bg-[#1a1d27] border border-[#2a2d3a] rounded-xl p-5 space-y-5">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        Daily Calorie Goal
      </h3>

      {/* Profile inputs */}
      <div className="grid grid-cols-2 gap-3">
        {/* Sex */}
        <div className="col-span-2 flex gap-2">
          {(['female', 'male'] as Sex[]).map(s => (
            <button
              key={s}
              onClick={() => { setSex(s); saveProfile(); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sex === s
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#12141e] text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {/* Age */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Age</label>
          <input
            type="number"
            value={age}
            onChange={e => setAge(e.target.value)}
            onBlur={saveProfile}
            placeholder="30"
            className="w-full bg-[#12141e] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">
            Weight (lbs)
            {today?.weight_lbs && <span className="text-slate-600 ml-1">· from Garmin</span>}
          </label>
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder="150"
            className="w-full bg-[#12141e] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Height */}
        <div>
          <label className="block text-xs text-slate-500 mb-1">Height (ft)</label>
          <input
            type="number"
            value={heightFt}
            onChange={e => setHeightFt(e.target.value)}
            onBlur={saveProfile}
            placeholder="5"
            className="w-full bg-[#12141e] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Height (in)</label>
          <input
            type="number"
            value={heightIn}
            onChange={e => setHeightIn(e.target.value)}
            onBlur={saveProfile}
            placeholder="6"
            className="w-full bg-[#12141e] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Goal */}
        <div className="col-span-2">
          <label className="block text-xs text-slate-500 mb-1">Goal</label>
          <select
            value={goalRate}
            onChange={e => { setGoalRate(e.target.value as GoalRate); saveProfile(); }}
            className="w-full bg-[#12141e] border border-[#2a2d3a] rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          >
            {(Object.keys(GOAL_LABELS) as GoalRate[]).map(k => (
              <option key={k} value={k}>{GOAL_LABELS[k]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Result */}
      {ready ? (
        <div className="bg-[#12141e] rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-slate-400">
            <span>BMR (resting)</span>
            <span>{bmr.toLocaleString()} cal</span>
          </div>
          <div className="flex justify-between text-sm text-slate-400">
            <span>Active burn today</span>
            <span>
              {activeCals > 0
                ? `+ ${activeCals.toLocaleString()} cal`
                : <span className="text-slate-600">+ 0 (no sync yet)</span>
              }
            </span>
          </div>
          {deficit > 0 && (
            <div className="flex justify-between text-sm text-slate-400">
              <span>Goal deficit</span>
              <span>− {deficit.toLocaleString()} cal</span>
            </div>
          )}
          <div className="border-t border-[#2a2d3a] pt-2 mt-2 flex justify-between items-baseline">
            <span className="text-sm font-semibold text-slate-200">Eat today</span>
            <span className={`text-2xl font-bold ${toEatStatus}`}>
              {toEat.toLocaleString()}
              <span className="text-sm font-normal text-slate-500 ml-1">cal</span>
            </span>
          </div>
          {toEat === 1200 && deficit > 0 && (
            <p className="text-xs text-yellow-500 mt-1">
              Floored at 1,200 cal minimum — consider a less aggressive deficit.
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-600">Fill in your profile above to see your daily calorie goal.</p>
      )}
    </div>
  );
}
