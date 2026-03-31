-- Weekly aggregations of all key health metrics.
-- Week starts on Monday (ISO week).

with daily as (
    select * from {{ ref('mart_daily_dashboard') }}
),

weekly as (
    select
        date_trunc('week', metric_date)::date           as week_start,
        count(*)                                        as days_with_data,

        -- Steps
        round(avg(total_steps))::int                    as avg_daily_steps,
        sum(total_steps)                                as total_steps,
        round(avg(total_distance_miles), 1)             as avg_daily_distance_miles,

        -- Calories
        round(avg(active_calories))::int                as avg_active_calories,
        round(avg(total_calories))::int                 as avg_total_calories,

        -- Heart rate
        round(avg(resting_heart_rate), 1)               as avg_resting_hr,
        min(min_heart_rate)                             as week_min_hr,
        max(max_heart_rate)                             as week_max_hr,

        -- Stress
        round(avg(avg_stress), 1)                       as avg_stress,
        round(avg(max_stress), 1)                       as avg_max_stress,

        -- Sleep
        round(avg(total_sleep_hours), 2)                as avg_sleep_hours,
        round(avg(sleep_score), 1)                      as avg_sleep_score,
        round(avg(deep_sleep_seconds) / 3600.0, 2)      as avg_deep_sleep_hours,
        round(avg(rem_sleep_seconds) / 3600.0, 2)       as avg_rem_sleep_hours,

        -- Weight (latest reading in the week)
        max(weight_lbs)                                 as latest_weight_lbs,
        round(avg(weight_lbs), 1)                       as avg_weight_lbs,

        -- Intensity
        sum(intensity_minutes_weighted)                 as total_intensity_minutes

    from daily
    group by 1
)

select * from weekly
order by week_start desc
