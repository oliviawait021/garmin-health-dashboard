with source as (
    select * from {{ source('raw_garmin', 'stress') }}
),

renamed as (
    select
        stress_date,

        (raw_data ->> 'overallStressLevel')::int        as avg_stress,
        (raw_data ->> 'maxStressLevel')::int            as max_stress,
        (raw_data ->> 'stressDuration')::int            as stress_duration_seconds,
        (raw_data ->> 'restDuration')::int              as rest_duration_seconds,
        (raw_data ->> 'activityStressDuration')::int    as activity_duration_seconds,
        (raw_data ->> 'lowStressDuration')::int         as low_stress_duration_seconds,
        (raw_data ->> 'mediumStressDuration')::int      as medium_stress_duration_seconds,
        (raw_data ->> 'highStressDuration')::int        as high_stress_duration_seconds,

        ingested_at

    from source
)

select * from renamed
