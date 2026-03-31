with source as (
    select * from {{ source('raw_garmin', 'heart_rate') }}
),

renamed as (
    select
        hr_date,

        (raw_data ->> 'restingHeartRate')::int              as resting_hr,
        (raw_data ->> 'minHeartRate')::int                  as min_hr,
        (raw_data ->> 'maxHeartRate')::int                  as max_hr,
        (raw_data ->> 'lastSevenDaysAvgRestingHeartRate')::int as avg_rhr_7d,

        -- Intraday series stored as JSONB array for downstream use
        raw_data -> 'heartRateValues'                       as hr_values_json,

        ingested_at

    from source
)

select * from renamed
