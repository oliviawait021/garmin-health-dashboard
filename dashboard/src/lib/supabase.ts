import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon);

// ── Type helpers ──────────────────────────────────────────────────────────────

export interface DailyDashboardRow {
  metric_date:             string;
  total_steps:             number | null;
  step_goal:               number | null;
  step_goal_pct:           number | null;
  total_distance_miles:    number | null;
  active_calories:         number | null;
  total_calories:          number | null;
  resting_heart_rate:      number | null;
  min_heart_rate:          number | null;
  max_heart_rate:          number | null;
  avg_rhr_7d:              number | null;
  avg_stress:              number | null;
  max_stress:              number | null;
  total_sleep_hours:       number | null;
  deep_sleep_seconds:      number | null;
  light_sleep_seconds:     number | null;
  rem_sleep_seconds:       number | null;
  awake_seconds:           number | null;
  sleep_score:             number | null;
  sleep_quality:           string | null;
  avg_spo2:                number | null;
  floors_climbed:          number | null;
  intensity_minutes_weighted: number | null;
  body_battery_start:      number | null;
  body_battery_end:        number | null;
  weight_lbs:              number | null;
  weight_notes:            string | null;
}

export interface WeightTrackerRow {
  weigh_date:       string;
  weight_lbs:       number;
  weight_7d_avg:    number | null;
  weight_30d_avg:   number | null;
  change_vs_7d_ago: number | null;
}

export interface ActivityRow {
  activity_id:        number;
  activity_date:      string;
  start_time_local:   string;
  activity_label:     string;
  activity_category:  string;
  activity_name:      string | null;
  duration_formatted: string;
  duration_minutes:   number;
  distance_miles:     number | null;
  calories:           number | null;
  avg_hr:             number | null;
  pace_min_per_mile:  number | null;
  elevation_gain_feet: number | null;
}

export interface WeeklyTrendRow {
  week_start:          string;
  avg_daily_steps:     number | null;
  avg_sleep_hours:     number | null;
  avg_resting_hr:      number | null;
  avg_stress:          number | null;
  avg_weight_lbs:      number | null;
  total_intensity_minutes: number | null;
}
