-- Per-activity-type aggregations + recent activity list.

with activities as (
    select * from {{ ref('int_activity_details') }}
),

-- Per-type summary (all time)
type_summary as (
    select
        activity_type,
        activity_label,
        activity_category,
        count(*)                                        as activity_count,
        round(sum(distance_miles), 1)                   as total_distance_miles,
        round(avg(distance_miles), 2)                   as avg_distance_miles,
        round(sum(duration_minutes), 0)::int            as total_duration_minutes,
        round(avg(duration_minutes), 1)                 as avg_duration_minutes,
        round(avg(avg_hr), 0)::int                      as avg_heart_rate,
        sum(calories)                                   as total_calories,
        round(avg(calories), 0)::int                    as avg_calories,
        min(activity_date)                              as first_activity_date,
        max(activity_date)                              as last_activity_date,

        -- PRs
        min(case when distance_miles > 0 then pace_min_per_mile end)
                                                        as best_pace_min_per_mile,
        max(distance_miles)                             as longest_distance_miles,
        max(elevation_gain_feet)                        as max_elevation_gain_feet

    from activities
    group by 1, 2, 3
),

-- Recent 50 activities (for the activity log table in the dashboard)
recent as (
    select
        activity_id,
        activity_date,
        start_time_local,
        activity_label,
        activity_category,
        activity_name,
        duration_formatted,
        duration_minutes,
        distance_miles,
        calories,
        avg_hr,
        pace_min_per_mile,
        elevation_gain_feet,
        row_number() over (order by activity_date desc, start_time_local desc) as recency_rank
    from activities
)

-- Return both result sets as separate models by using a union trick isn't
-- ideal; keep them as two separate mart models if you want both in SQL.
-- This model focuses on the recent log (most useful for the dashboard).

select
    activity_id,
    activity_date,
    start_time_local,
    activity_label,
    activity_category,
    activity_name,
    duration_formatted,
    duration_minutes,
    distance_miles,
    calories,
    avg_hr,
    pace_min_per_mile,
    elevation_gain_feet
from recent
where recency_rank <= 50
order by activity_date desc, start_time_local desc
