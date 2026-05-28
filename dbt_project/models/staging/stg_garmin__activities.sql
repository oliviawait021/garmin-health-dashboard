with source as (
    select * from {{ source('raw_garmin', 'activities') }}
),

renamed as (
    select
        (raw_data ->> 'activityId')::bigint                         as activity_id,
        activity_date,

        raw_data ->> 'activityType'                                 as activity_type_raw,
        -- Nested type key used in newer API versions
        coalesce(
            raw_data -> 'activityType' ->> 'typeKey',
            raw_data ->> 'activityType'
        )                                                           as activity_type,
        raw_data ->> 'activityName'                                 as activity_name,

        -- Timing
        (raw_data ->> 'startTimeLocal')::timestamp                 as start_time_local,
        (raw_data ->> 'duration')::numeric                         as duration_seconds,
        round((raw_data ->> 'duration')::numeric / 60, 1)          as duration_minutes,

        -- Distance
        (raw_data ->> 'distance')::numeric                         as distance_meters,
        round((raw_data ->> 'distance')::numeric / 1609.34, 2)     as distance_miles,

        -- Effort
        (raw_data ->> 'calories')::numeric::int                    as calories,
        (raw_data ->> 'averageHR')::numeric::int                   as avg_hr,
        (raw_data ->> 'maxHR')::numeric::int                       as max_hr,
        (raw_data ->> 'averageSpeed')::numeric                     as avg_speed_ms,

        -- Pace in min/mile (only meaningful for running/walking)
        case
            when (raw_data ->> 'distance')::numeric > 0
                 and (raw_data ->> 'duration')::numeric > 0
            then round(
                    (raw_data ->> 'duration')::numeric
                    / 60
                    / ((raw_data ->> 'distance')::numeric / 1609.34),
                 2)
        end                                                         as pace_min_per_mile,

        -- Elevation
        (raw_data ->> 'elevationGain')::numeric                    as elevation_gain_meters,

        ingested_at

    from source
)

select * from renamed
