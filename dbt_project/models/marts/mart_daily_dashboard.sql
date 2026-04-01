-- Gold layer: one row per day, all metrics the dashboard needs.
-- This is the primary table read by the Next.js frontend.

with health as (
    select * from {{ ref('int_daily_health_metrics') }}
),

weight as (
    select * from {{ ref('stg_manual__weight') }}
),

manual_active_calories as (
    select * from {{ ref('stg_manual__active_calories') }}
),

final as (
    select
        h.metric_date,

        -- Steps
        h.total_steps,
        h.step_goal,
        case
            when h.step_goal > 0
            then round(h.total_steps::numeric / h.step_goal * 100, 1)
        end                                             as step_goal_pct,
        h.total_distance_meters,
        round(h.total_distance_meters / 1609.34, 2)    as total_distance_miles,

        -- Calories (manual override takes precedence over Garmin sync)
        coalesce(mac.active_calories, h.active_calories) as active_calories,
        h.bmr_calories,
        h.total_calories,

        -- Heart rate
        h.resting_heart_rate,
        h.min_heart_rate,
        h.max_heart_rate,
        h.avg_rhr_7d,

        -- Stress (0–100 scale)
        h.avg_stress,
        h.max_stress,
        h.stress_duration_seconds,
        h.rest_duration_seconds,

        -- Sleep
        h.total_sleep_seconds,
        h.total_sleep_hours,
        h.deep_sleep_seconds,
        h.light_sleep_seconds,
        h.rem_sleep_seconds,
        h.awake_seconds,
        h.sleep_score,
        h.sleep_quality,
        h.avg_spo2,
        h.avg_respiration,

        -- Floors / intensity
        h.floors_climbed,
        h.intensity_minutes_weighted,

        -- Body battery
        h.body_battery_start,
        h.body_battery_end,

        -- Weight (left-joined — may be null on days with no entry)
        w.weight_lbs,
        w.notes                                         as weight_notes

    from health h
    left join weight w              on w.weigh_date  = h.metric_date
    left join manual_active_calories mac on mac.entry_date = h.metric_date
)

select * from final
order by metric_date desc
