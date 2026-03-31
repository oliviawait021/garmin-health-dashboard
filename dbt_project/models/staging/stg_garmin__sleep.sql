with source as (
    select * from {{ source('raw_garmin', 'sleep') }}
),

renamed as (
    select
        sleep_date,

        -- Overall durations (Garmin returns seconds)
        (raw_data -> 'dailySleepDTO' ->> 'sleepTimeSeconds')::int       as total_sleep_seconds,
        (raw_data -> 'dailySleepDTO' ->> 'deepSleepSeconds')::int       as deep_sleep_seconds,
        (raw_data -> 'dailySleepDTO' ->> 'lightSleepSeconds')::int      as light_sleep_seconds,
        (raw_data -> 'dailySleepDTO' ->> 'remSleepSeconds')::int        as rem_sleep_seconds,
        (raw_data -> 'dailySleepDTO' ->> 'awakeSleepSeconds')::int      as awake_seconds,

        -- Derived hours
        round(
            (raw_data -> 'dailySleepDTO' ->> 'sleepTimeSeconds')::numeric / 3600, 2
        )                                                                as total_sleep_hours,

        -- Sleep score & quality
        (raw_data -> 'dailySleepDTO' ->> 'sleepScores' -> 'overall' ->> 'value')::int
                                                                        as sleep_score,
        raw_data -> 'dailySleepDTO' ->> 'sleepScores' -> 'overall' ->> 'qualifierKey'
                                                                        as sleep_quality,

        -- Window
        (raw_data -> 'dailySleepDTO' ->> 'sleepStartTimestampGMT')::bigint  as sleep_start_epoch_ms,
        (raw_data -> 'dailySleepDTO' ->> 'sleepEndTimestampGMT')::bigint    as sleep_end_epoch_ms,

        -- Averages
        (raw_data -> 'dailySleepDTO' ->> 'averageSpO2Value')::numeric      as avg_spo2,
        (raw_data -> 'dailySleepDTO' ->> 'averageRespirationValue')::numeric as avg_respiration,
        (raw_data -> 'dailySleepDTO' ->> 'restlessMomentsCount')::int       as restless_moments,

        ingested_at

    from source
)

select * from renamed
