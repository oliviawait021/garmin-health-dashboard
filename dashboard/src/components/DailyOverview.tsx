import { DailyDashboardRow } from '@/lib/supabase';
import MetricCard from './MetricCard';

function stepsStatus(steps: number | null, goal: number | null): 'good' | 'moderate' | 'attention' | 'neutral' {
  if (!steps || !goal) return 'neutral';
  const pct = steps / goal;
  if (pct >= 1) return 'good';
  if (pct >= 0.7) return 'moderate';
  return 'attention';
}

function hrStatus(hr: number | null): 'good' | 'moderate' | 'attention' | 'neutral' {
  if (!hr) return 'neutral';
  if (hr <= 65) return 'good';
  if (hr <= 80) return 'moderate';
  return 'attention';
}

function sleepStatus(score: number | null): 'good' | 'moderate' | 'attention' | 'neutral' {
  if (!score) return 'neutral';
  if (score >= 80) return 'good';
  if (score >= 60) return 'moderate';
  return 'attention';
}

function stressStatus(stress: number | null): 'good' | 'moderate' | 'attention' | 'neutral' {
  if (!stress) return 'neutral';
  if (stress <= 25) return 'good';
  if (stress <= 50) return 'moderate';
  return 'attention';
}

interface Props { row: DailyDashboardRow | null; }

export default function DailyOverview({ row }: Props) {
  if (!row) {
    return <p className="text-slate-600 text-sm">No data available yet.</p>;
  }

  const sleepHours = row.total_sleep_hours
    ? `${Math.floor(row.total_sleep_hours)}h ${Math.round((row.total_sleep_hours % 1) * 60)}m`
    : null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard
        label="Steps"
        value={row.total_steps?.toLocaleString() ?? null}
        status={stepsStatus(row.total_steps, row.step_goal)}
        subtitle={row.step_goal ? `Goal: ${row.step_goal.toLocaleString()}` : undefined}
      />
      <MetricCard
        label="Resting HR"
        value={row.resting_heart_rate}
        unit="bpm"
        status={hrStatus(row.resting_heart_rate)}
        subtitle={row.avg_rhr_7d ? `7d avg: ${row.avg_rhr_7d}` : undefined}
      />
      <MetricCard
        label="Sleep"
        value={sleepHours}
        status={sleepStatus(row.sleep_score)}
        subtitle={row.sleep_score ? `Score: ${row.sleep_score}` : undefined}
      />
      <MetricCard
        label="Stress"
        value={row.avg_stress}
        unit="avg"
        status={stressStatus(row.avg_stress)}
        subtitle={row.max_stress ? `Max: ${row.max_stress}` : undefined}
      />
      <MetricCard
        label="Calories"
        value={row.active_calories?.toLocaleString() ?? null}
        unit="active"
        status="neutral"
        subtitle={row.total_calories ? `Total: ${row.total_calories.toLocaleString()}` : undefined}
      />
      <MetricCard
        label="Weight"
        value={row.weight_lbs ?? null}
        unit="lbs"
        status="neutral"
      />
    </div>
  );
}
