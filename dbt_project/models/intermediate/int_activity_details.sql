-- Enriched activity data joined with the seed reference table for
-- human-readable labels and calculated display fields.

with activities as (
    select * from {{ ref('stg_garmin__activities') }}
),

activity_types as (
    select * from {{ ref('activity_types') }}
),

enriched as (
    select
        a.activity_id,
        a.activity_date,
        a.start_time_local,
        a.activity_type,
        coalesce(t.display_name, initcap(replace(a.activity_type, '_', ' ')))
                                                            as activity_label,
        coalesce(t.category, 'Other')                       as activity_category,
        a.activity_name,

        -- Duration
        a.duration_seconds,
        a.duration_minutes,
        -- HH:MM:SS formatted string
        lpad((floor(a.duration_seconds / 3600))::text, 2, '0') || ':'
            || lpad((floor((a.duration_seconds % 3600) / 60))::text, 2, '0') || ':'
            || lpad((a.duration_seconds % 60)::text, 2, '0')
                                                            as duration_formatted,

        -- Distance
        a.distance_meters,
        a.distance_miles,

        -- Effort
        a.calories,
        a.avg_hr,
        a.max_hr,
        a.pace_min_per_mile,

        -- Elevation
        a.elevation_gain_meters,
        round(a.elevation_gain_meters * 3.28084, 0)         as elevation_gain_feet,

        a.ingested_at

    from activities a
    left join activity_types t on t.type_key = a.activity_type
)

select * from enriched
