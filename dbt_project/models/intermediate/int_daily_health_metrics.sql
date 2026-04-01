-- One row per calendar day.
-- Joins the four daily Garmin staging tables on date.
-- All four are left-joined so days where only some data arrived still appear.

with daily as (
    select * from {{ ref('stg_garmin__daily_summary') }}
),

sleep as (
    select * from {{ ref('stg_garmin__sleep') }}
),

hr as (
    select * from {{ ref('stg_garmin__heart_rate') }}
),

stress as (
    select * from {{ ref('stg_garmin__stress') }}
),

steps as (
    select * from {{ ref('stg_garmin__steps') }}
),

calories as (
    select * from {{ ref('stg_garmin__calories') }}
),

joined as (
    select
        -- Date spine from daily summary (most reliable source of dates)
        daily.summary_date                          as metric_date,

        -- Steps / distance (prefer steps model; fall back to daily summary)
        coalesce(steps.total_steps, daily.total_steps)      as total_steps,
        coalesce(steps.step_goal,   daily.step_goal)        as step_goal,
        daily.total_distance_meters,

        -- Calories (prefer intraday calories model; fall back to daily summary)
        daily.active_calories,
        daily.bmr_calories,
        coalesce(calories.total_calories, daily.total_calories) as total_calories,

        -- Heart rate
        coalesce(hr.resting_hr, daily.resting_heart_rate)   as resting_heart_rate,
        coalesce(hr.min_hr,     daily.min_heart_rate)       as min_heart_rate,
        coalesce(hr.max_hr,     daily.max_heart_rate)       as max_heart_rate,
        daily.avg_rhr_7d,

        -- Stress
        coalesce(stress.avg_stress, daily.avg_stress_level) as avg_stress,
        coalesce(stress.max_stress, daily.max_stress_level) as max_stress,
        stress.stress_duration_seconds,
        stress.rest_duration_seconds,

        -- Sleep
        sleep.total_sleep_seconds,
        sleep.total_sleep_hours,
        sleep.deep_sleep_seconds,
        sleep.light_sleep_seconds,
        sleep.rem_sleep_seconds,
        sleep.awake_seconds,
        sleep.sleep_score,
        sleep.sleep_quality,
        sleep.avg_spo2,
        sleep.avg_respiration,

        -- Floors / intensity
        daily.floors_climbed,
        daily.moderate_intensity_minutes,
        daily.vigorous_intensity_minutes,
        daily.intensity_minutes_weighted,

        -- Body battery
        daily.body_battery_start,
        daily.body_battery_end

    from daily
    left join sleep    on sleep.sleep_date       = daily.summary_date
    left join hr       on hr.hr_date             = daily.summary_date
    left join stress   on stress.stress_date     = daily.summary_date
    left join steps    on steps.steps_date       = daily.summary_date
    left join calories on calories.calories_date = daily.summary_date
)

select * from joined
